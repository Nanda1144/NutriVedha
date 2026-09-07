import { Router } from 'express';
import type { Request, Response } from 'express';
import crypto from 'node:crypto';
import { db, ok, created, fail, requireAuth, requireRole, hashToken, getConfig, hashPassword, verifyPassword, isStrongPassword } from '@nutrivedha/shared';
import {
  type UserRecord, toCanonicalRole, ROLE_MAP, publicUser,
  issueToken, issueRefreshToken, hashRefreshToken,
  initialStatusForRole,
} from './model.js';

const config = getConfig('auth', 3001);
const Users = db.collection<UserRecord>('users');

const PASSKEYS: Record<string, string> = {
  '@cC1411441': 'Master Admin',
  pavan: 'Master Admin',
  manil: 'Master Admin',
  jyo: 'Master Admin',
  janu: 'Master Admin',
};

const OTP_STORE: Record<string, string> = {};
const REFRESH_STORE = new Map<string, { userId: string; expiresAt: Date }>();

function isValidEmail(e: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

const router = Router();

const handleRegister = async (req: Request, res: Response) => {
  const { email, password, name, phone, role, confirmPassword } = req.body ?? {};
  const trimmedName = typeof name === 'string' ? name.trim() : '';
  const trimmedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const trimmedPhone = typeof phone === 'string' ? phone.trim() : phone;
  if (!trimmedName || trimmedName.length < 2) return fail(res, 'name required', 400);
  if (!trimmedEmail || !isValidEmail(trimmedEmail)) return fail(res, 'valid email required', 400);
  if (!password) return fail(res, 'password required', 400);
  if (!isStrongPassword(String(password))) return fail(res, 'Password must be at least 8 characters with letters and numbers', 400);
  if (confirmPassword !== undefined && String(confirmPassword) !== String(password)) return fail(res, 'confirmPassword must match', 400);
  const requested = toCanonicalRole(role);
  if (requested === 'ADMIN') return fail(res, 'Admin registration requires passkey verification', 403);
  const status = initialStatusForRole(requested);
  const isVerified = requested === 'USER';
  if (Users.findOne({ email: trimmedEmail } as Partial<UserRecord>)) return fail(res, 'Email already registered', 409);
  const passwordHash = await hashPassword(String(password));
  const user: UserRecord = {
    id: Users.newId(), email: trimmedEmail, phone: trimmedPhone, name: trimmedName,
    role: requested, status, isVerified, passwordHash, isAdmin: false,
    createdAt: new Date().toISOString(),
  } as UserRecord;
  Users.insert(user);
  const accessToken = issueToken(user);
  const tokenId = crypto.randomUUID();
  const { token: refreshToken } = issueRefreshToken(user, tokenId);
  REFRESH_STORE.set(hashRefreshToken(refreshToken), { userId: user.id, expiresAt: new Date(Date.now() + 30 * 86400 * 1000) });
  return created(res, { token: accessToken, accessToken, refreshToken, user: publicUser(user), success: true, message: status === 'PENDING' ? 'Application received — pending verification' : 'Registered' });
};
router.post('/register', handleRegister);
router.post('/signup', handleRegister);

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};
  const trimmedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!trimmedEmail || !password) return fail(res, 'email and password required', 400);
  const user = Users.findOne({ email: trimmedEmail } as Partial<UserRecord>);
  if (!user?.passwordHash || !(await verifyPassword(String(password), user.passwordHash))) return fail(res, 'Invalid credentials', 401);
  if (user.status === 'SUSPENDED') return fail(res, 'Account suspended', 403);
  if (user.status === 'INACTIVE') return fail(res, 'Account inactive', 403);
  if (user.status === 'PENDING') return fail(res, 'Account pending verification', 403);
  Users.update(user.id, { lastLoginAt: new Date().toISOString() } as Partial<UserRecord>);
  const accessToken = issueToken(user);
  const { token: refreshToken } = issueRefreshToken(user, crypto.randomUUID());
  REFRESH_STORE.set(hashRefreshToken(refreshToken), { userId: user.id, expiresAt: new Date(Date.now() + 30 * 86400 * 1000) });
  const expiresIn = 900;
  return ok(res, { success: true, message: 'Login successful', user: publicUser(user), accessToken, token: accessToken, refreshToken, expiresIn });
});

