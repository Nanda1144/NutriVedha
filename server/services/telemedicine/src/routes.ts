import { Router } from 'express';
import type { Request, Response } from 'express';
import { db, ok, created, fail, requireAuth, getConfig } from '@nutrivedha/shared';

const config = getConfig('telemedicine', 3006);

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  rating: number;
  reviews: number;
  status: 'Available' | 'In Call' | 'Offline';
  fee: number;
  photo: string;
}

interface Appointment {
  id: string;
  userId: string;
  doctorId: string;
  date: string;
  time: string;
  mode: 'video' | 'chat';
  status: 'Booked' | 'Completed' | 'Cancelled';
  createdAt: string;
  accessToken?: string;
}

const Doctors = db.collection<Doctor>('doctors');
const Appointments = db.collection<Appointment>('appointments');

// Seed default doctors
if (Doctors.find().length === 0) {
  [
    { name: 'Dr. Ananya Sharma', specialization: 'Ayurvedic Internal Medicine', experience: '12+ Years', rating: 4.8, reviews: 124, status: 'Available', fee: 500 },
    { name: 'Dr. Vikram Mehra', specialization: 'Ayurvedic Skin Specialist', experience: '8+ Years', rating: 4.9, reviews: 86, status: 'In Call', fee: 800 },
    { name: 'Dr. Priya Iyer', specialization: 'Nutrition & Dietetics', experience: '10+ Years', rating: 4.7, reviews: 210, status: 'Available', fee: 600 },
    { name: 'Dr. Sanjay Gupta', specialization: 'Stress Management', experience: '15+ Years', rating: 5.0, reviews: 340, status: 'Available', fee: 1000 },
  ].forEach((d, i) => {
    Doctors.insert({ ...d, id: Doctors.newId(), photo: `https://i.pravatar.cc/150?img=${i + 12}` } as Doctor);
  });
}

const router = Router();
router.use(requireAuth(config.jwtSecret));

// GET /api/telemedicine/doctors
router.get('/doctors', (_req: Request, res: Response) => ok(res, { doctors: Doctors.find() }));

// POST /api/telemedicine/appointments
router.post('/appointments', (req: Request, res: Response) => {
  const { doctorId, date, time, mode } = req.body ?? {};
  const doctor = Doctors.findById(doctorId as string);
  if (!doctor) return fail(res, 'Doctor not found', 404);
  if (doctor.status === 'Offline') return fail(res, 'Doctor offline', 409);

  const appt: Appointment = {
    id: Appointments.newId(),
    userId: req.user!.userId,
    doctorId,
    date,
    time,
    mode: mode === 'chat' ? 'chat' : 'video',
    status: 'Booked',
    createdAt: new Date().toISOString(),
  };
  Appointments.insert(appt);
  return created(res, { appointment: appt });
});

// GET /api/telemedicine/appointments
router.get('/appointments', (req: Request, res: Response) => {
  ok(res, { appointments: Appointments.find({ userId: req.user!.userId } as Partial<Appointment>) });
});

// POST /api/telemedicine/appointments/:id/cancel
router.post('/appointments/:id/cancel', (req: Request, res: Response) => {
  const appt = Appointments.findById(req.params.id);
  if (!appt || appt.userId !== req.user!.userId) return fail(res, 'Appointment not found', 404);
  Appointments.update(appt.id, { status: 'Cancelled' });
  ok(res, { message: 'Appointment cancelled' });
});

export default router;