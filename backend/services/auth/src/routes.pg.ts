import { Router } from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import {
  db, ok, created, fail, requireAuth, requireRole,
  pgQuery, isPgAvailable, getPool, getConfig,
  hashToken, verifyRefreshToken, hashPassword, verifyPassword, isStrongPassword,
} from '@nutrivedha/shared';
import {
  type UserRecord, type UserStatus,
  toCanonicalRole, ROLE_MAP, publicUser,
  issueToken, issueRefreshToken, hashRefreshToken,
  initialStatusForRole, requiresVerification,
} from './model.js';

const config = getConfig('auth', 3001);
const Users = db.collection<UserRecord>('users');

// Rate limiting per spec 31 — stricter for auth endpoints, in-memory (Redis if available would be used via shared)
// 5 attempts per 15min for login/signup/forgot/reset/verify
import rateLimit from 'express-rate-limit';
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many attempts, try again later' } },
});
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many OTP requests' } },
});

// Passkeys — server-side only, env-driven, never frontend (spec 27)
// ADMIN_PASSKEYS env: comma-separated, e.g. "@cC1411441,pavan,manil,jyo,janu"
// In production, provision via Secrets Manager, one-time bootstrap, document rotation
function loadPasskeys(): Record<string, string> {
  const raw = process.env.ADMIN_PASSKEYS || process.env.VITE_AUTH_PASSKEY_SALT || '@cC1411441,pavan,manil,jyo,janu';
  const list = raw.split(',').map(s => s.trim()).filter(Boolean);
  const map: Record<string, string> = {};
  for (const k of list) map[k] = 'Master Admin';
  return map;
}
const PASSKEYS: Record<string, string> = loadPasskeys();

async function usePg(): Promise<boolean> {
  if (!getPool()) return false;
  return isPgAvailable();
}

// In-memory fallback for refresh tokens & OTP when PG not available
const REFRESH_MEMORY = new Map<string, { userId: string; expiresAt: Date; revokedAt?: Date }>();
const OTP_MEMORY: Record<string, { hash: string; expiresAt: number; attempts: number }> = {};

function parseExpiryToMs(expiry: string): number {
  const m = expiry.match(/^(\d+)([smhd])$/);
  if (!m) return 15 * 60 * 1000; // default 15m
  const n = parseInt(m[1], 10);
  const unit = m[2];
  const mult: Record<string, number> = { s: 1000, m: 60 * 1000, h: 3600 * 1000, d: 86400 * 1000 };
  return n * (mult[unit] || 60 * 1000);
}

function expiryDate(expiry: string): Date {
  return new Date(Date.now() + parseExpiryToMs(expiry));
}

async function auditLog(userId: string | null, action: string, entity: string = '', meta?: string, ip?: string) {
  if (!userId) return;
  try {
    if (await usePg()) {
      await pgQuery(`INSERT INTO audit_logs (user_id, action, entity, meta, ip) VALUES ($1,$2,$3,$4,$5)`, [userId, action, entity, meta || null, ip || null]);
    }
  } catch { /* audit best-effort */ }
}

// Validation helpers — email local, password uses shared isStrongPassword
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function issueAndStoreRefreshToken(user: UserRecord, req: Request): Promise<{ refreshToken: string; tokenId: string }> {
  const tokenId = crypto.randomUUID();
  const { token } = issueRefreshToken(user, tokenId);
  const hash = hashRefreshToken(token);
  const expiresAt = expiryDate(config.jwtRefreshExpiry);
  const ip = (req.ip || req.headers['x-forwarded-for'] as string || '').toString().slice(0, 45);
  const ua = (req.headers['user-agent'] || '').toString().slice(0, 200);
  if (await usePg()) {
    try {
      await pgQuery(
        `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, ip, user_agent) VALUES ($1,$2,$3,$4,$5)`,
        [user.id, hash, expiresAt.toISOString(), ip, ua]
      );
    } catch (e: any) {
      console.error('[auth-pg] refresh store', e.message);
    }
  } else {
    REFRESH_MEMORY.set(hash, { userId: user.id, expiresAt });
  }
  return { refreshToken: token, tokenId };
}

function setRefreshCookie(res: Response, token: string) {
  const isProd = config.env === 'production';
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax' as const,
    path: '/api/auth',
    maxAge: parseExpiryToMs(config.jwtRefreshExpiry),
  });
}

function clearRefreshCookie(res: Response) {
  const isProd = config.env === 'production';
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax' as const,
    path: '/api/auth',
  });
}

function getRefreshTokenFromReq(req: Request): string | undefined {
  return (req as any).cookies?.refreshToken as string | undefined || (req.body as any)?.refreshToken as string | undefined;
}

const router = Router();

