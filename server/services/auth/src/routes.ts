import { Router } from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db, ok, created, fail, requireAuth, requireRole } from '@nutrivedha/shared';
import { getConfig } from '@nutrivedha/shared';
import { type UserRecord, issueToken, publicUser, ROLE_MAP } from './model.js';

const config = getConfig('auth', 3001);
const Users = db.collection<UserRecord>('users');

/** Dev/demo admin passkeys mapped to a canonical admin identity. */
const PASSKEYS: Record<string, string> = {
  '@cC1411441': 'Master Admin',
  pavan: 'Master Admin',
  manil: 'Master Admin',
  jyo: 'Master Admin',
  janu: 'Master Admin',
};

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  const { email, password, name, phone, role } = req.body;
  if (!email || !password || !name) return fail(res, 'email, password and name are required');
  const userRole = (role && (ROLE_MAP as string[]).includes(role) ? role : 'User') as UserRecord['role'];

  if (Users.findOne({ email } as Partial<UserRecord>)) return fail(res, 'Email already registered');

  const passwordHash = await bcrypt.hash(password, 10);
  const user: UserRecord = {
    id: Users.newId(),
    email,
    phone,
    name,
    role: userRole,
    passwordHash,
    createdAt: new Date().toISOString(),
    isAdmin: false,
  };
  Users.insert(user);
  return created(res, { token: issueToken(user), user: publicUser(user) });
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return fail(res, 'email and password required');
  const user = Users.findOne({ email } as Partial<UserRecord>);
  if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
    return fail(res, 'Invalid credentials', 401);
  }
  return ok(res, { token: issueToken(user), user: publicUser(user) });
});

// POST /api/auth/otp/request  - simulates sending an OTP (returns code in dev)
router.post('/otp/request', (req: Request, res: Response) => {
  const { phone } = req.body;
  if (!phone) return fail(res, 'phone required');
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  OTP_STORE[phone] = otp;
  // In dev, echo the OTP; in production, hand off to Notification Service (SMS).
  return ok(res, config.env === 'development' ? { otp, message: 'OTP sent (dev echo)' } : { message: 'OTP sent' });
});

const OTP_STORE: Record<string, string> = {};

// POST /api/auth/otp/verify
router.post('/otp/verify', async (req: Request, res: Response) => {
  const { phone, otp, name } = req.body;
  if (!phone || !otp) return fail(res, 'phone and otp required');
  if (OTP_STORE[phone] !== String(otp)) return fail(res, 'Invalid OTP', 401);
  delete OTP_STORE[phone];

  let user = Users.findOne({ phone } as Partial<UserRecord>);
  if (!user) {
    user = {
      id: Users.newId(),
      email: `${phone}@mobile.ayurai.health`,
      phone,
      name: name || 'Mobile User',
      role: 'User',
      createdAt: new Date().toISOString(),
      isAdmin: false,
    };
    Users.insert(user);
  }
  return ok(res, { token: issueToken(user), user: publicUser(user) });
});

// POST /api/auth/passkey - admin login via passkey (from Chatbot)
router.post('/passkey', (req: Request, res: Response) => {
  const { passkey } = req.body;
  const identity = PASSKEYS[passkey as string];
  if (!identity) return fail(res, 'Invalid passkey', 401);

  let user = Users.findOne({ email: `admin@${passkey}.ayurai.health` } as Partial<UserRecord>);
  if (!user) {
    user = {
      id: Users.newId(),
      email: `admin@${passkey}.ayurai.health`,
      name: identity,
      role: 'Admin',
      createdAt: new Date().toISOString(),
      isAdmin: true,
    };
    Users.insert(user);
  }
  return ok(res, { token: issueToken(user), user: publicUser(user), passkeyIdentity: identity });
});

// GET /api/auth/me - current user (protected)
router.get('/me', requireAuth(config.jwtSecret), (req: Request, res: Response) => {
  const user = Users.findById(req.user!.userId);
  if (!user) return fail(res, 'User not found', 404);
  return ok(res, { user: publicUser(user) });
});

// GET /api/auth/roles - list of roles (protected admin)
router.get('/roles', requireAuth(config.jwtSecret), requireRole('Admin'), (_req: Request, res: Response) => {
  return ok(res, { roles: ROLE_MAP });
});

export default router;
