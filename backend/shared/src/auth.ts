import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

// Canonical roles — single source of truth (uppercase)
export const CANONICAL_ROLES = ['USER', 'DOCTOR', 'TRAINER', 'FARMER', 'DELIVERY', 'ADMIN'] as const;
export type CanonicalRole = typeof CANONICAL_ROLES[number];

// Normalize any role string to canonical uppercase, fallback to USER if invalid
export function normalizeRole(input?: string): CanonicalRole {
  if (!input) return 'USER';
  const upper = input.trim().toUpperCase();
  return (CANONICAL_ROLES as readonly string[]).includes(upper) ? upper as CanonicalRole : 'USER';
}

// For display/backward compat: title case
export function displayRole(role: CanonicalRole): string {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

export interface JwtPayload {
  sub: string;
  role: CanonicalRole;
  type: 'access';
  // legacy compat — old tokens had userId/email, new uses sub
  userId?: string;
  email?: string;
  isVerified?: boolean;
  status?: string;
}

export interface JwtRefreshPayload {
  sub: string;
  tokenId: string;
  type: 'refresh';
  // legacy compat
  userId?: string;
}

export function signToken(payload: JwtPayload, secret: string, expiresIn: string): string {
  // Minimal payload per spec 11: only sub, role, type — no email/health/financial
  const minimal: JwtPayload = { sub: (payload as any).sub || (payload as any).userId, role: normalizeRole(payload.role), type: 'access' };
  return jwt.sign(minimal as object, secret, { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] });
}

export function signRefreshToken(payload: JwtRefreshPayload, secret: string, expiresIn: string): string {
  const minimal: JwtRefreshPayload = { sub: (payload as any).sub || (payload as any).userId, tokenId: payload.tokenId, type: 'refresh' };
  return jwt.sign(minimal as object, secret, { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] });
}

export function verifyToken(token: string, secret: string): JwtPayload {
  const decoded = jwt.verify(token, secret) as any;
  const sub = decoded.sub || decoded.userId;
  if (!sub) throw new Error('Invalid token: missing sub');
  // Normalize and provide both sub and userId for backward compat
  const normalized: JwtPayload = {
    sub,
    role: normalizeRole(decoded.role),
    type: (decoded.type as 'access') || 'access',
    userId: sub,
    email: decoded.email,
    isVerified: decoded.isVerified,
    status: decoded.status,
  };
  return normalized;
}

export function verifyRefreshToken(token: string, secret: string): JwtRefreshPayload {
  const decoded = jwt.verify(token, secret) as any;
  const sub = decoded.sub || decoded.userId;
  if (!sub) throw new Error('Invalid refresh token');
  return { sub, tokenId: decoded.tokenId, type: 'refresh', userId: sub };
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export interface AuthUserContext {
  id: string;
  role: CanonicalRole;
  // minimal per spec 15 — do not attach entire DB user
  sub?: string;
  userId?: string; // alias for id for backward compat
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserContext & JwtPayload;
    }
  }
}

/**
 * Centralized authenticate middleware per spec 14
 * Flow: Extract -> Validate token + type -> Resolve user (DB) -> Check status -> Attach req.user {id, role}
 * Never trust client-supplied userId/role — always from token + DB
 */
export function authenticate(secret: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }
    let decoded: JwtPayload;
    try {
      decoded = verifyToken(header.slice(7), secret);
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    // Validate token type — must be access, not refresh
    if ((decoded as any).type && (decoded as any).type !== 'access') {
      return res.status(401).json({ error: 'Invalid token type' });
    }
    const userId = decoded.sub || decoded.userId;
    const role = normalizeRole(decoded.role);
    if (!userId) return res.status(401).json({ error: 'Invalid token payload' });

    // Resolve user from DB (source of truth) — never trust JWT alone for status/role changes
    try {
      // Lazy import to avoid circular deps — use dynamic pg check
      const { getPool, isPgAvailable, pgQuery } = await import('./pg.js');
      const { default: db } = await import('./db.js');
      let dbUser: any = null;
      if (getPool() && await isPgAvailable()) {
        const { rows } = await pgQuery(`SELECT id, role, status, is_verified as "isVerified" FROM users WHERE id=$1`, [userId]);
        dbUser = rows[0];
      } else {
        dbUser = db.collection('users').findById(userId) as any;
      }
      if (!dbUser) return res.status(401).json({ error: 'User not found' });
      const dbRole = normalizeRole(dbUser.role);
      const dbStatus = dbUser.status || 'ACTIVE';
      const dbVerified = dbUser.isVerified ?? dbUser.is_verified ?? true;
      if (dbStatus === 'SUSPENDED' || dbStatus === 'INACTIVE') {
        return res.status(403).json({ error: `Account ${dbStatus.toLowerCase()}`, code: dbStatus });
      }
      if (dbStatus === 'PENDING' || dbVerified === false) {
        // Allow /me and public, but block sensitive — let route's requireVerified handle, but attach status
      }
      // Attach minimal context per spec 15 — do not attach entire DB user
      const minimal: AuthUserContext & JwtPayload = {
        id: dbUser.id || userId,
        sub: dbUser.id || userId,
        userId: dbUser.id || userId,
        role: dbRole,
        type: 'access',
        status: dbStatus,
        isVerified: dbVerified,
      };
      (req as any).user = minimal;
      next();
    } catch (e: any) {
      console.error('[auth] authenticate resolve', e.message);
      // Fallback to JWT if DB unavailable — still attach minimal from token
      const minimal: AuthUserContext & JwtPayload = {
        id: userId,
        sub: userId,
        userId,
        role,
        type: 'access',
        status: decoded.status,
        isVerified: decoded.isVerified,
      };
      (req as any).user = minimal;
      next();
    }
  };
}

/** Alias for backward compat — now does full authenticate flow */
export function requireAuth(secret: string) {
  return authenticate(secret);
}

/** Middleware: restrict to one of the given canonical roles. */
export function requireRole(...roles: (CanonicalRole | string)[]) {
  const normalized = roles.map(r => normalizeRole(r as string));
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !normalized.includes(normalizeRole(req.user.role))) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    next();
  };
}

/** Middleware: require verified user */
export function requireVerified() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (req.user.isVerified === false) {
      return res.status(403).json({ error: 'Account pending verification', code: 'PENDING_VERIFICATION' });
    }
    if (req.user.status && ['SUSPENDED', 'INACTIVE'].includes(req.user.status)) {
      return res.status(403).json({ error: `Account ${req.user.status.toLowerCase()}`, code: req.user.status });
    }
    next();
  };
}