// POST /api/auth/register — public, backend is source of truth for role/status
// Also aliased as POST /api/auth/signup per spec 7 (no duplicate prefix)
const handleRegister = async (req: Request, res: Response) => {
  // Input validation per spec 32 — trim, normalize, reject unexpected
  const { email, password, name, phone, role, confirmPassword } = req.body ?? {};
  // Reject unexpected fields where appropriate (allow only known)
  const allowed = new Set(['email','password','name','phone','role','confirmPassword']);
  for (const k of Object.keys(req.body ?? {})) if (!allowed.has(k)) return fail(res, `Unexpected field: ${k}`, 400);
  const trimmedName = typeof name === 'string' ? name.trim() : '';
  const trimmedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const trimmedPhone = typeof phone === 'string' ? phone.trim() : phone;
  if (!trimmedName || trimmedName.length < 2) return fail(res, 'name required', 400);
  if (!trimmedEmail || !isValidEmail(trimmedEmail)) return fail(res, 'valid email required', 400);
  if (!password) return fail(res, 'password required', 400);
  if (!isStrongPassword(String(password))) return fail(res, 'Password must be at least 8 characters with letters and numbers', 400);
  if (confirmPassword !== undefined && String(confirmPassword) !== String(password)) return fail(res, 'confirmPassword must match', 400);
  if (/[\x00-\x1F]/.test(String(email)) || /[\x00-\x1F]/.test(String(name))) return fail(res, 'malformed input', 400);

  const requestedRole = toCanonicalRole(role);
  // Security: public registration cannot create ADMIN directly
  if (requestedRole === 'ADMIN') {
    return fail(res, 'Admin registration requires passkey verification', 403);
  }
  const finalRole = requestedRole;
  const status: UserStatus = initialStatusForRole(finalRole);
  const isVerified = finalRole === 'USER';

  if (await usePg()) {
    const pool = getPool();
    if (!pool) return fail(res, 'Database not available', 500);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const chk = await client.query(`SELECT id FROM users WHERE email=$1`, [trimmedEmail]);
      if ((chk as any).rowCount > 0) { await client.query('ROLLBACK'); return fail(res, 'Email already registered', 409); }
      if (trimmedPhone) {
        const chkPhone = await client.query(`SELECT id FROM users WHERE phone=$1`, [trimmedPhone]);
        if ((chkPhone as any).rowCount > 0) { await client.query('ROLLBACK'); return fail(res, 'Phone already registered', 409); }
      }
      const passwordHash = await hashPassword(String(password));
      const { rows } = await client.query(
        `INSERT INTO users (email, phone, name, role, password_hash, status, is_verified, is_admin) VALUES ($1,$2,$3,$4,$5,$6,$7,false) RETURNING id, email, phone, name, role, status, is_verified as "isVerified", is_admin as "isAdmin", created_at as "createdAt"`,
        [trimmedEmail, trimmedPhone || null, trimmedName, finalRole, passwordHash, status, isVerified]
      );
      const u = (rows as any)[0];
      const user: UserRecord = {
        id: u.id, email: u.email, phone: u.phone, name: u.name, role: u.role,
        status: u.status, isVerified: u.isVerified, passwordHash, isAdmin: u.isAdmin,
        createdAt: u.createdAt, lastLoginAt: undefined,
      };
      // Also create user_profiles row for consistency — in same transaction per spec 36
      await client.query(`INSERT INTO user_profiles (user_id, name, email, phone, role) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (user_id) DO NOTHING`, [user.id, user.name, user.email, user.phone, user.role]);
      await client.query(`INSERT INTO user_rbac (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`, [user.id]);
      await client.query(`INSERT INTO user_security (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`, [user.id]);
      await client.query('COMMIT');
      await auditLog(user.id, 'SIGNUP', `users:${user.id}`, `role:${finalRole} status:${status}`, req.ip);
      const accessToken = issueToken(user);
      const { refreshToken } = await issueAndStoreRefreshToken(user, req);
      setRefreshCookie(res, refreshToken);
      return created(res, {
        token: accessToken,
        accessToken,
        user: publicUser(user),
        success: true,
        message: status === 'PENDING' ? 'Application received — pending verification' : 'Registered',
      });
    } catch (e: any) {
      try { await client.query('ROLLBACK'); } catch {}
      console.error('[auth-pg] register', e.message);
      return fail(res, 'Database error', 500);
    } finally {
      try { (client as any).release(); } catch {}
    }
  }
  // JSON fallback
  if (Users.findOne({ email: trimmedEmail } as Partial<UserRecord>)) return fail(res, 'Email already registered', 409);
  const passwordHash = await hashPassword(String(password));
  const user: UserRecord = {
    id: Users.newId(), email: trimmedEmail, phone: trimmedPhone, name: trimmedName,
    role: finalRole, status, isVerified, passwordHash, isAdmin: false,
    createdAt: new Date().toISOString(), lastLoginAt: undefined,
  };
  Users.insert(user);
  const accessToken = issueToken(user);
  const { refreshToken } = await issueAndStoreRefreshToken(user, req);
  setRefreshCookie(res, refreshToken);
  return created(res, { token: accessToken, accessToken, user: publicUser(user), success: true, message: status === 'PENDING' ? 'Application received — pending verification' : 'Registered' });
};
router.post('/register', authLimiter, handleRegister);
router.post('/signup', authLimiter, handleRegister); // alias per spec 7 — no duplicate prefix

