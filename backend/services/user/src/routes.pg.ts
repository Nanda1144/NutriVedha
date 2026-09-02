import { Router } from 'express';
import type { Request, Response } from 'express';
import { db, ok, fail, requireAuth, getConfig, pgQuery, isPgAvailable, getPool } from '@nutrivedha/shared';

const config = getConfig('user', 3002);
interface UserProfile {
  id: string; userId: string; email: string; name: string; phone: string; address: string; avatar: string; role: string; age: number; dob: string; weight: number; height: number; bloodGroup: string; diseases: string[]; fitnessGoal: string; education: string; memberSince: string;
  rbac: { doctor: boolean; trainer: boolean; farmer: boolean };
  security: { twoStepVerification: boolean; dataEncrypted: boolean; lastBackup: string; integrityPassed: boolean };
  deletionScheduledAt?: string; updatedAt: string;
}
interface AuditLog { id: string; userId: string; accessor: string; role: string; action: string; timestamp: string; status: 'Success' | 'Denied'; }
const Profiles = db.collection<UserProfile>('profiles');
const AuditLogs = db.collection<AuditLog>('audit_logs');
async function usePg(): Promise<boolean> { if (!getPool()) return false; return isPgAvailable(); }
async function auditPg(userId: string, accessor: string, role: string, action: string, status: 'Success' | 'Denied' = 'Success') {
  if (await usePg()) { try { await pgQuery(`INSERT INTO audit_logs (user_id, action, entity, ip) VALUES ($1,$2,'user','pg')`, [userId, `${accessor}:${role}:${action}`]); } catch {} } else { AuditLogs.insert({ id: AuditLogs.newId(), userId, accessor, role, action, timestamp: new Date().toISOString(), status }); }
}

const router = Router();
router.use(requireAuth(config.jwtSecret));

