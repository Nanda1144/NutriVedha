import { Router } from 'express';
import type { Request, Response } from 'express';
import { db, ok, created, fail, requireAuth, requireRole, getConfig, pgQuery, isPgAvailable, getPool } from '@nutrivedha/shared';

const config = getConfig('doctor', 3014);

// JSON fallback collections (used when PostgreSQL not configured/available)
interface DoctorProfile {
  id: string;
  userId: string;
  name: string;
  specialization: string;
  regNumber: string;
  verified: boolean;
  patients: number;
  experience: string;
}
interface PatientRecord {
  id: string;
  doctorId: string;
  userId: string;
  name: string;
  lastVisit: string;
  notes: string;
}
const Profiles = db.collection<DoctorProfile>('doctor_profiles');
const Patients = db.collection<PatientRecord>('patient_records');

async function usePg(): Promise<boolean> {
  if (!getPool()) return false;
  return isPgAvailable();
}

const router = Router();
router.use(requireAuth(config.jwtSecret));
router.use(requireRole('Doctor', 'Admin'));

// GET /api/doctor/profile
router.get('/profile', async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  if (await usePg()) {
    try {
      const { rows } = await pgQuery<DoctorProfile & { user_id: string; reg_number: string }>(
        `SELECT id, user_id as "userId", name, specialization, reg_number as "regNumber", verified, patients, experience FROM doctor_profiles WHERE user_id = $1`,
        [userId]
      );
      if (!rows[0]) return fail(res, 'Doctor profile not found', 404);
      return ok(res, { profile: rows[0] });
    } catch (e: any) {
      console.error('[doctor-pg] GET /profile', e.message);
      return fail(res, 'Database error', 500);
    }
  }
  const profile = Profiles.findOne({ userId } as Partial<DoctorProfile>);
  if (!profile) return fail(res, 'Doctor profile not found', 404);
  return ok(res, { profile });
});

// POST /api/doctor/profile
router.post('/profile', async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { name, specialization, regNumber, experience } = req.body ?? {};
  if (!name || !regNumber) return fail(res, 'name and regNumber required');
  if (await usePg()) {
    try {
      const existing = await pgQuery(`SELECT id FROM doctor_profiles WHERE user_id = $1`, [userId]);
      if (existing.rowCount > 0) return fail(res, 'Profile already exists', 409);
      const dup = await pgQuery(`SELECT id FROM doctor_profiles WHERE reg_number = $1`, [regNumber]);
      if (dup.rowCount > 0) return fail(res, 'Registration number already exists', 409);
      const { rows } = await pgQuery(
        `INSERT INTO doctor_profiles (user_id, name, specialization, reg_number, experience) VALUES ($1,$2,$3,$4,$5) RETURNING id, user_id as "userId", name, specialization, reg_number as "regNumber", verified, patients, experience`,
        [userId, name, specialization ?? 'General Ayurveda', regNumber, experience ?? '5+ Years']
      );
      return created(res, { profile: rows[0], message: 'Registration submitted; awaiting verification' });
    } catch (e: any) {
      if (e.code === '23505') return fail(res, 'Registration number already exists', 409);
      console.error('[doctor-pg] POST /profile', e.message);
      return fail(res, 'Database error', 500);
    }
  }
  const existing = Profiles.findOne({ userId } as Partial<DoctorProfile>);
  if (existing) return fail(res, 'Profile already exists', 409);
  const profile: DoctorProfile = {
    id: Profiles.newId(),
    userId,
    name,
    specialization: specialization ?? 'General Ayurveda',
    regNumber,
    verified: false,
    patients: 0,
    experience: experience ?? '5+ Years',
  };
  Profiles.insert(profile);
  return created(res, { profile, message: 'Registration submitted; awaiting verification' });
});

// POST /api/doctor/verify/:id  (admin approves)
router.post('/verify/:id', requireRole('Admin'), async (req: Request, res: Response) => {
  const id = req.params.id;
  if (await usePg()) {
    try {
      const { rows } = await pgQuery(`UPDATE doctor_profiles SET verified = true WHERE id = $1 RETURNING id, user_id as "userId", name, specialization, reg_number as "regNumber", verified, patients, experience`, [id]);
      if (!rows[0]) return fail(res, 'Profile not found', 404);
      return ok(res, { profile: rows[0] });
    } catch (e: any) {
      console.error('[doctor-pg] POST /verify', e.message);
      return fail(res, 'Database error', 500);
    }
  }
  const profile = Profiles.findById(id);
  if (!profile) return fail(res, 'Profile not found', 404);
  Profiles.update(profile.id, { verified: true });
  return ok(res, { profile: Profiles.findById(profile.id) });
});

// GET /api/doctor/patients
router.get('/patients', async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  if (await usePg()) {
    try {
      const prof = await pgQuery(`SELECT id FROM doctor_profiles WHERE user_id = $1`, [userId]);
      if (!prof.rows[0]) return fail(res, 'Doctor profile not found', 404);
      const doctorId = prof.rows[0].id;
      const { rows } = await pgQuery(`SELECT id, doctor_id as "doctorId", user_id as "userId", name, last_visit as "lastVisit", notes FROM patient_records WHERE doctor_id = $1 ORDER BY last_visit DESC`, [doctorId]);
      return ok(res, { patients: rows });
    } catch (e: any) {
      console.error('[doctor-pg] GET /patients', e.message);
      return fail(res, 'Database error', 500);
    }
  }
  const profile = Profiles.findOne({ userId } as Partial<DoctorProfile>);
  if (!profile) return fail(res, 'Doctor profile not found', 404);
  return ok(res, { patients: Patients.find({ doctorId: profile.id } as Partial<PatientRecord>) });
});

// POST /api/doctor/patients/:id/notes
router.post('/patients/:id/notes', async (req: Request, res: Response) => {
  const id = req.params.id;
  const notes = (req.body.notes as string) ?? '';
  if (await usePg()) {
    try {
      const { rows } = await pgQuery(`UPDATE patient_records SET notes = $1 WHERE id = $2 RETURNING id, doctor_id as "doctorId", user_id as "userId", name, last_visit as "lastVisit", notes`, [notes, id]);
      if (!rows[0]) return fail(res, 'Patient not found', 404);
      return ok(res, { patient: rows[0] });
    } catch (e: any) {
      console.error('[doctor-pg] POST /notes', e.message);
      return fail(res, 'Database error', 500);
    }
  }
  const record = Patients.findById(id);
  if (!record) return fail(res, 'Patient not found', 404);
  Patients.update(record.id, { notes });
  return ok(res, { patient: Patients.findById(record.id) });
});

// Bonus: GET /api/doctor/verification-queue  (for DoctorDashboard verify panel)
router.get('/verification-queue', async (_req: Request, res: Response) => {
  if (await usePg()) {
    try {
      const { rows } = await pgQuery(`SELECT id, patient_name as patient, condition, severity, status FROM verification_queue WHERE status = 'Pending' ORDER BY created_at DESC LIMIT 20`);
      return ok(res, { queue: rows });
    } catch (e: any) {
      console.error('[doctor-pg] verification-queue', e.message);
      return fail(res, 'Database error', 500);
    }
  }
  // JSON fallback mock
  return ok(res, { queue: [] });
});

export default router;