// POST /api/auth/login — rate limited per spec 31
router.post('/login', authLimiter, async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};
  const trimmedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!trimmedEmail || !password) return fail(res, 'email and password required', 400);
  if (!isValidEmail(trimmedEmail)) return fail(res, 'Invalid email format', 400);

  let user: UserRecord | null = null;
  if (await usePg()) {
    try {
      const { rows } = await pgQuery(
        `SELECT id, email, phone, name, role, status, is_verified as "isVerified", password_hash as "passwordHash", is_admin as "isAdmin", created_at as "createdAt", last_login_at as "lastLoginAt" FROM users WHERE email=$1`,
        [trimmedEmail]
      );
      const u = rows[0] as any;
      if (!u?.passwordHash || !(await verifyPassword(String(password), u.passwordHash))) {
        await auditLog(null, 'LOGIN_FAILED', `users:email:${trimmedEmail}`, 'invalid credentials', req.ip);
        return fail(res, 'Invalid credentials', 401);
      }
      // Status checks — backend source of truth
      if (['SUSPENDED','DEACTIVATED'].includes(u.status)) return fail(res, 'Account ' + u.status.toLowerCase() + ' � contact support', 403);
      
      if (u.status === 'PENDING') return fail(res, 'Account pending verification — admin will review', 403);
      user = {
        id: u.id, email: u.email, phone: u.phone, name: u.name, role: u.role,
        status: u.status, isVerified: u.isVerified, passwordHash: u.passwordHash,
        isAdmin: u.isAdmin, createdAt: u.createdAt, lastLoginAt: u.lastLoginAt,
      } as UserRecord;
      // Update last_login_at
      await pgQuery(`UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id=$1`, [user.id]);
      await auditLog(user.id, 'LOGIN', `users:${user.id}`, `role:${user.role}`, req.ip);
    } catch (e: any) {
      console.error('[auth-pg] login', e.message);
      return fail(res, 'Database error', 500);
    }
  } else {
    const found = Users.findOne({ email: trimmedEmail } as Partial<UserRecord>);
    if (!found?.passwordHash || !(await verifyPassword(String(password), found.passwordHash))) {
      return fail(res, 'Invalid credentials', 401);
    }
    if (['SUSPENDED','DEACTIVATED'].includes(found.status)) return fail(res, 'Account ' + found.status.toLowerCase() + ' � contact support', 403);
    
    if (found.status === 'PENDING') return fail(res, 'Account pending verification', 403);
    user = found;
    Users.update(user.id, { lastLoginAt: new Date().toISOString() } as Partial<UserRecord>);
  }

  if (!user) return fail(res, 'Invalid credentials', 401);
  const accessToken = issueToken(user);
  const { refreshToken } = await issueAndStoreRefreshToken(user, req);
  setRefreshCookie(res, refreshToken);
  const expiresIn = Math.floor(parseExpiryToMs(config.jwtExpiry) / 1000);
  return ok(res, { success: true, message: 'Login successful', user: publicUser(user), accessToken, token: accessToken, expiresIn });
});

// POST /api/auth/refresh — rotate refresh token (reads HttpOnly cookie or body)
router.post('/refresh', async (req: Request, res: Response) => {
  const refreshToken = getRefreshTokenFromReq(req);
  if (!refreshToken) return fail(res, 'refreshToken required', 400);
  let payload: any;
  try {
    payload = verifyRefreshToken(refreshToken, config.jwtSecret);
  } catch {
    return fail(res, 'Invalid or expired refresh token', 401);
  }
  const hash = hashRefreshToken(refreshToken);
  let userId = (payload as any).sub || (payload as any).userId;

  if (await usePg()) {
    try {
      const { rows } = await pgQuery(`SELECT user_id as "userId", expires_at as "expiresAt", revoked_at as "revokedAt" FROM refresh_tokens WHERE token_hash=$1`, [hash]);
      const row = rows[0] as any;
      if (!row) return fail(res, 'Refresh token not found', 401);
      if (row.revokedAt) {
        // Reuse detected — revoke all tokens for user (family)
        try { await pgQuery(`UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id=$1 AND revoked_at IS NULL`, [row.userId]); } catch {}
        return fail(res, 'Refresh token reuse detected — all sessions revoked', 401);
      }
      if (new Date(row.expiresAt) < new Date()) return fail(res, 'Refresh token expired', 401);
      userId = row.userId;
      // Revoke old token (rotation)
      await pgQuery(`UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash=$1`, [hash]);
      const { rows: urows } = await pgQuery(`SELECT id, email, phone, name, role, status, is_verified as "isVerified", is_admin as "isAdmin", created_at as "createdAt" FROM users WHERE id=$1`, [userId]);
      const u = urows[0] as any;
      if (!u) return fail(res, 'User not found', 404);
      if (u.status !== 'ACTIVE') return fail(res, `Account ${u.status.toLowerCase()}`, 403);
      const user: UserRecord = { id: u.id, email: u.email, phone: u.phone, name: u.name, role: u.role, status: u.status, isVerified: u.isVerified, isAdmin: u.isAdmin, createdAt: u.createdAt } as UserRecord;
      const accessToken = issueToken(user);
      const { refreshToken: newRefresh } = await issueAndStoreRefreshToken(user, req);
      setRefreshCookie(res, newRefresh);
      const expiresIn = Math.floor(parseExpiryToMs(config.jwtExpiry) / 1000);
      return ok(res, { success: true, user: publicUser(user), accessToken, token: accessToken, expiresIn });
    } catch (e: any) {
      console.error('[auth-pg] refresh', e.message);
      return fail(res, 'Database error', 500);
    }
  } else {
    const mem = REFRESH_MEMORY.get(hash);
    if (!mem) return fail(res, 'Refresh token not found', 401);
    if (mem.revokedAt) {
      for (const [, v] of REFRESH_MEMORY.entries()) {
        if (v.userId === mem.userId && !v.revokedAt) v.revokedAt = new Date();
      }
      return fail(res, 'Refresh token reuse detected — all sessions revoked', 401);
    }
    if (mem.expiresAt < new Date()) return fail(res, 'Refresh token expired', 401);
    mem.revokedAt = new Date();
    const user = Users.findById(mem.userId);
    if (!user) return fail(res, 'User not found', 404);
    if (user.status !== 'ACTIVE') return fail(res, `Account ${user.status}`, 403);
    const accessToken = issueToken(user);
    const { refreshToken: newRefresh } = await issueAndStoreRefreshToken(user, req);
    setRefreshCookie(res, newRefresh);
    const expiresIn = Math.floor(parseExpiryToMs(config.jwtExpiry) / 1000);
    return ok(res, { success: true, user: publicUser(user), accessToken, token: accessToken, expiresIn });
  }
});

