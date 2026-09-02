import { Router } from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db, ok, created, fail, requireAuth, requireRole, pgQuery, isPgAvailable, getPool, getConfig } from '@nutrivedha/shared';
import { type UserRecord, issueToken, publicUser, ROLE_MAP } from './model.js';

const config = getConfig('auth', 3001);
const Users = db.collection<UserRecord>('users');

const PASSKEYS: Record<string, string> = {
  '@cC1411441': 'Master Admin',
  pavan: 'Master Admin',
  manil: 'Master Admin',
  jyo: 'Master Admin',
  janu: 'Master Admin',
};
async function usePg(): Promise<boolean> { if (!getPool()) return false; return isPgAvailable(); }
const OTP_STORE: Record<string, string> = {};

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  const { email, password, name, phone, role } = req.body;
  if (!email || !password || !name) return fail(res, 'email, password and name are required');
  const userRole = (role && (ROLE_MAP as string[]).includes(role) ? role : 'User') as UserRecord['role'];
  if (await usePg()) {
    try {
      const chk = await pgQuery(`SELECT id FROM users WHERE email=$1`, [email]);
      if (chk.rowCount > 0) return fail(res, 'Email already registered', 409);
      const passwordHash = await bcrypt.hash(password, 10);
      const { rows } = await pgQuery(
        `INSERT INTO users (email, phone, name, role, password_hash, is_admin) VALUES ($1,$2,$3,$4,$5,false) RETURNING id, email, phone, name, role, is_admin as "isAdmin", created_at as "createdAt"`,
        [email, phone || null, name, userRole, passwordHash]
      );
      const user = { id: rows[0].id, email: rows[0].email, phone: rows[0].phone, name: rows[0].name, role: rows[0].role, passwordHash, createdAt: rows[0].createdAt, isAdmin: rows[0].isAdmin } as UserRecord;
      return created(res, { token: issueToken(user), user: publicUser(user) });
    } catch (e: any) { console.error('[auth-pg] register', e.message); return fail(res, 'Database error', 500); }
  }
  if (Users.findOne({ email } as Partial<UserRecord>)) return fail(res, 'Email already registered', 409);
  const passwordHash = await bcrypt.hash(password, 10);
  const user: UserRecord = { id: Users.newId(), email, phone, name, role: userRole, passwordHash, createdAt: new Date().toISOString(), isAdmin: false };
  Users.insert(user);
  return created(res, { token: issueToken(user), user: publicUser(user) });
});

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return fail(res, 'email and password required');
  if (await usePg()) {
    try {
      const { rows } = await pgQuery(`SELECT id, email, phone, name, role, password_hash as "passwordHash", is_admin as "isAdmin", created_at as "createdAt" FROM users WHERE email=$1`, [email]);
      const user = rows[0] as any;
      if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) return fail(res, 'Invalid credentials', 401);
      const rec = { id: user.id, email: user.email, phone: user.phone, name: user.name, role: user.role, passwordHash: user.passwordHash, createdAt: user.createdAt, isAdmin: user.isAdmin } as UserRecord;
      return ok(res, { token: issueToken(rec), user: publicUser(rec) });
    } catch (e: any) { console.error('[auth-pg] login', e.message); return fail(res, 'Database error', 500); }
  }
  const user = Users.findOne({ email } as Partial<UserRecord>);
  if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) return fail(res, 'Invalid credentials', 401);
  return ok(res, { token: issueToken(user), user: publicUser(user) });
});

router.post('/otp/request', (req: Request, res: Response) => {
  const { phone } = req.body;
  if (!phone) return fail(res, 'phone required');
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  OTP_STORE[phone] = otp;
  return ok(res, config.env === 'development' ? { otp, message: 'OTP sent (dev echo)' } : { message: 'OTP sent' });
});

