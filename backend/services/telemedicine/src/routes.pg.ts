import { Router } from 'express';
import type { Request, Response } from 'express';
import { db, ok, created, fail, requireAuth, getConfig, pgQuery, isPgAvailable, getPool } from '@nutrivedha/shared';

const config = getConfig('telemedicine', 3006);
interface Doctor { id: string; name: string; specialization: string; experience: string; rating: number; reviews: number; status: 'Available' | 'In Call' | 'Offline'; fee: number; photo: string; }
interface Appointment { id: string; userId: string; doctorId: string; date: string; time: string; mode: 'video' | 'chat'; status: 'Booked' | 'Completed' | 'Cancelled'; createdAt: string; }
const Doctors = db.collection<Doctor>('doctors');
const Appointments = db.collection<Appointment>('appointments');
if (Doctors.find().length === 0) {
  [
    { name: 'Dr. Ananya Sharma', specialization: 'Ayurvedic Internal Medicine', experience: '12+ Years', rating: 4.8, reviews: 124, status: 'Available', fee: 500 },
    { name: 'Dr. Vikram Mehra', specialization: 'Ayurvedic Skin Specialist', experience: '8+ Years', rating: 4.9, reviews: 86, status: 'In Call', fee: 800 },
    { name: 'Dr. Priya Iyer', specialization: 'Nutrition & Dietetics', experience: '10+ Years', rating: 4.7, reviews: 210, status: 'Available', fee: 600 },
    { name: 'Dr. Sanjay Gupta', specialization: 'Stress Management', experience: '15+ Years', rating: 5.0, reviews: 340, status: 'Available', fee: 1000 },
  ].forEach((d, i) => { Doctors.insert({ ...d, id: Doctors.newId(), photo: `https://i.pravatar.cc/150?img=${i + 12}` } as Doctor); });
}
async function usePg(): Promise<boolean> { if (!getPool()) return false; return isPgAvailable(); }
const router = Router();
router.use(requireAuth(config.jwtSecret));
router.get('/doctors', async (_req: Request, res: Response) => {
  if (await usePg()) {
    try { const { rows } = await pgQuery(`SELECT id, name, specialization, experience, rating, reviews, status, fee, photo FROM doctor_profiles WHERE verified=true ORDER BY rating DESC`); if (rows.length === 0) { const { rows: all } = await pgQuery(`SELECT id, name, specialization, experience, rating, reviews, status, fee FROM doctor_profiles ORDER BY rating DESC`); return ok(res, { doctors: all.length ? all : Doctors.find() }); } return ok(res, { doctors: rows }); } catch (e: any) { console.error('[tele-pg] doctors', e.message); return ok(res, { doctors: Doctors.find() }); }
  }
  return ok(res, { doctors: Doctors.find() });
});
router.post('/appointments', async (req: Request, res: Response) => {
  const { doctorId, date, time, mode } = req.body ?? {};
  if (await usePg()) {
    try {
      const { rows } = await pgQuery(`SELECT id, status FROM doctor_profiles WHERE id=$1`, [doctorId]);
      if (!rows[0]) return fail(res, 'Doctor not found', 404);
      if (rows[0].status === 'Offline') return fail(res, 'Doctor offline', 409);
      const { rows: appt } = await pgQuery(`INSERT INTO appointments (patient_user_id, doctor_profile_id, date, time, mode, status, fee) VALUES ($1,$2,$3,$4,$5,'Booked',$6) RETURNING id, patient_user_id as "userId", doctor_profile_id as "doctorId", date, time, mode, status, created_at as "createdAt"`, [req.user!.userId, doctorId, date, time, mode === 'chat' ? 'chat' : 'video', 500]);
      return created(res, { appointment: appt[0] });
    } catch (e: any) { console.error('[tele-pg] appointments POST', e.message); return fail(res, 'Database error', 500); }
  }
  const doctor = Doctors.findById(doctorId as string);
  if (!doctor) return fail(res, 'Doctor not found', 404);
  if (doctor.status === 'Offline') return fail(res, 'Doctor offline', 409);
  const appt: Appointment = { id: Appointments.newId(), userId: req.user!.userId, doctorId, date, time, mode: mode === 'chat' ? 'chat' : 'video', status: 'Booked', createdAt: new Date().toISOString() };
  Appointments.insert(appt); return created(res, { appointment: appt });
});
router.get('/appointments', async (req: Request, res: Response) => {
  if (await usePg()) {
    try { const { rows } = await pgQuery(`SELECT id, patient_user_id as "userId", doctor_profile_id as "doctorId", date, time, mode, status, created_at as "createdAt" FROM appointments WHERE patient_user_id=$1 ORDER BY created_at DESC`, [req.user!.userId]); return ok(res, { appointments: rows }); } catch (e: any) { console.error('[tele-pg] appointments GET', e.message); return fail(res, 'Database error', 500); }
  }
  return ok(res, { appointments: Appointments.find({ userId: req.user!.userId } as Partial<Appointment>) });
});
router.post('/appointments/:id/cancel', async (req: Request, res: Response) => {
  if (await usePg()) {
    try { const { rows } = await pgQuery(`UPDATE appointments SET status='Cancelled' WHERE id=$1 AND patient_user_id=$2 RETURNING id`, [req.params.id, req.user!.userId]); if (!rows[0]) return fail(res, 'Appointment not found', 404); return ok(res, { message: 'Appointment cancelled' }); } catch (e: any) { console.error('[tele-pg] cancel', e.message); return fail(res, 'Database error', 500); }
  }
  const appt = Appointments.findById(req.params.id);
  if (!appt || appt.userId !== req.user!.userId) return fail(res, 'Appointment not found', 404);
  Appointments.update(appt.id, { status: 'Cancelled' }); return ok(res, { message: 'Appointment cancelled' });
});
export default router;