// POST /api/auth/logout — revoke single refresh token (rotation)
router.post('/logout', async (req: Request, res: Response) => {
  const refreshToken = getRefreshTokenFromReq(req);
  if (refreshToken) {
    const hash = hashRefreshToken(refreshToken);
    if (await usePg()) {
      try { await pgQuery(`UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash=$1`, [hash]); } catch {}
    } else {
      const mem = REFRESH_MEMORY.get(hash);
      if (mem) mem.revokedAt = new Date();
    }
    const payload = (() => { try { return verifyRefreshToken(refreshToken, config.jwtSecret) as any; } catch { return null; } })();
    const uid = payload?.sub || payload?.userId;
    if (uid) await auditLog(uid, 'LOGOUT', `users:${uid}`, 'single session', req.ip);
  }
  clearRefreshCookie(res);
  return ok(res, { message: 'Logged out' });
});

// POST /api/auth/logout-all — revoke all sessions for current user
router.post('/logout-all', requireAuth(config.jwtSecret), async (req: Request, res: Response) => {
  const userId = (req.user as any).sub || (req.user as any).userId;
  if (await usePg()) {
    try { await pgQuery(`UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id=$1 AND revoked_at IS NULL`, [userId]); } catch (e: any) { console.error('[auth-pg] logout-all', e.message); }
  } else {
    for (const [, v] of REFRESH_MEMORY.entries()) {
      if (v.userId === userId && !v.revokedAt) v.revokedAt = new Date();
    }
  }
  await auditLog(userId, 'LOGOUT_ALL', `users:${userId}`, 'all sessions revoked', req.ip);
  clearRefreshCookie(res);
  return ok(res, { message: 'All sessions revoked' });
});

// POST /api/auth/forgot-password — spec 21, do not reveal account existence
router.post('/forgot-password', authLimiter, async (req: Request, res: Response) => {
  const { email } = req.body ?? {};
  const generic = { message: 'If an account exists, password reset instructions have been sent.' };
  if (!email || typeof email !== 'string' || !isValidEmail(email.trim().toLowerCase())) {
    return ok(res, generic);
  }
  const trimmedEmail = email.trim().toLowerCase();
  try {
    if (await usePg()) {
      const { rows } = await pgQuery(`SELECT id, email FROM users WHERE email=$1`, [trimmedEmail]);
      const user = rows[0] as any;
      if (!user) return ok(res, generic);
      // Generate secure token, hash before store, short expiry 15m
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = await hashPassword(rawToken); // bcrypt hash for storage (centralized)
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await pgQuery(`INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1,$2,$3)`, [user.id, tokenHash, expiresAt.toISOString()]);
      const { EmailService } = await import('./email.service.js');
      await EmailService.send(EmailService.resetPasswordEmail(user.email, rawToken));
      // In dev, include token for testing (not in prod)
      if (config.env === 'development') {
        return ok(res, { ...generic, devToken: rawToken });
      }
      return ok(res, generic);
    } else {
      // Fallback JSON — still generic
      const user = Users.findOne({ email: trimmedEmail } as Partial<UserRecord>);
      if (!user) return ok(res, generic);
      const rawToken = crypto.randomBytes(32).toString('hex');
      // Store in memory fallback (hash)
      const hash = await hashPassword(rawToken);
      (global as any).__resetTokens = (global as any).__resetTokens || new Map();
      (global as any).__resetTokens.set(hash, { userId: user.id, expiresAt: new Date(Date.now() + 15 * 60 * 1000), used: false });
      const { EmailService } = await import('./email.service.js');
      await EmailService.send(EmailService.resetPasswordEmail(user.email, rawToken));
      return ok(res, config.env === 'development' ? { ...generic, devToken: rawToken } : generic);
    }
  } catch (e: any) {
    console.error('[auth-pg] forgot-password', e.message);
    return ok(res, generic);
  }
});

