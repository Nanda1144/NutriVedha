import { Router } from 'express';
import type { Request, Response } from 'express';
import { db, ok, created, fail, requireAuth, getConfig } from '@nutrivedha/shared';

const config = getConfig('fitness', 3009);

interface Workout {
  id: string;
  name: string;
  category: string;
  duration: number;
  calories: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  premium?: boolean;
  description: string;
  steps: string[];
}

interface UserFitness {
  id: string;
  userId: string;
  workoutId: string;
  year: number;
  week: number;
  day: string;
  duration: number;
  calories: number;
  done: boolean;
  timestamp: string;
}

const Workouts = db.collection<Workout>('workouts');
const FitnessLog = db.collection<UserFitness>('fitness_log');

if (Workouts.find().length === 0) {
  [
    { name: 'Sun Salutation Flow', category: 'Yoga', duration: 15, calories: 85, difficulty: 'Beginner', premium: false, description: 'Classic Surya Namaskar sequence.', steps: ['Mountain pose', 'Forward fold', 'Plank', 'Cobra', 'Downward dog'] },
    { name: 'Pranayama Breathing', category: 'Meditation', duration: 10, calories: 30, difficulty: 'Beginner', premium: false, description: 'Anulom Vilom + Bhramari.', steps: ['Sit comfortably', 'Alternate nostril breathing', 'Humming breath'] },
    { name: 'Ayurvedic Core Burn', category: 'Strength', duration: 25, calories: 210, difficulty: 'Intermediate', premium: true, description: 'Core focused HIIT.', steps: ['Plank holds', 'Russian twists', 'Leg raises', 'Mountain climbers'] },
  ].forEach((w) => Workouts.insert({ ...w, id: Workouts.newId() } as Workout));
}

const router = Router();
router.use(requireAuth(config.jwtSecret));

// GET /api/fitness/workouts
router.get('/workouts', (_req: Request, res: Response) => ok(res, { workouts: Workouts.find() }));

// GET /api/fitness/workouts/:id
router.get('/workouts/:id', (req: Request, res: Response) => {
  const w = Workouts.findById(req.params.id);
  if (!w) return fail(res, 'Workout not found', 404);
  ok(res, { workout: w });
});

// POST /api/fitness/log
router.post('/log', (req: Request, res: Response) => {
  const { workoutId, year, week, day, duration, calories } = req.body ?? {};
  const w = Workouts.findById(workoutId as string);
  if (!w) return fail(res, 'Workout not found', 404);

  const entry: UserFitness = {
    id: FitnessLog.newId(),
    userId: req.user!.userId,
    workoutId,
    year: parseInt(year, 10),
    week: parseInt(week, 10),
    day,
    duration: parseFloat(duration),
    calories: parseFloat(calories),
    done: true,
    timestamp: new Date().toISOString(),
  };
  FitnessLog.insert(entry);
  return created(res, { entry });
});

// GET /api/fitness/log   (returns { logs, focus, streak })
router.get('/log', (req: Request, res: Response) => {
  const logs = FitnessLog.find({ userId: req.user!.userId, year: parseInt(req.query.year as string, 10), week: parseInt(req.query.week as string, 10) } as Partial<UserFitness>);
  const doneDays = new Set(logs.map((l) => l.day));
  const focus = logs.length;
  const done = doneDays.size;
  const scheduled = 7;
  const streak = doneDays.has(new Date().toLocaleDateString('en-CA')) ? done : 0;
  ok(res, { logs, focus, done, scheduled, streak });
});

// POST /api/fitness/log/clear
router.post('/log/clear', (req: Request, res: Response) => {
  FitnessLog.remove({ userId: req.user!.userId } as Partial<UserFitness>);
  ok(res, { message: 'Fitness log cleared' });
});

// GET /api/fitness/analytics
router.get('/analytics', (req: Request, res: Response) => {
  const logs = FitnessLog.find({ userId: req.user!.userId } as Partial<UserFitness>);
  const totalCalories = logs.reduce((s, l) => s + (l.calories || 0), 0);
  const totalMinutes = logs.reduce((s, l) => s + (l.duration || 0), 0);
  const days = new Set(logs.map((l) => l.timestamp.slice(0, 10))).size;
  ok(res, { totalCalories, totalMinutes, workoutsDone: logs.length, activeDays: days });
});

export default router;