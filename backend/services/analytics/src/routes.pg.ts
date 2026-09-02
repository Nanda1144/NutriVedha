import { Router } from 'express';
import type { Request, Response } from 'express';
import { db, ok, created, fail, requireAuth, requireRole, getConfig, pgQuery, isPgAvailable, getPool } from '@nutrivedha/shared';

const config = getConfig('analytics', 3011);
interface AuditLog { id: string; userId: string; action: string; entity: string; meta?: string; ip?: string; createdAt: string; }
interface ActivityEvent { id: string; userId: string; event: string; createdAt: string; }
const Audit = db.collection<AuditLog>('audit_logs');
const Activity = db.collection<ActivityEvent>('activity_events');
if (Activity.find().length === 0) {
  (['Login', 'Diet Plan Generated', 'Report Shared', 'Consultation Booked'] as const).forEach((ev, i) => { Activity.insert({ id: Activity.newId(), userId: 'seed-user', event: ev, createdAt: new Date(Date.now() - i * 3600_000).toISOString() }); });
}
async function usePg(): Promise<boolean> { if (!getPool()) return false; return isPgAvailable(); }
const router = Router();
router.get('/audit', requireAuth(config.jwtSecret), async (req: Request, res: Response) => {
  const isAdmin = req.user!.role === 'Admin';
  if (await usePg()) {
    try {
      const q = isAdmin ? `SELECT id, user_id as "userId", action, entity, meta, ip, created_at as "createdAt" FROM audit_logs ORDER BY created_at DESC LIMIT 100` : `SELECT id, user_id as "userId", action, entity, meta, ip, created_at as "createdAt" FROM audit_logs WHERE user_id=$1 ORDER BY created_at DESC LIMIT 100`;
      const { rows } = await pgQuery(q, isAdmin ? [] : [req.user!.userId]);
      return ok(res, { logs: rows });
    } catch (e: any) { console.error('[analytics-pg] audit', e.message); return fail(res, 'Database error', 500); }
  }
  const logs = (isAdmin ? Audit.find() : Audit.find({ userId: req.user!.userId } as Partial<AuditLog>)).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 100); return ok(res, { logs });
});
router.post('/log', async (req: Request, res: Response) => {
  const { userId, action, entity, meta } = req.body ?? {};
  if (!userId || !action) return fail(res, 'userId and action required');
  if (await usePg()) {
    try { const { rows } = await pgQuery(`INSERT INTO audit_logs (user_id, action, entity, meta, ip) VALUES ($1,$2,$3,$4,$5) RETURNING id, user_id as "userId", action, entity, meta, ip, created_at as "createdAt"`, [userId, action, entity ?? '', meta ? JSON.stringify(meta) : null, req.ip]); return created(res, { log: rows[0] }); } catch (e: any) { console.error('[analytics-pg] log POST', e.message); return fail(res, 'Database error', 500); }
  }
  const log: AuditLog = { id: Audit.newId(), userId, action, entity: entity ?? '', meta: meta ? JSON.stringify(meta) : undefined, ip: req.ip, createdAt: new Date().toISOString() }; Audit.insert(log); return created(res, { log });
});
router.get('/activity', requireAuth(config.jwtSecret), async (req: Request, res: Response) => {
  const limit = Math.min(50, parseInt(req.query.limit as string, 10) || 30);
  if (await usePg()) {
    try { const { rows } = await pgQuery(`SELECT id, user_id as "userId", event, created_at as "createdAt" FROM activity_events WHERE user_id=$1 ORDER BY created_at DESC LIMIT $2`, [req.user!.userId, limit]); const { rows: all } = await pgQuery(`SELECT event, COUNT(*) as cnt FROM activity_events WHERE user_id=$1 GROUP BY event`, [req.user!.userId]); const byEvent: Record<string, number> = {}; for (const r of all as any[]) byEvent[r.event] = parseInt(r.cnt, 10); return ok(res, { events: rows, summary: byEvent }); } catch (e: any) { console.error('[analytics-pg] activity GET', e.message); return fail(res, 'Database error', 500); }
  }
  const events = Activity.find({ userId: req.user!.userId } as Partial<ActivityEvent>).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, limit);
  const byEvent: Record<string, number> = {}; for (const e of Activity.find({ userId: req.user!.userId } as Partial<ActivityEvent>)) byEvent[e.event] = (byEvent[e.event] ?? 0) + 1; return ok(res, { events, summary: byEvent });
});
router.post('/activity', requireAuth(config.jwtSecret), async (req: Request, res: Response) => {
  const { event } = req.body ?? {};
  if (!event) return fail(res, 'event required');
  if (await usePg()) {
    try { const { rows } = await pgQuery(`INSERT INTO activity_events (user_id, event) VALUES ($1,$2) RETURNING id, user_id as "userId", event, created_at as "createdAt"`, [req.user!.userId, event]); return created(res, { event: rows[0] }); } catch (e: any) { console.error('[analytics-pg] activity POST', e.message); return fail(res, 'Database error', 500); }
  }
  const entry: ActivityEvent = { id: Activity.newId(), userId: req.user!.userId, event, createdAt: new Date().toISOString() }; Activity.insert(entry); return created(res, { event: entry });
});
router.get('/admin/overview', requireAuth(config.jwtSecret), requireRole('Admin'), async (_req: Request, res: Response) => {
  if (await usePg()) {
    try { const { rows: u } = await pgQuery(`SELECT COUNT(*) as c FROM users`); const { rows: e } = await pgQuery(`SELECT COUNT(*) as c FROM activity_events`); const { rows: a } = await pgQuery(`SELECT COUNT(*) as c FROM audit_logs`); return ok(res, { totalUsers: parseInt((u[0] as any).c, 10), events: parseInt((e[0] as any).c, 10), auditEntries: parseInt((a[0] as any).c, 10) }); } catch (e: any) { console.error('[analytics-pg] overview', e.message); return fail(res, 'Database error', 500); }
  }
  return ok(res, { totalUsers: Audit.find().length > 0 ? Activity.find().length : 0, events: Activity.find().length, auditEntries: Audit.find().length });
});
export default router;