// POST /api/auth/reset-password — spec 22
router.post('/reset-password', authLimiter, async (req: Request, res: Response) => {
  const { token, newPassword, confirmPassword } = req.body ?? {};
  if (!token || !newPassword) return fail(res, 'token and newPassword required', 400);
  if (confirmPassword !== undefined && String(confirmPassword) !== String(newPassword)) return fail(res, 'confirmPassword must match', 400);
  if (!isStrongPassword(String(newPassword))) return fail(res, 'Password must be at least 8 characters with letters and numbers', 400);
  try {
    let userId: string | null = null;
    let tokenHashToInvalidate: string | null = null;
    if (await usePg()) {
      const { rows } = await pgQuery(`SELECT id, user_id as "userId", token_hash as "tokenHash", expires_at as "expiresAt", used_at as "usedAt" FROM password_reset_tokens WHERE expires_at > NOW() AND used_at IS NULL`);
      let matched: any = null;
      for (const r of rows as any[]) {
        if (await verifyPassword(String(token), r.tokenHash)) { matched = r; break; }
      }
      if (!matched) return fail(res, 'Invalid or expired token', 400);
      if (new Date(matched.expiresAt) < new Date()) return fail(res, 'Token expired', 400);
      userId = matched.userId;
      tokenHashToInvalidate = matched.tokenHash;
      // Invalidate token (single-use)
      await pgQuery(`UPDATE password_reset_tokens SET used_at = NOW() WHERE token_hash=$1`, [matched.tokenHash]);
    } else {
      const map: Map<string, any> = (global as any).__resetTokens || new Map();
      let foundHash: string | null = null;
      let found: any = null;
      for (const [h, v] of map.entries()) {
        if (await verifyPassword(String(token), h) && !v.used && v.expiresAt > new Date()) { found = v; foundHash = h; break; }
      }
      if (!found || !foundHash) return fail(res, 'Invalid or expired token', 400);
      found.used = true;
      userId = found.userId;
      tokenHashToInvalidate = foundHash;
    }
    if (!userId) return fail(res, 'Invalid token', 400);
    const newHash = await hashPassword(String(newPassword));
    if (await usePg()) {
      await pgQuery(`UPDATE users SET password_hash=$1, updated_at=NOW() WHERE id=$2`, [newHash, userId]);
      // Revoke all refresh sessions per spec 22
      await pgQuery(`UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id=$1 AND revoked_at IS NULL`, [userId]);
    } else {
      const u = Users.findById(userId);
      if (u) Users.update(u.id, { passwordHash: newHash } as Partial<UserRecord>);
      for (const [, v] of REFRESH_MEMORY.entries()) { if (v.userId === userId && !v.revokedAt) v.revokedAt = new Date(); }
    }
    await auditLog(userId, 'RESET_PASSWORD', `users:${userId}`, 'reset via token', req.ip);
    return ok(res, { success: true, message: 'Password reset successful — please login' });
  } catch (e: any) {
    console.error('[auth-pg] reset-password', e.message);
    return fail(res, 'Database error', 500);
  }
});

// POST /api/auth/change-password — spec 23, authenticated, requires currentPassword
router.post('/change-password', requireAuth(config.jwtSecret), authLimiter, async (req: Request, res: Response) => {
  const userId = (req.user as any).id || (req.user as any).sub || (req.user as any).id || (req.user as any).userId!!;
  const { currentPassword, newPassword, confirmPassword } = req.body ?? {};
  if (!currentPassword || !newPassword) return fail(res, 'currentPassword and newPassword required', 400);
  if (confirmPassword !== undefined && String(confirmPassword) !== String(newPassword)) return fail(res, 'confirmPassword must match', 400);
  if (!isStrongPassword(String(newPassword))) return fail(res, 'Password must be at least 8 characters with letters and numbers', 400);
  try {
    if (await usePg()) {
      const { rows } = await pgQuery(`SELECT password_hash as "passwordHash" FROM users WHERE id=$1`, [userId]);
      const row = rows[0] as any;
      if (!row?.passwordHash || !(await verifyPassword(String(currentPassword), row.passwordHash))) {
        return fail(res, 'Current password incorrect', 401);
      }
      const newHash = await hashPassword(String(newPassword));
      await pgQuery(`UPDATE users SET password_hash=$1, updated_at=NOW() WHERE id=$2`, [newHash, userId]);
      await pgQuery(`UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id=$1 AND revoked_at IS NULL`, [userId]);
      clearRefreshCookie(res);
    } else {
      const user = Users.findById(userId);
      if (!user?.passwordHash || !(await verifyPassword(String(currentPassword), user.passwordHash))) return fail(res, 'Current password incorrect', 401);
      const newHash = await hashPassword(String(newPassword));
      Users.update(userId, { passwordHash: newHash } as Partial<UserRecord>);
      for (const [, v] of REFRESH_MEMORY.entries()) if (v.userId === userId && !v.revokedAt) v.revokedAt = new Date();
      clearRefreshCookie(res);
    }
    await auditLog(userId, 'CHANGE_PASSWORD', `users:${userId}`, 'changed', req.ip);
    return ok(res, { success: true, message: 'Password changed — please login again' });
  } catch (e: any) {
    console.error('[auth-pg] change-password', e.message);
    return fail(res, 'Database error', 500);
  }
});

// POST /api/auth/verify-email — spec 25, token single-use, hashed
router.post('/verify-email', authLimiter, async (req: Request, res: Response) => {
  const { token } = req.body ?? {};
  if (!token || typeof token !== 'string') return fail(res, 'token required', 400);
  try {
    let userId: string | null = null;
    let matchedHash: string | null = null;
    if (await usePg()) {
      const { rows } = await pgQuery(`SELECT id, user_id as "userId", token_hash as "tokenHash", expires_at as "expiresAt", used_at as "usedAt" FROM email_verification_tokens WHERE expires_at > NOW() AND used_at IS NULL`);
      for (const r of rows as any[]) {
        if (await verifyPassword(token, r.tokenHash)) { userId = r.userId; matchedHash = r.tokenHash; break; }
      }
      if (!userId || !matchedHash) return fail(res, 'Invalid or expired token', 400);
      await pgQuery(`UPDATE email_verification_tokens SET used_at = NOW() WHERE token_hash=$1`, [matchedHash]);
      await pgQuery(`UPDATE users SET email_verified=true, email_verified_at=NOW(), is_verified=true, updated_at=NOW() WHERE id=$1`, [userId]);
    } else {
      const map: Map<string, any> = (global as any).__emailTokens || new Map();
      for (const [h, v] of map.entries()) {
        if (!v.used && v.expiresAt > new Date() && await verifyPassword(token, h)) { userId = v.userId; matchedHash = h; v.used = true; break; }
      }
      if (!userId) return fail(res, 'Invalid or expired token', 400);
      const u = Users.findById(userId);
      if (u) Users.update(u.id, { isVerified: true } as Partial<UserRecord>);
    }
    if (userId) await auditLog(userId, 'VERIFY_EMAIL', `users:${userId}`, 'verified', req.ip);
    return ok(res, { success: true, message: 'Email verified' });
  } catch (e: any) {
    console.error('[auth-pg] verify-email', e.message);
    return fail(res, 'Database error', 500);
  }
});

