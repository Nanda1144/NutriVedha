import { Router } from 'express';
import type { Request, Response } from 'express';
import { db, ok, created, fail, requireAuth, getConfig, pgQuery, isPgAvailable, getPool } from '@nutrivedha/shared';

const config = getConfig('fitness', 3009);
interface Workout { id: string; name: string; category: string; duration: number; calories: number; difficulty: 'Beginner' | 'Intermediate' | 'Advanced'; premium?: boolean; description: string; steps: string[]; }
interface UserFitness { id: string; userId: string; workoutId: string; year: number; week: number; day: string; duration: number; calories: number; done: boolean; timestamp: string; }
const Workouts = db.collection<Workout>('workouts');
const FitnessLog = db.collection<UserFitness>('fitness_log');
if (Workouts.find().length === 0) {
  [
    { name: 'Sun Salutation Flow', category: 'Yoga', duration: 15, calories: 85, difficulty: 'Beginner', premium: false, description: 'Classic Surya Namaskar sequence.', steps: ['Mountain pose', 'Forward fold', 'Plank', 'Cobra', 'Downward dog'] },
    { name: 'Pranayama Breathing', category: 'Meditation', duration: 10, calories: 30, difficulty: 'Beginner', premium: false, description: 'Anulom Vilom + Bhramari.', steps: ['Sit comfortably', 'Alternate nostril breathing', 'Humming breath'] },
    { name: 'Ayurvedic Core Burn', category: 'Strength', duration: 25, calories: 210, difficulty: 'Intermediate', premium: true, description: 'Core focused HIIT.', steps: ['Plank holds', 'Russian twists', 'Leg raises', 'Mountain climbers'] },
  ].forEach((w) => Workouts.insert({ ...w, id: Workouts.newId() } as Workout));
}
async function usePg(): Promise<boolean> { if (!getPool()) return false; return isPgAvailable(); }
const router = Router();
router.use(requireAuth(config.jwtSecret));
router.get('/workouts', async (_req: Request, res: Response) => {
  if (await usePg()) {
    try { const { rows } = await pgQuery(`SELECT id, name, category, duration, calories, difficulty, premium, description, steps FROM workouts ORDER BY created_at`); return ok(res, { workouts: rows }); } catch (e: any) { console.error('[fitness-pg] workouts', e.message); return fail(res, 'Database error', 500); }
  }
  return ok(res, { workouts: Workouts.find() });
});
router.get('/workouts/:id', async (req: Request, res: Response) => {
  if (await usePg()) {
    try { const { rows } = await pgQuery(`SELECT id, name, category, duration, calories, difficulty, premium, description, steps FROM workouts WHERE id=$1`, [req.params.id]); if (!rows[0]) return fail(res, 'Workout not found', 404); return ok(res, { workout: rows[0] }); } catch (e: any) { console.error('[fitness-pg] workout id', e.message); return fail(res, 'Database error', 500); }
  }
  const w = Workouts.findById(req.params.id);
  if (!w) return fail(res, 'Workout not found', 404);
  return ok(res, { workout: w });
});
router.post('/log', async (req: Request, res: Response) => {
  const { workoutId, year, week, day, duration, calories } = req.body ?? {};
  if (await usePg()) {
    try {
      const chk = await pgQuery(`SELECT id FROM workouts WHERE id=$1`, [workoutId]);
      if (!chk.rows[0]) return fail(res, 'Workout not found', 404);
      const { rows } = await pgQuery(`INSERT INTO fitness_log (user_id, workout_id, year, week, day, duration, calories, done) VALUES ($1,$2,$3,$4,$5,$6,$7,true) RETURNING id, user_id as "userId", workout_id as "workoutId", year, week, day, duration, calories, done, timestamp`, [req.user!.userId, workoutId, parseInt(year,10), parseInt(week,10), day, parseFloat(duration), parseFloat(calories)]);
      return created(res, { entry: rows[0] });
    } catch (e: any) { console.error('[fitness-pg] log POST', e.message); return fail(res, 'Database error', 500); }
  }
  const w = Workouts.findById(workoutId as string);
  if (!w) return fail(res, 'Workout not found', 404);
  const entry: UserFitness = { id: FitnessLog.newId(), userId: req.user!.userId, workoutId, year: parseInt(year,10), week: parseInt(week,10), day, duration: parseFloat(duration), calories: parseFloat(calories), done: true, timestamp: new Date().toISOString() };
  FitnessLog.insert(entry); return created(res, { entry });
});
router.get('/log', async (req: Request, res: Response) => {
  const y = parseInt(req.query.year as string, 10);
  const w = parseInt(req.query.week as string, 10);
  if (await usePg()) {
    try {
      let q = `SELECT id, user_id as "userId", workout_id as "workoutId", year, week, day, duration, calories, done, timestamp FROM fitness_log WHERE user_id=$1`;
      const params: any[] = [req.user!.userId];
      if (!isNaN(y)) { q += ` AND year=$${params.length+1}`; params.push(y); }
      if (!isNaN(w)) { q += ` AND week=$${params.length+1}`; params.push(w); }
      q += ` ORDER BY timestamp DESC`;
      const { rows } = await pgQuery(q, params);
      const doneDays = new Set(rows.map((l: any) => l.day));
      const focus = rows.length; const done = doneDays.size; const scheduled = 7; const streak = doneDays.has(new Date().toLocaleDateString('en-CA')) ? done : 0;
      return ok(res, { logs: rows, focus, done, scheduled, streak });
    } catch (e: any) { console.error('[fitness-pg] log GET', e.message); return fail(res, 'Database error', 500); }
  }
  const logs = FitnessLog.find({ userId: req.user!.userId, year: y, week: w } as Partial<UserFitness>);
  const doneDays = new Set(logs.map((l) => l.day));
  const focus = logs.length; const done = doneDays.size; const scheduled = 7; const streak = doneDays.has(new Date().toLocaleDateString('en-CA')) ? done : 0;
  return ok(res, { logs, focus, done, scheduled, streak });
});
router.post('/log/clear', async (req: Request, res: Response) => {
  if (await usePg()) {
    try { await pgQuery(`DELETE FROM fitness_log WHERE user_id=$1`, [req.user!.userId]); return ok(res, { message: 'Fitness log cleared' }); } catch (e: any) { console.error('[fitness-pg] clear', e.message); return fail(res, 'Database error', 500); }
  }
  FitnessLog.remove({ userId: req.user!.userId } as Partial<UserFitness>); return ok(res, { message: 'Fitness log cleared' });
});
router.get('/analytics', async (req: Request, res: Response) => {
  if (await usePg()) {
    try { const { rows } = await pgQuery(`SELECT COALESCE(SUM(calories),0) as "totalCalories", COALESCE(SUM(duration),0) as "totalMinutes", COUNT(*) as "workoutsDone", COUNT(DISTINCT DATE(timestamp)) as "activeDays" FROM fitness_log WHERE user_id=$1`, [req.user!.userId]); const r = rows[0] as any; return ok(res, { totalCalories: parseFloat(r.totalCalories), totalMinutes: parseFloat(r.totalMinutes), workoutsDone: parseInt(r.workoutsDone,10), activeDays: parseInt(r.activeDays,10) }); } catch (e: any) { console.error('[fitness-pg] analytics', e.message); return fail(res, 'Database error', 500); }
  }
  const logs = FitnessLog.find({ userId: req.user!.userId } as Partial<UserFitness>);
  const totalCalories = logs.reduce((s, l) => s + (l.calories || 0), 0);
  const totalMinutes = logs.reduce((s, l) => s + (l.duration || 0), 0);
  const days = new Set(logs.map((l) => l.timestamp.slice(0, 10))).size;
  return ok(res, { totalCalories, totalMinutes, workoutsDone: logs.length, activeDays: days });
});
export default router;
