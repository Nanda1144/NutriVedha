import { Router } from 'express';
import type { Request, Response } from 'express';
import { db, ok, created, fail, requireAuth, getConfig } from '@nutrivedha/shared';

const config = getConfig('notification', 3010);

interface Notif {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'appointment' | 'order' | 'premium' | 'health' | 'alert';
  read: boolean;
  sentAt: string;
  channel: 'push' | 'email' | 'inapp';
}

const Notifs = db.collection<Notif>('notifications');

const router = Router();
router.use(requireAuth(config.jwtSecret));

// GET /api/notification
router.get('/', (req: Request, res: Response) => {
  const notifs = Notifs.find({ userId: req.user!.userId } as Partial<Notif>)
    .sort((a, b) => (a.sentAt < b.sentAt ? 1 : -1))
    .slice(0, 50);
  const unread = notifs.filter((n) => !n.read).length;
  ok(res, { notifications: notifs, unread });
});

// POST /api/notification/send
router.post('/send', (req: Request, res: Response) => {
  const { title, message, type, channel } = req.body ?? {};
  if (!title || !message) return fail(res, 'title and message required');
  const notif: Notif = {
    id: Notifs.newId(),
    userId: req.user!.userId,
    title,
    message,
    type: type ?? 'health',
    read: false,
    sentAt: new Date().toISOString(),
    channel: channel ?? 'inapp',
  };
  Notifs.insert(notif);
  return created(res, { notification: notif });
});

// POST /api/notification/broadcast  (admin)
router.post('/broadcast', (req: Request, res: Response) => {
  const { title, message, type } = req.body ?? {};
  if (!title || !message) return fail(res, 'title and message required');
  const ids = Notifs.find().map((n) => n.userId);
  const uniq = [...new Set(ids)];
  const createdList = uniq.map((userId) => {
    const notif: Notif = {
      id: Notifs.newId(),
      userId,
      title,
      message,
      type: type ?? 'alert',
      read: false,
      sentAt: new Date().toISOString(),
      channel: 'inapp',
    };
    Notifs.insert(notif);
    return notif;
  });
  return created(res, { broadcast: createdList.length });
});

// POST /api/notification/:id/read
router.post('/:id/read', (req: Request, res: Response) => {
  const notif = Notifs.findById(req.params.id);
  if (!notif || notif.userId !== req.user!.userId) return fail(res, 'Notification not found', 404);
  Notifs.update(notif.id, { read: true });
  ok(res, { notification: Notifs.findById(notif.id) });
});

// POST /api/notification/clear
router.post('/clear', (req: Request, res: Response) => {
  Notifs.remove({ userId: req.user!.userId } as Partial<Notif>);
  ok(res, { message: 'Notifications cleared' });
});

export default router;