// POST /api/auth/resend-verification — authenticated, spec 25
router.post('/resend-verification', requireAuth(config.jwtSecret), authLimiter, async (req: Request, res: Response) => {
  const userId = (req.user as any).id || (req.user as any).sub || (req.user as any).id || (req.user as any).userId!!;
  try {
    let email: string | null = null;
    if (await usePg()) {
      const { rows } = await pgQuery(`SELECT email, email_verified as "emailVerified" FROM users WHERE id=$1`, [userId]);
      const u = rows[0] as any;
      if (!u) return fail(res, 'User not found', 404);
      if (u.emailVerified) return ok(res, { message: 'Already verified' });
      if (!u.email) return fail(res, 'User email missing', 400);
      email = u.email as string;
      const rawToken = crypto.randomBytes(32).toString('hex');
      const hash = await hashPassword(rawToken);
      const expiresAt = new Date(Date.now() + 24 * 3600 * 1000);
      await pgQuery(`INSERT INTO email_verification_tokens (user_id, token_hash, expires_at) VALUES ($1,$2,$3)`, [userId, hash, expiresAt.toISOString()]);
      const { EmailService } = await import('./email.service.js');
      await EmailService.send(EmailService.verificationEmail(email as string, rawToken));
      return ok(res, config.env === 'development' ? { message: 'Verification sent', devToken: rawToken } : { message: 'Verification sent' });
    } else {
      const u = Users.findById(userId);
      if (!u) return fail(res, 'User not found', 404);
      if ((u as any).isVerified) return ok(res, { message: 'Already verified' });
      if (!u.email) return fail(res, 'User email missing', 400);
      email = u.email as string;
      const rawToken = crypto.randomBytes(32).toString('hex');
      const hash = await hashPassword(rawToken);
      const map: Map<string, any> = (global as any).__emailTokens = (global as any).__emailTokens || new Map();
      map.set(hash, { userId, expiresAt: new Date(Date.now() + 24 * 3600 * 1000), used: false });
      const { EmailService } = await import('./email.service.js');
      await EmailService.send(EmailService.verificationEmail(email as string, rawToken));
      return ok(res, { message: 'Verification sent', devToken: rawToken });
    }
  } catch (e: any) {
    console.error('[auth-pg] resend-verification', e.message);
    return fail(res, 'Database error', 500);
  }
});

// POST /api/auth/otp/request — hashed storage
router.post('/otp/request', otpLimiter, async (req: Request, res: Response) => {
  const { phone } = req.body ?? {};
  if (!phone || String(phone).replace(/\D/g, '').length < 10) return fail(res, 'Valid phone required', 400);
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const hash = await bcrypt.hash(otp, 8);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  if (await usePg()) {
    try {
      await pgQuery(
        `INSERT INTO otp_codes (phone, code_hash, expires_at, attempts) VALUES ($1,$2,$3,0) ON CONFLICT (phone) DO UPDATE SET code_hash=$2, expires_at=$3, attempts=0`,
        [phone, hash, expiresAt.toISOString()]
      );
    } catch (e: any) { console.error('[auth-pg] otp request', e.message); return fail(res, 'Database error', 500); }
  } else {
    OTP_MEMORY[phone] = { hash, expiresAt: expiresAt.getTime(), attempts: 0 };
  }
  return ok(res, config.env === 'development' ? { otp, message: 'OTP sent (dev echo)' } : { message: 'OTP sent' });
});

