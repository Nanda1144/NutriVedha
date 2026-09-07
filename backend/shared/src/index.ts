export { getConfig, getPgConfig, type ServiceConfig, type PgConfig } from './config.js';
export { encrypt, decrypt } from './crypto.js';
export { hashPassword, verifyPassword, isStrongPassword } from './password.js';
export {
  signToken, verifyToken, signRefreshToken, verifyRefreshToken, hashToken,
  requireAuth, requireRole, requireVerified,
  normalizeRole, displayRole, CANONICAL_ROLES, type JwtPayload, type JwtRefreshPayload, type CanonicalRole,
} from './auth.js';
export { ok, created, fail } from './resp.js';
export { createService } from './service.js';
export { default as db, MemDB } from './db.js';
export { getPool, pgQuery, isPgConfigured, isPgAvailable } from './pg.js';
