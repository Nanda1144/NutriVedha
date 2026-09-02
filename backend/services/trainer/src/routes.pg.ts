import { Router } from 'express';
import type { Request, Response } from 'express';
import { db, ok, created, fail, requireAuth, requireRole, getConfig, pgQuery, isPgAvailable, getPool } from '@nutrivedha/shared';

const config = getConfig('trainer', 3015);
interface Trainee { id: string; userId: string; trainerId: string; name: string; goal: string; compliance: number; status: 'In Progress' | 'Completed'; progress: number; lastActive: string; }
interface TrainerSession { id: string; trainerId: string; time: string; title: string; type: string; }
const Trainees = db.collection<Trainee>('trainer_trainees');
const Sessions = db.collection<TrainerSession>('trainer_sessions');
async function usePg(): Promise<boolean> { if (!getPool()) return false; return isPgAvailable(); }
const router = Router();
router.use(requireAuth(config.jwtSecret));
router.get('/trainees', requireRole('Trainer','Admin','User'), async (req: Request, res: Response) => {
  if (await usePg()) {
    try { const { rows } = await pgQuery(`SELECT id, user_id as "userId", trainer_id as "trainerId", name, goal, compliance, status, progress, last_active as "lastActive" FROM trainer_trainees WHERE trainer_id=$1 OR $2='Admin' ORDER BY compliance DESC`, [req.user!.userId, req.user!.role]); return ok(res, { trainees: rows }); } catch (e: any) { console.error('[trainer-pg] trainees GET', e.message); return fail(res, 'Database error', 500); }
  }
  return ok(res, { trainees: Trainees.find({ trainerId: req.user!.userId } as Partial<Trainee>) });
});
router.post('/trainees', requireRole('Trainer','Admin'), async (req: Request, res: Response) => {
  const { name, goal, compliance } = req.body ?? {};
  if (!name || !goal) return fail(res, 'name and goal required');
  if (await usePg()) {
    try { const { rows } = await pgQuery(`INSERT INTO trainer_trainees (user_id, trainer_id, name, goal, compliance, status, progress, last_active) VALUES ($1,$2,$3,$4,$5,'In Progress',$5,NOW()) RETURNING id, user_id as "userId", trainer_id as "trainerId", name, goal, compliance, status, progress, last_active as "lastActive"`, [req.user!.userId, req.user!.userId, name, goal, parseInt(compliance,10)||65]); return created(res, { trainee: rows[0] }); } catch (e: any) { console.error('[trainer-pg] POST', e.message); return fail(res, 'Database error', 500); }
  }
  const trainee: Trainee = { id: Trainees.newId(), userId: req.user!.userId, trainerId: req.user!.userId, name, goal, compliance: parseInt(compliance,10)||65, status: 'In Progress', progress: parseInt(compliance,10)||65, lastActive: new Date().toISOString() }; Trainees.insert(trainee); return created(res, { trainee });
});
router.get('/sessions', async (req: Request, res: Response) => {
  if (await usePg()) {
    try { const { rows } = await pgQuery(`SELECT id, trainer_id as "trainerId", time, title, type FROM trainer_sessions WHERE trainer_id=$1 ORDER BY time`, [req.user!.userId]); return ok(res, { sessions: rows }); } catch (e: any) { console.error('[trainer-pg] sessions', e.message); return fail(res, 'Database error', 500); }
  }
  return ok(res, { sessions: Sessions.find({ trainerId: req.user!.userId } as Partial<TrainerSession>) });
});
router.post('/sessions', requireRole('Trainer','Admin'), async (req: Request, res: Response) => {
  const { time, title, type } = req.body ?? {};
  if (!title) return fail(res, 'title required');
  if (await usePg()) {
    try { const { rows } = await pgQuery(`INSERT INTO trainer_sessions (trainer_id, time, title, type) VALUES ($1,$2,$3,$4) RETURNING id, trainer_id as "trainerId", time, title, type`, [req.user!.userId, time || '10:00 AM', title, type || 'Custom']); return created(res, { session: rows[0] }); } catch (e: any) { console.error('[trainer-pg] session POST', e.message); return fail(res, 'Database error', 500); }
  }
  const sess: TrainerSession = { id: Sessions.newId(), trainerId: req.user!.userId, time: time || '10:00 AM', title, type: type || 'Custom' }; Sessions.insert(sess); return created(res, { session: sess });
});
export default router;
