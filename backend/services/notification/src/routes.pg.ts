import { Router } from 'express';
import type { Request, Response } from 'express';
import { db, ok, created, fail, requireAuth, getConfig, pgQuery, isPgAvailable, getPool } from '@nutrivedha/shared';

const config = getConfig('notification', 3010);
interface Notif { id: string; userId: string; title: string; message: string; type: 'appointment' | 'order' | 'premium' | 'health' | 'alert'; read: boolean; sentAt: string; channel: 'push' | 'email' | 'inapp'; }
const Notifs = db.collection<Notif>('notifications');
async function usePg(): Promise<boolean> { if (!getPool()) return false; return isPgAvailable(); }
const router = Router();
router.use(requireAuth(config.jwtSecret));
router.get('/', async (req: Request, res: Response) => {
  if (await usePg()) {
    try { const { rows } = await pgQuery(`SELECT id, user_id as "userId", title, message, type, read, sent_at as "sentAt", channel FROM notifications WHERE user_id=$1 ORDER BY sent_at DESC LIMIT 50`, [req.user!.userId]); const unread = rows.filter((n: any) => !n.read).length; return ok(res, { notifications: rows, unread }); } catch (e: any) { console.error('[notif-pg] GET', e.message); return fail(res, 'Database error', 500); }
  }
  const notifs = Notifs.find({ userId: req.user!.userId } as Partial<Notif>).sort((a, b) => (a.sentAt < b.sentAt ? 1 : -1)).slice(0, 50);
  const unread = notifs.filter((n) => !n.read).length; return ok(res, { notifications: notifs, unread });
});
router.post('/send', async (req: Request, res: Response) => {
  const { title, message, type, channel } = req.body ?? {};
  if (!title || !message) return fail(res, 'title and message required');
  if (await usePg()) {
    try { const { rows } = await pgQuery(`INSERT INTO notifications (user_id, title, message, type, read, channel) VALUES ($1,$2,$3,$4,false,$5) RETURNING id, user_id as "userId", title, message, type, read, sent_at as "sentAt", channel`, [req.user!.userId, title, message, type ?? 'health', channel ?? 'inapp']); return created(res, { notification: rows[0] }); } catch (e: any) { console.error('[notif-pg] send', e.message); return fail(res, 'Database error', 500); }
  }
  const notif: Notif = { id: Notifs.newId(), userId: req.user!.userId, title, message, type: type ?? 'health', read: false, sentAt: new Date().toISOString(), channel: channel ?? 'inapp' }; Notifs.insert(notif); return created(res, { notification: notif });
});
router.post('/broadcast', async (req: Request, res: Response) => {
  const { title, message, type } = req.body ?? {};
  if (!title || !message) return fail(res, 'title and message required');
  if (await usePg()) {
    try {
      const { rows: users } = await pgQuery(`SELECT DISTINCT user_id FROM notifications UNION SELECT id FROM users LIMIT 1000`);
      const uniq = users.map((u: any) => u.user_id || u.id).filter(Boolean);
      const targets = uniq.length ? uniq : [req.user!.userId];
      for (const uid of targets) { await pgQuery(`INSERT INTO notifications (user_id, title, message, type, channel) VALUES ($1,$2,$3,$4,'inapp')`, [uid, title, message, type ?? 'alert']); }
      return created(res, { broadcast: targets.length });
    } catch (e: any) { console.error('[notif-pg] broadcast', e.message); return fail(res, 'Database error', 500); }
  }
  const ids = Notifs.find().map((n) => n.userId);
  const uniq = [...new Set(ids)]; const targets = uniq.length ? uniq : [req.user!.userId];
  const createdList = targets.map((userId) => { const notif: Notif = { id: Notifs.newId(), userId, title, message, type: type ?? 'alert', read: false, sentAt: new Date().toISOString(), channel: 'inapp' }; Notifs.insert(notif); return notif; });
  return created(res, { broadcast: createdList.length });
});
router.post('/:id/read', async (req: Request, res: Response) => {
  if (await usePg()) {
    try { const { rows } = await pgQuery(`UPDATE notifications SET read=true WHERE id=$1 AND user_id=$2 RETURNING id, user_id as "userId", read`, [req.params.id, req.user!.userId]); if (!rows[0]) return fail(res, 'Notification not found', 404); return ok(res, { notification: rows[0] }); } catch (e: any) { console.error('[notif-pg] read', e.message); return fail(res, 'Database error', 500); }
  }
  const notif = Notifs.findById(req.params.id);
  if (!notif || notif.userId !== req.user!.userId) return fail(res, 'Notification not found', 404);
  Notifs.update(notif.id, { read: true }); return ok(res, { notification: Notifs.findById(notif.id) });
});
router.post('/clear', async (req: Request, res: Response) => {
  if (await usePg()) {
    try { await pgQuery(`DELETE FROM notifications WHERE user_id=$1`, [req.user!.userId]); return ok(res, { message: 'Notifications cleared' }); } catch (e: any) { console.error('[notif-pg] clear', e.message); return fail(res, 'Database error', 500); }
  }
  Notifs.remove({ userId: req.user!.userId } as Partial<Notif>); return ok(res, { message: 'Notifications cleared' });
});
export default router;
