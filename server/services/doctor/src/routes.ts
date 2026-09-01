import { Router } from 'express';
import type { Request, Response } from 'express';
import { db, ok, created, fail, requireAuth, requireRole, getConfig } from '@nutrivedha/shared';

const config = getConfig('doctor', 3014);

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

const router = Router();
router.use(requireAuth(config.jwtSecret));
router.use(requireRole('Doctor', 'Admin'));

// GET /api/doctor/profile
router.get('/profile', (req: Request, res: Response) => {
  const profile = Profiles.findOne({ userId: req.user!.userId } as Partial<DoctorProfile>);
  if (!profile) return fail(res, 'Doctor profile not found', 404);
  ok(res, { profile });
});

// POST /api/doctor/profile
router.post('/profile', (req: Request, res: Response) => {
  const { name, specialization, regNumber, experience } = req.body ?? {};
  if (!name || !regNumber) return fail(res, 'name and regNumber required');
  const existing = Profiles.findOne({ userId: req.user!.userId } as Partial<DoctorProfile>);
  if (existing) return fail(res, 'Profile already exists', 409);

  const profile: DoctorProfile = {
    id: Profiles.newId(),
    userId: req.user!.userId,
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
router.post('/verify/:id', requireRole('Admin'), (req: Request, res: Response) => {
  const profile = Profiles.findById(req.params.id);
  if (!profile) return fail(res, 'Profile not found', 404);
  Profiles.update(profile.id, { verified: true });
  ok(res, { profile: Profiles.findById(profile.id) });
});

// GET /api/doctor/patients
router.get('/patients', (req: Request, res: Response) => {
  const profile = Profiles.findOne({ userId: req.user!.userId } as Partial<DoctorProfile>);
  if (!profile) return fail(res, 'Doctor profile not found', 404);
  ok(res, { patients: Patients.find({ doctorId: profile.id } as Partial<PatientRecord>) });
});

// POST /api/doctor/patients/:id/notes
router.post('/patients/:id/notes', (req: Request, res: Response) => {
  const record = Patients.findById(req.params.id);
  if (!record) return fail(res, 'Patient not found', 404);
  Patients.update(record.id, { notes: (req.body.notes as string) ?? record.notes });
  ok(res, { patient: Patients.findById(record.id) });
});

export default router;