router.post('/refresh', async (req: Request, res: Response) => {
  const { refreshToken } = req.body ?? {};
  if (!refreshToken) return fail(res, 'refreshToken required', 400);
  const hash = hashToken(refreshToken);
  const mem = REFRESH_STORE.get(hash);
  if (!mem) return fail(res, 'Refresh token revoked', 401);
  if (mem.expiresAt < new Date()) return fail(res, 'Refresh token expired', 401);
  mem.expiresAt = new Date(0); // revoke old
  const user = Users.findById(mem.userId);
  if (!user) return fail(res, 'User not found', 404);
  if (user.status !== 'ACTIVE') return fail(res, `Account ${user.status}`, 403);
  const accessToken = issueToken(user);
  const { token: newRefresh } = issueRefreshToken(user, crypto.randomUUID());
  REFRESH_STORE.set(hashRefreshToken(newRefresh), { userId: user.id, expiresAt: new Date(Date.now() + 30 * 86400 * 1000) });
  return ok(res, { token: accessToken, accessToken, refreshToken: newRefresh, user: publicUser(user) });
});

router.post('/logout', async (req: Request, res: Response) => {
  const { refreshToken } = req.body ?? {};
  if (refreshToken) REFRESH_STORE.delete(hashToken(refreshToken));
  return ok(res, { message: 'Logged out' });
});

router.post('/otp/request', (req: Request, res: Response) => {
  const { phone } = req.body ?? {};
  if (!phone) return fail(res, 'phone required', 400);
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  OTP_STORE[phone] = otp;
  return ok(res, config.env === 'development' ? { otp, message: 'OTP sent (dev echo)' } : { message: 'OTP sent' });
});

router.post('/otp/verify', async (req: Request, res: Response) => {
  const { phone, otp, name } = req.body ?? {};
  if (!phone || !otp) return fail(res, 'phone and otp required', 400);
  if (OTP_STORE[phone] !== String(otp)) return fail(res, 'Invalid OTP', 401);
  delete OTP_STORE[phone];
  let user = Users.findOne({ phone } as Partial<UserRecord>);
  if (!user) {
    user = {
      id: Users.newId(), email: `${phone}@mobile.ayurai.health`, phone,
      name: name || 'Mobile User', role: 'USER', status: 'ACTIVE', isVerified: true,
      isAdmin: false, createdAt: new Date().toISOString(),
    } as UserRecord;
    Users.insert(user);
  }
  const accessToken = issueToken(user);
  const { token: refreshToken } = issueRefreshToken(user, crypto.randomUUID());
  REFRESH_STORE.set(hashRefreshToken(refreshToken), { userId: user.id, expiresAt: new Date(Date.now() + 30 * 86400 * 1000) });
  return ok(res, { token: accessToken, accessToken, refreshToken, user: publicUser(user) });
});

router.post('/passkey', (req: Request, res: Response) => {
  const { passkey } = req.body ?? {};
  const identity = PASSKEYS[passkey as string];
  if (!identity) return fail(res, 'Invalid passkey', 401);
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
  const { token: refreshToken } = issueRefreshToken(user, crypto.randomUUID());
  REFRESH_STORE.set(hashRefreshToken(refreshToken), { userId: user.id, expiresAt: new Date(Date.now() + 30 * 86400 * 1000) });
  return ok(res, { token: accessToken, accessToken, refreshToken, user: publicUser(user), passkeyIdentity: identity });
});

router.get('/me', requireAuth(config.jwtSecret), (req: Request, res: Response) => {
  const user = Users.findById((req.user as any).id || (req.user as any).id || (req.user as any).userId!!);
  if (!user) return fail(res, 'User not found', 404);
  if (user.status === 'SUSPENDED') return fail(res, 'Account suspended', 403);
  return ok(res, { user: publicUser(user) });
});

router.get('/roles', requireAuth(config.jwtSecret), requireRole('ADMIN'), (_req: Request, res: Response) => {
  return ok(res, { roles: ROLE_MAP });
});

export default router;
