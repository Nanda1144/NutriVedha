import { Router } from 'express';
import type { Request, Response } from 'express';
import { db, ok, created, fail, requireAuth, requireRole, getConfig } from '@nutrivedha/shared';

const config = getConfig('analytics', 3011);

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  meta?: string;
  ip?: string;
  createdAt: string;
}

interface ActivityEvent {
  id: string;
  userId: string;
  event: string;
  createdAt: string;
}

const Audit = db.collection<AuditLog>('audit_logs');
const Activity = db.collection<ActivityEvent>('activity_events');

if (Activity.find().length === 0) {
  (['Login', 'Diet Plan Generated', 'Report Shared', 'Consultation Booked'] as const).forEach((ev, i) => {
    Activity.insert({ id: Activity.newId(), userId: 'seed-user', event: ev, createdAt: new Date(Date.now() - i * 3600_000).toISOString() });
  });
}

const router = Router();

// GET /api/analytics/audit (self) or all (admin)
router.get('/audit', requireAuth(config.jwtSecret), (req: Request, res: Response) => {
  const isAdmin = req.user!.role === 'Admin';
  const logs = (isAdmin
    ? Audit.find()
    : Audit.find({ userId: req.user!.userId } as Partial<AuditLog>)
  ).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 100);
  ok(res, { logs });
});

// POST /api/analytics/log (internal)
router.post('/log', (req: Request, res: Response) => {
  const { userId, action, entity, meta } = req.body ?? {};
  if (!userId || !action) return fail(res, 'userId and action required');
  const log: AuditLog = {
    id: Audit.newId(),
    userId,
    action,
    entity: entity ?? '',
    meta: meta ? JSON.stringify(meta) : undefined,
    ip: req.ip,
    createdAt: new Date().toISOString(),
  };
  Audit.insert(log);
  return created(res, { log });
});

// GET /api/analytics/activity
router.get('/activity', requireAuth(config.jwtSecret), (req: Request, res: Response) => {
  const limit = Math.min(50, parseInt(req.query.limit as string, 10) || 30);
  const events = Activity.find({ userId: req.user!.userId } as Partial<ActivityEvent>)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, limit);
  const byEvent: Record<string, number> = {};
  for (const e of Activity.find({ userId: req.user!.userId } as Partial<ActivityEvent>)) byEvent[e.event] = (byEvent[e.event] ?? 0) + 1;
  ok(res, { events, summary: byEvent });
});

// POST /api/analytics/activity
router.post('/activity', requireAuth(config.jwtSecret), (req: Request, res: Response) => {
  const { event } = req.body ?? {};
  if (!event) return fail(res, 'event required');
  const entry: ActivityEvent = { id: Activity.newId(), userId: req.user!.userId, event, createdAt: new Date().toISOString() };
  Activity.insert(entry);
  return created(res, { event: entry });
});

// GET /api/analytics/admin/overview
router.get('/admin/overview', requireAuth(config.jwtSecret), requireRole('Admin'), (_req: Request, res: Response) => ok(res, {
  totalUsers: Audit.find().length > 0 ? Activity.find().length : 0,
  events: Activity.find().length,
  auditEntries: Audit.find().length,
}));

export default router;