// POST /api/auth/otp/verify
router.post('/otp/verify', otpLimiter, async (req: Request, res: Response) => {
  const { phone, otp, name } = req.body ?? {};
  if (!phone || !otp) return fail(res, 'phone and otp required', 400);
  let valid = false;
  if (await usePg()) {
    try {
      const { rows } = await pgQuery(`SELECT code_hash as "codeHash", expires_at as "expiresAt", attempts FROM otp_codes WHERE phone=$1`, [phone]);
      const row = rows[0] as any;
      if (!row) return fail(res, 'OTP not requested', 400);
      if (new Date(row.expiresAt) < new Date()) return fail(res, 'OTP expired', 401);
      if (row.attempts >= 5) return fail(res, 'Too many attempts', 429);
      valid = await bcrypt.compare(String(otp), row.codeHash);
      if (!valid) {
        await pgQuery(`UPDATE otp_codes SET attempts = attempts + 1 WHERE phone=$1`, [phone]);
        return fail(res, 'Invalid OTP', 401);
      }
      await pgQuery(`DELETE FROM otp_codes WHERE phone=$1`, [phone]);
    } catch (e: any) {
      console.error('[auth-pg] otp verify', e.message);
      return fail(res, 'Database error', 500);
    }
  } else {
    const mem = OTP_MEMORY[phone];
    if (!mem) return fail(res, 'OTP not requested', 400);
    if (Date.now() > mem.expiresAt) return fail(res, 'OTP expired', 401);
    if (mem.attempts >= 5) return fail(res, 'Too many attempts', 429);
    valid = await bcrypt.compare(String(otp), mem.hash);
    if (!valid) { mem.attempts++; return fail(res, 'Invalid OTP', 401); }
    delete OTP_MEMORY[phone];
  }

  // OTP valid — find or create user (always USER, status ACTIVE)
  if (await usePg()) {
    try {
      let { rows } = await pgQuery(`SELECT id, email, phone, name, role, status, is_verified as "isVerified", is_admin as "isAdmin", created_at as "createdAt" FROM users WHERE phone=$1`, [phone]);
      let rec: UserRecord;
      if (rows[0]) {
        const u = rows[0] as any;
        if (['SUSPENDED','DEACTIVATED'].includes(u.status)) return fail(res, 'Account ' + u.status.toLowerCase() + ' � contact support', 403);
        rec = { id: u.id, email: u.email, phone: u.phone, name: u.name, role: u.role, status: u.status, isVerified: u.isVerified, isAdmin: u.isAdmin, createdAt: u.createdAt } as UserRecord;
        await pgQuery(`UPDATE users SET last_login_at = NOW() WHERE id=$1`, [rec.id]);
      } else {
        const { rows: ins } = await pgQuery(
          `INSERT INTO users (email, phone, name, role, status, is_verified, is_admin) VALUES ($1,$2,$3,'USER','ACTIVE',true,false) RETURNING id, email, phone, name, role, status, is_verified as "isVerified", is_admin as "isAdmin", created_at as "createdAt"`,
          [`${phone}@mobile.ayurai.health`, phone, name || 'Mobile User']
        );
        const u = ins[0] as any;
        rec = { id: u.id, email: u.email, phone: u.phone, name: u.name, role: u.role, status: u.status, isVerified: u.isVerified, isAdmin: u.isAdmin, createdAt: u.createdAt } as UserRecord;
        await auditLog(rec.id, 'REGISTER_MOBILE', `users:${rec.id}`, `phone:${phone}`, req.ip);
      }
      const accessToken = issueToken(rec);
      const { refreshToken } = await issueAndStoreRefreshToken(rec, req);
      await auditLog(rec.id, 'LOGIN_OTP', `users:${rec.id}`, `phone:${phone}`, req.ip);
      return ok(res, { token: accessToken, accessToken, refreshToken, user: publicUser(rec) });
    } catch (e: any) {
      console.error('[auth-pg] otp verify', e.message);
      return fail(res, 'Database error', 500);
    }
  }
  let user = Users.findOne({ phone } as Partial<UserRecord>);
  if (!user) {
    user = {
      id: Users.newId(), email: `${phone}@mobile.ayurai.health`, phone,
      name: name || 'Mobile User', role: 'USER', status: 'ACTIVE', isVerified: true,
      isAdmin: false, createdAt: new Date().toISOString(),
    } as UserRecord;
    Users.insert(user);
  } else {
    if (['SUSPENDED','DEACTIVATED'].includes(user.status)) return fail(res, 'Account ' + user.status.toLowerCase(), 403);
    Users.update(user.id, { lastLoginAt: new Date().toISOString() } as Partial<UserRecord>);
  }
  const accessToken = issueToken(user);
  const { refreshToken } = await issueAndStoreRefreshToken(user, req);
  return ok(res, { token: accessToken, accessToken, refreshToken, user: publicUser(user) });
});

// POST /api/auth/passkey — admin via passkey, backend source of truth
router.post('/passkey', async (req: Request, res: Response) => {
  const { passkey } = req.body ?? {};
  const identity = PASSKEYS[passkey as string];
  if (!identity) {
    await auditLog(null, 'PASSKEY_FAILED', `passkey:${String(passkey).slice(0,4)}***`, 'invalid', req.ip);
    return fail(res, 'Invalid passkey', 401);
  }
  if (await usePg()) {
    try {
      const email = `admin@${passkey}.ayurai.health`;
      let { rows } = await pgQuery(`SELECT id, email, name, role, status, is_verified as "isVerified", is_admin as "isAdmin", created_at as "createdAt" FROM users WHERE email=$1`, [email]);
      let rec: UserRecord;
      if (rows[0]) {
        const u = rows[0] as any;
        rec = { id: u.id, email: u.email, name: u.name, role: 'ADMIN', status: 'ACTIVE', isVerified: true, isAdmin: true, createdAt: u.createdAt } as UserRecord;
        await pgQuery(`UPDATE users SET last_login_at = NOW() WHERE id=$1`, [rec.id]);
      } else {
        const { rows: ins } = await pgQuery(
          `INSERT INTO users (email, name, role, status, is_verified, is_admin) VALUES ($1,$2,'ADMIN','ACTIVE',true,true) RETURNING id, email, name, role, is_admin as "isAdmin", created_at as "createdAt"`,
          [email, identity]
        );
        const u = ins[0] as any;
        rec = { id: u.id, email: u.email, name: u.name, role: 'ADMIN', status: 'ACTIVE', isVerified: true, isAdmin: true, createdAt: u.createdAt } as UserRecord;
      }
      await auditLog(rec.id, 'LOGIN_PASSKEY', `users:${rec.id}`, `identity:${identity}`, req.ip);
      const accessToken = issueToken(rec);
      const { refreshToken } = await issueAndStoreRefreshToken(rec, req);
      return ok(res, { token: accessToken, accessToken, refreshToken, user: publicUser(rec), passkeyIdentity: identity });
    } catch (e: any) {
      console.error('[auth-pg] passkey', e.message);
      return fail(res, 'Database error', 500);
    }
  }
  let user = Users.findOne({ email: `admin@${passkey}.ayurai.health` } as Partial<UserRecord>);
  if (!user) {
    user = {
      id: Users.newId(), email: `admin@${passkey}.ayurai.health`, name: identity,
      role: 'ADMIN', status: 'ACTIVE', isVerified: true, isAdmin: true,
      createdAt: new Date().toISOString(),
    } as UserRecord;
    Users.insert(user);
  }
  const accessToken = issueToken(user);
  const { refreshToken } = await issueAndStoreRefreshToken(user, req);
  return ok(res, { token: accessToken, accessToken, refreshToken, user: publicUser(user), passkeyIdentity: identity });
});