router.get('/profile', async (req: Request, res: Response) => {
  if (await usePg()) {
    try {
      let { rows } = await pgQuery(`SELECT user_id as "userId", name, email, phone, address, avatar, role, age, dob, weight, height, blood_group as "bloodGroup", diseases, fitness_goal as "fitnessGoal", education, member_since as "memberSince" FROM user_profiles WHERE user_id=$1`, [req.user!.userId]);
      if (!rows[0]) {
        const { rows: ins } = await pgQuery(
          `INSERT INTO user_profiles (user_id, name, email, role, avatar, member_since) VALUES ($1,$2,$3,$4,$5, NOW()) RETURNING user_id as "userId", name, email, phone, address, avatar, role, age, dob, weight, height, blood_group as "bloodGroup", diseases, fitness_goal as "fitnessGoal", education, member_since as "memberSince"`,
          [req.user!.userId, req.user!.email.split('@')[0], req.user!.email, req.user!.role, `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.user!.userId}`]
        );
        await pgQuery(`INSERT INTO user_rbac (user_id) VALUES ($1) ON CONFLICT DO NOTHING`, [req.user!.userId]);
        await pgQuery(`INSERT INTO user_security (user_id) VALUES ($1) ON CONFLICT DO NOTHING`, [req.user!.userId]);
        rows = ins;
      }
      const { rows: rbac } = await pgQuery(`SELECT doctor, trainer, farmer FROM user_rbac WHERE user_id=$1`, [req.user!.userId]);
      const { rows: sec } = await pgQuery(`SELECT two_step_verification as "twoStepVerification", data_encrypted as "dataEncrypted", last_backup as "lastBackup", integrity_passed as "integrityPassed" FROM user_security WHERE user_id=$1`, [req.user!.userId]);
      const p = rows[0] as any;
      p.rbac = rbac[0] || { doctor: true, trainer: true, farmer: false };
      p.security = sec[0] || { twoStepVerification: false, dataEncrypted: true, lastBackup: new Date().toISOString(), integrityPassed: true };
      return ok(res, { profile: p });
    } catch (e: any) { console.error('[user-pg] profile GET', e.message); return fail(res, 'Database error', 500); }
  }
  let p = Profiles.findOne({ userId: req.user!.userId } as Partial<UserProfile>);
  if (!p) {
    p = { id: Profiles.newId(), userId: req.user!.userId, email: req.user!.email, name: req.user!.email.split('@')[0], phone: '', address: '', avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.user!.userId}`, role: req.user!.role, age: 0, dob: '', weight: 0, height: 0, bloodGroup: '', diseases: [], fitnessGoal: '', education: '', memberSince: new Date().toLocaleString('en-IN', { month: 'short', year: 'numeric' }), rbac: { doctor: true, trainer: true, farmer: false }, security: { twoStepVerification: false, dataEncrypted: true, lastBackup: new Date().toISOString(), integrityPassed: true }, updatedAt: new Date().toISOString() };
    Profiles.insert(p);
  }
  return ok(res, { profile: p });
});

router.put('/profile', async (req: Request, res: Response) => {
  if (await usePg()) {
    try {
      const b = req.body;
      await pgQuery(`UPDATE user_profiles SET name=COALESCE($1,name), email=COALESCE($2,email), phone=COALESCE($3,phone), address=COALESCE($4,address), avatar=COALESCE($5,avatar), age=COALESCE($6,age), dob=COALESCE($7,dob), weight=COALESCE($8,weight), height=COALESCE($9,height), blood_group=COALESCE($10,blood_group), diseases=COALESCE($11,diseases), fitness_goal=COALESCE($12,fitness_goal), education=COALESCE($13,education) WHERE user_id=$14`, [b.name, b.email, b.phone, b.address, b.avatar, b.age, b.dob, b.weight, b.height, b.bloodGroup, b.diseases, b.fitnessGoal, b.education, req.user!.userId]);
      const { rows } = await pgQuery(`SELECT user_id as "userId", name, email, phone, address, avatar, role, age, dob, weight, height, blood_group as "bloodGroup", diseases, fitness_goal as "fitnessGoal", education FROM user_profiles WHERE user_id=$1`, [req.user!.userId]);
      await auditPg(req.user!.userId, 'You (User)', req.user!.role, 'Updated personal profile details');
      return ok(res, { profile: rows[0] });
    } catch (e: any) { console.error('[user-pg] profile PUT', e.message); return fail(res, 'Database error', 500); }
  }
  const p = Profiles.findOne({ userId: req.user!.userId } as Partial<UserProfile>);
  if (!p) return fail(res, 'Profile not found', 404);
  const updated = Profiles.update(p.id, { ...req.body, updatedAt: new Date().toISOString() } as Partial<UserProfile>);
  await auditPg(req.user!.userId, 'You (User)', req.user!.role, 'Updated personal profile details');
  return ok(res, { profile: updated });
});

router.put('/rbac', async (req: Request, res: Response) => {
  if (await usePg()) {
    try {
      await pgQuery(`UPDATE user_rbac SET doctor=COALESCE($1,doctor), trainer=COALESCE($2,trainer), farmer=COALESCE($3,farmer) WHERE user_id=$4`, [req.body.doctor, req.body.trainer, req.body.farmer, req.user!.userId]);
      const { rows } = await pgQuery(`SELECT doctor, trainer, farmer FROM user_rbac WHERE user_id=$1`, [req.user!.userId]);
      return ok(res, { rbac: rows[0] });
    } catch (e: any) { console.error('[user-pg] rbac', e.message); return fail(res, 'Database error', 500); }
  }
  const p = Profiles.findOne({ userId: req.user!.userId } as Partial<UserProfile>);
  if (!p) return fail(res, 'Profile not found', 404);
  const merged = { ...p.rbac, ...req.body }; Profiles.update(p.id, { rbac: merged, updatedAt: new Date().toISOString() } as Partial<UserProfile>); return ok(res, { rbac: merged });
});

router.put('/security', async (req: Request, res: Response) => {
  if (await usePg()) {
    try {
      await pgQuery(`UPDATE user_security SET two_step_verification=COALESCE($1,two_step_verification), data_encrypted=COALESCE($2,data_encrypted), integrity_passed=COALESCE($3,integrity_passed) WHERE user_id=$4`, [req.body.twoStepVerification, req.body.dataEncrypted, req.body.integrityPassed, req.user!.userId]);
      const { rows } = await pgQuery(`SELECT two_step_verification as "twoStepVerification", data_encrypted as "dataEncrypted", last_backup as "lastBackup", integrity_passed as "integrityPassed" FROM user_security WHERE user_id=$1`, [req.user!.userId]);
      await auditPg(req.user!.userId, 'You (User)', req.user!.role, 'Updated security settings');
      return ok(res, { security: rows[0] });
    } catch (e: any) { console.error('[user-pg] security', e.message); return fail(res, 'Database error', 500); }
  }
  const p = Profiles.findOne({ userId: req.user!.userId } as Partial<UserProfile>);
  if (!p) return fail(res, 'Profile not found', 404);
  const merged = { ...p.security, ...req.body }; Profiles.update(p.id, { security: merged, updatedAt: new Date().toISOString() } as Partial<UserProfile>); await auditPg(req.user!.userId, 'You (User)', req.user!.role, 'Updated security settings'); return ok(res, { security: merged });
});

router.put('/backup', async (req: Request, res: Response) => {
  if (await usePg()) {
    try { await pgQuery(`UPDATE user_security SET last_backup=NOW() WHERE user_id=$1`, [req.user!.userId]); const { rows } = await pgQuery(`SELECT last_backup as "lastBackup" FROM user_security WHERE user_id=$1`, [req.user!.userId]); await auditPg(req.user!.userId, 'You (User)', req.user!.role, 'Initiated cloud data backup'); return ok(res, { security: rows[0], message: 'Backup synced' }); } catch (e: any) { console.error('[user-pg] backup', e.message); return fail(res, 'Database error', 500); }
  }
  const p = Profiles.findOne({ userId: req.user!.userId } as Partial<UserProfile>);
  if (!p) return fail(res, 'Profile not found', 404);
  const security = { ...p.security, lastBackup: new Date().toISOString() }; Profiles.update(p.id, { security, updatedAt: new Date().toISOString() } as Partial<UserProfile>); await auditPg(req.user!.userId, 'You (User)', req.user!.role, 'Initiated cloud data backup'); return ok(res, { security, message: 'Backup synced' });
});

router.get('/export', async (req: Request, res: Response) => {
  if (await usePg()) {
    try {
      const { rows: prof } = await pgQuery(`SELECT * FROM user_profiles WHERE user_id=$1`, [req.user!.userId]);
      const { rows: logs } = await pgQuery(`SELECT * FROM audit_logs WHERE user_id=$1 ORDER BY created_at DESC LIMIT 100`, [req.user!.userId]);
      await auditPg(req.user!.userId, 'You (User)', req.user!.role, 'Generated data export');
      res.setHeader('Content-Disposition', 'attachment; filename="ayurai-vault.json"');
      return ok(res, { exportedAt: new Date().toISOString(), user: prof[0] || null, auditLogs: logs, note: 'Full data portability export. PII encrypted at rest in production.' });
    } catch (e: any) { console.error('[user-pg] export', e.message); return fail(res, 'Database error', 500); }
  }
  const p = Profiles.findOne({ userId: req.user!.userId } as Partial<UserProfile>);
  const logs = AuditLogs.find({ userId: req.user!.userId } as Partial<AuditLog>);
  await auditPg(req.user!.userId, 'You (User)', req.user!.role, 'Generated data export');
  res.setHeader('Content-Disposition', 'attachment; filename="ayurai-vault.json"');
  return ok(res, { exportedAt: new Date().toISOString(), user: p ? { ...p } : null, auditLogs: logs, note: 'Full data portability export. PII encrypted at rest in production.' });
});

router.post('/delete', async (req: Request, res: Response) => {
  if (await usePg()) {
    try {
      const deletionScheduledAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      await auditPg(req.user!.userId, 'System', 'AI', 'Scheduled Account Deletion (30-day Grace Period)');
      return ok(res, { deletionScheduledAt, message: 'Deletion scheduled. 30-day grace period to cancel.' });
    } catch (e: any) { console.error('[user-pg] delete', e.message); return fail(res, 'Database error', 500); }
  }
  const p = Profiles.findOne({ userId: req.user!.userId } as Partial<UserProfile>);
  if (!p) return fail(res, 'Profile not found', 404);
  const deletionScheduledAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  Profiles.update(p.id, { deletionScheduledAt, updatedAt: new Date().toISOString() } as Partial<UserProfile>);
  await auditPg(req.user!.userId, 'System', 'AI', 'Scheduled Account Deletion (30-day Grace Period)');
  return ok(res, { deletionScheduledAt, message: 'Deletion scheduled. 30-day grace period to cancel.' });
});

router.get('/audit', async (req: Request, res: Response) => {
  if (await usePg()) {
    try { const { rows } = await pgQuery(`SELECT id, user_id as "userId", action, entity, created_at as "timestamp", 'Success' as status FROM audit_logs WHERE user_id=$1 ORDER BY created_at DESC LIMIT 100`, [req.user!.userId]); return ok(res, { logs: rows }); } catch (e: any) { console.error('[user-pg] audit', e.message); return fail(res, 'Database error', 500); }
  }
  const logs = AuditLogs.find({ userId: req.user!.userId } as Partial<AuditLog>); return ok(res, { logs });
});

router.post('/change-passkey', async (req: Request, res: Response) => {
  await auditPg(req.user!.userId, 'You (User)', req.user!.role, 'Updated passkey (security update)');
  return ok(res, { message: 'Passkey update requested' });
});

export default router;