router.post('/otp/verify', async (req: Request, res: Response) => {
  const { phone, otp, name } = req.body;
  if (!phone || !otp) return fail(res, 'phone and otp required');
  if (OTP_STORE[phone] !== String(otp)) return fail(res, 'Invalid OTP', 401);
  delete OTP_STORE[phone];
  if (await usePg()) {
    try {
      let { rows } = await pgQuery(`SELECT id, email, phone, name, role, is_admin as "isAdmin", created_at as "createdAt" FROM users WHERE phone=$1`, [phone]);
      let rec: UserRecord;
      if (rows[0]) {
        const u = rows[0] as any;
        rec = { id: u.id, email: u.email, phone: u.phone, name: u.name, role: u.role, createdAt: u.createdAt, isAdmin: u.isAdmin } as UserRecord;
      } else {
        const { rows: ins } = await pgQuery(`INSERT INTO users (email, phone, name, role, is_admin) VALUES ($1,$2,$3,'User',false) RETURNING id, email, phone, name, role, is_admin as "isAdmin", created_at as "createdAt"`, [`${phone}@mobile.ayurai.health`, phone, name || 'Mobile User']);
        const u = ins[0] as any;
        rec = { id: u.id, email: u.email, phone: u.phone, name: u.name, role: u.role, createdAt: u.createdAt, isAdmin: u.isAdmin } as UserRecord;
      }
      return ok(res, { token: issueToken(rec), user: publicUser(rec) });
    } catch (e: any) { console.error('[auth-pg] otp verify', e.message); return fail(res, 'Database error', 500); }
  }
  let user = Users.findOne({ phone } as Partial<UserRecord>);
  if (!user) {
    user = { id: Users.newId(), email: `${phone}@mobile.ayurai.health`, phone, name: name || 'Mobile User', role: 'User', createdAt: new Date().toISOString(), isAdmin: false };
    Users.insert(user);
  }
  return ok(res, { token: issueToken(user), user: publicUser(user) });
});

router.post('/passkey', async (req: Request, res: Response) => {
  const { passkey } = req.body;
  const identity = PASSKEYS[passkey as string];
  if (!identity) return fail(res, 'Invalid passkey', 401);
  if (await usePg()) {
    try {
      const email = `admin@${passkey}.ayurai.health`;
      let { rows } = await pgQuery(`SELECT id, email, name, role, is_admin as "isAdmin", created_at as "createdAt" FROM users WHERE email=$1`, [email]);
      let rec: UserRecord;
      if (rows[0]) {
        const u = rows[0] as any;
        rec = { id: u.id, email: u.email, name: u.name, role: u.role, createdAt: u.createdAt, isAdmin: u.isAdmin } as UserRecord;
      } else {
        const { rows: ins } = await pgQuery(`INSERT INTO users (email, name, role, is_admin) VALUES ($1,$2,'Admin',true) RETURNING id, email, name, role, is_admin as "isAdmin", created_at as "createdAt"`, [email, identity]);
        const u = ins[0] as any;
        rec = { id: u.id, email: u.email, name: u.name, role: u.role, createdAt: u.createdAt, isAdmin: u.isAdmin } as UserRecord;
      }
      return ok(res, { token: issueToken(rec), user: publicUser(rec), passkeyIdentity: identity });
    } catch (e: any) { console.error('[auth-pg] passkey', e.message); return fail(res, 'Database error', 500); }
  }
  let user = Users.findOne({ email: `admin@${passkey}.ayurai.health` } as Partial<UserRecord>);
  if (!user) {
    user = { id: Users.newId(), email: `admin@${passkey}.ayurai.health`, name: identity, role: 'Admin', createdAt: new Date().toISOString(), isAdmin: true };
    Users.insert(user);
  }
  return ok(res, { token: issueToken(user), user: publicUser(user), passkeyIdentity: identity });
});

router.get('/me', requireAuth(config.jwtSecret), async (req: Request, res: Response) => {
  if (await usePg()) {
    try {
      const { rows } = await pgQuery(`SELECT id, email, phone, name, role, is_admin as "isAdmin", created_at as "createdAt" FROM users WHERE id=$1`, [req.user!.userId]);
      if (!rows[0]) return fail(res, 'User not found', 404);
      const u = rows[0] as any;
      const rec = { id: u.id, email: u.email, phone: u.phone, name: u.name, role: u.role, createdAt: u.createdAt, isAdmin: u.isAdmin } as UserRecord;
      return ok(res, { user: publicUser(rec) });
    } catch (e: any) { console.error('[auth-pg] me', e.message); return fail(res, 'Database error', 500); }
  }
  const user = Users.findById(req.user!.userId);
  if (!user) return fail(res, 'User not found', 404);
  return ok(res, { user: publicUser(user) });
});

router.get('/roles', requireAuth(config.jwtSecret), requireRole('Admin'), (_req: Request, res: Response) => {
  return ok(res, { roles: ROLE_MAP });
});

export default router;
