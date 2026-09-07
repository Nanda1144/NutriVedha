import { getConfig, signToken, signRefreshToken, normalizeRole, hashToken, type CanonicalRole } from '@nutrivedha/shared';
import crypto from 'node:crypto';

// Canonical roles — single source, uppercase
export type Role = CanonicalRole;
export const ROLE_MAP: Role[] = ['USER', 'DOCTOR', 'TRAINER', 'FARMER', 'DELIVERY', 'ADMIN'];

// Legacy map for backward compat (title case -> canonical)
const LEGACY_TO_CANONICAL: Record<string, Role> = {
  User: 'USER', Doctor: 'DOCTOR', Trainer: 'TRAINER', Farmer: 'FARMER', Delivery: 'DELIVERY', Admin: 'ADMIN',
  user: 'USER', doctor: 'DOCTOR', trainer: 'TRAINER', farmer: 'FARMER', delivery: 'DELIVERY', admin: 'ADMIN',
};

export function toCanonicalRole(input?: string): Role {
  if (!input) return 'USER';
  if ((ROLE_MAP as string[]).includes(input)) return input as Role;
  if (LEGACY_TO_CANONICAL[input]) return LEGACY_TO_CANONICAL[input];
  return normalizeRole(input);
}

export type UserStatus = 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'SUSPENDED';

export interface UserRecord {
  id: string;
  email: string;
  phone?: string;
  passwordHash?: string;
  name: string;
  role: Role;
  status: UserStatus;
  isVerified: boolean;
  isAdmin: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

const config = getConfig('auth', 3001);

export function issueToken(user: UserRecord) {
  return signToken(
    { sub: user.id, role: user.role, type: 'access' } as any,
    config.jwtSecret,
    config.jwtExpiry
  );
}

export function issueRefreshToken(user: UserRecord, tokenId: string = crypto.randomUUID()) {
  return {
    token: signRefreshToken({ sub: user.id, tokenId, type: 'refresh' } as any, config.jwtSecret, config.jwtRefreshExpiry),
    tokenId,
    hash: '' as string, // will be set by caller via hashToken
  };
}

export function hashRefreshToken(token: string): string {
  return hashToken(token);
}

// Never expose secrets
export function publicUser(user: UserRecord) {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    name: user.name,
    role: user.role,
    status: user.status,
    isVerified: user.isVerified,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  };
}

// Professional roles require verification (PENDING)
export function requiresVerification(role: Role): boolean {
  return ['DOCTOR', 'TRAINER', 'FARMER', 'DELIVERY'].includes(role);
}

export function initialStatusForRole(role: Role): UserStatus {
  return requiresVerification(role) ? 'PENDING' : 'ACTIVE';
}

export function initialVerifiedForRole(role: Role): boolean {
  return role === 'USER' || role === 'ADMIN';
}