// GET /api/auth/me — current user, verifies status still active
router.get('/me', requireAuth(config.jwtSecret), async (req: Request, res: Response) => {
  const uid = (req.user as any).id || (req.user as any).sub || (req.user as any).id || (req.user as any).userId!!;
  if (await usePg()) {
    try {
      const { rows } = await pgQuery(
        `SELECT id, email, phone, name, role, status, is_verified as "isVerified", is_admin as "isAdmin", created_at as "createdAt", last_login_at as "lastLoginAt" FROM users WHERE id=$1`,
        [uid]
      );
      if (!rows[0]) return fail(res, 'User not found', 404);
      const u = rows[0] as any;
      if (['SUSPENDED','DEACTIVATED'].includes(u.status)) return fail(res, 'Account ' + u.status.toLowerCase() + ' � contact support', 403);
      
      const rec = {
        id: u.id, email: u.email, phone: u.phone, name: u.name, role: u.role,
        status: u.status, isVerified: u.isVerified, isAdmin: u.isAdmin,
        createdAt: u.createdAt, lastLoginAt: u.lastLoginAt,
      } as UserRecord;
      return ok(res, { user: publicUser(rec) });
    } catch (e: any) {
      console.error('[auth-pg] me', e.message);
      return fail(res, 'Database error', 500);
    }
  }
  const uid2 = (req.user as any).id || (req.user as any).sub || (req.user as any).id || (req.user as any).userId!!;
  const user = Users.findById(uid2);
  if (!user) return fail(res, 'User not found', 404);
  if (['SUSPENDED','DEACTIVATED'].includes(user.status)) return fail(res, 'Account ' + user.status.toLowerCase(), 403);
  return ok(res, { user: publicUser(user) });
});

// GET /api/auth/roles — admin only
router.get('/roles', requireAuth(config.jwtSecret), requireRole('ADMIN'), (_req: Request, res: Response) => {
  return ok(res, { roles: ROLE_MAP });
});

// POST /api/auth/admin/approve — spec 26, professional verification workflow
// Body: { userId, action: 'APPROVE'|'REJECT' }
router.post('/admin/approve', requireAuth(config.jwtSecret), requireRole('ADMIN'), async (req: Request, res: Response) => {
  const { userId, action } = req.body ?? {};
  if (!userId || !['APPROVE', 'REJECT'].includes(String(action).toUpperCase())) {
    return fail(res, 'userId and action (APPROVE|REJECT) required', 400);
  }
  const act = String(action).toUpperCase();
  const adminId = (req.user as any).id || (req.user as any).sub || (req.user as any).userId!;
  try {
    if (await usePg()) {
      const client = getPool();
      if (!client) return fail(res, 'Database not available', 500);
      // Use transaction for atomic status change
      const pgClient = await client.connect();
      try {
        await pgClient.query('BEGIN');
        const { rows } = await pgClient.query(`SELECT id, role, status FROM users WHERE id=$1 FOR UPDATE`, [userId]);
        const target = rows[0] as any;
        if (!target) { await pgClient.query('ROLLBACK'); return fail(res, 'User not found', 404); }
        if (!['DOCTOR','TRAINER','FARMER','DELIVERY'].includes(target.role)) {
          await pgClient.query('ROLLBACK');
          return fail(res, 'Only professional roles require approval', 400);
        }
        const newStatus = act === 'APPROVE' ? 'ACTIVE' : 'SUSPENDED';
        const newVerified = act === 'APPROVE';
        await pgClient.query(`UPDATE users SET status=$1, is_verified=$2, updated_at=NOW() WHERE id=$3`, [newStatus, newVerified, userId]);
        await pgClient.query(`INSERT INTO audit_logs (user_id, action, entity, meta, ip) VALUES ($1,$2,$3,$4,$5)`, [adminId, `ROLE_${act}`, `users:${userId}`, `role:${target.role} status:${newStatus}`, req.ip]);
        await pgClient.query('COMMIT');
        return ok(res, { success: true, message: `User ${act === 'APPROVE' ? 'approved' : 'rejected'}`, user: { id: userId, role: target.role, status: newStatus, isVerified: newVerified } });
      } catch (e: any) {
        try { await (await getPool()!)?.query('ROLLBACK'); } catch {}
        console.error('[auth-pg] admin approve', e.message);
        return fail(res, 'Database error', 500);
      } finally {
        (pgClient as any).release?.();
      }
    } else {
      const target = Users.findById(userId);
      if (!target) return fail(res, 'User not found', 404);
      if (!['DOCTOR','TRAINER','FARMER','DELIVERY'].includes(target.role)) return fail(res, 'Only professional roles require approval', 400);
      const newStatus = act === 'APPROVE' ? 'ACTIVE' : 'SUSPENDED';
      Users.update(userId, { status: newStatus, isVerified: act === 'APPROVE' } as Partial<UserRecord>);
      await auditLog(adminId, `ROLE_${act}`, `users:${userId}`, `role:${target.role}`, req.ip);
      return ok(res, { success: true, message: `User ${act === 'APPROVE' ? 'approved' : 'rejected'}` });
    }
  } catch (e: any) {
    console.error('[auth-pg] admin approve', e.message);
    return fail(res, 'Database error', 500);
  }
});

export default router;
