import { Router } from 'express';
import type { Request, Response } from 'express';
import { db, ok, created, fail, requireAuth, encrypt, decrypt, getConfig, pgQuery, isPgAvailable, getPool } from '@nutrivedha/shared';

const config = getConfig('medical', 3005);
const SECRET = config.medicalEncryptionKey;
export interface MedicalReport { id: string; userId: string; date: string; encryptedData: string; createdAt: string; }
const Reports = db.collection<MedicalReport>('medical_reports');
async function usePg(): Promise<boolean> { if (!getPool()) return false; return isPgAvailable(); }
const router = Router();
router.use(requireAuth(config.jwtSecret));
router.post('/reports', async (req: Request, res: Response) => {
  const { condition, symptoms, severity, recommendations, imageData } = req.body ?? {};
  if (!condition) return fail(res, 'condition required');
  const payload = JSON.stringify({ condition, symptoms, severity, recommendations, imageData: imageData ?? null });
  const encryptedData = encrypt(payload, SECRET);
  const date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  if (await usePg()) {
    try { const { rows } = await pgQuery(`INSERT INTO medical_reports (user_id, date, encrypted_data) VALUES ($1,$2,$3) RETURNING id, date`, [req.user!.userId, date, encryptedData]); return created(res, { id: rows[0].id, date: rows[0].date }); } catch (e: any) { console.error('[medical-pg] POST', e.message); return fail(res, 'Database error', 500); }
  }
  const report: MedicalReport = { id: Reports.newId(), userId: req.user!.userId, date, encryptedData, createdAt: new Date().toISOString() };
  Reports.insert(report); return created(res, { id: report.id, date: report.date });
});
router.get('/reports', async (req: Request, res: Response) => {
  if (await usePg()) {
    try { const { rows } = await pgQuery(`SELECT id, date, encrypted_data as "encryptedData" FROM medical_reports WHERE user_id=$1 ORDER BY created_at DESC`, [req.user!.userId]); const list = rows.map((r: any) => ({ id: r.id, date: r.date, ...JSON.parse(decrypt(r.encryptedData, SECRET)) })); return ok(res, { reports: list }); } catch (e: any) { console.error('[medical-pg] GET', e.message); return fail(res, 'Database error', 500); }
  }
  const list = Reports.find({ userId: req.user!.userId } as Partial<MedicalReport>).map((r) => ({ id: r.id, date: r.date, ...JSON.parse(decrypt(r.encryptedData, SECRET)) })); return ok(res, { reports: list });
});
router.get('/reports/:id', async (req: Request, res: Response) => {
  if (await usePg()) {
    try { const { rows } = await pgQuery(`SELECT id, user_id as "userId", date, encrypted_data as "encryptedData" FROM medical_reports WHERE id=$1`, [req.params.id]); if (!rows[0] || (rows[0] as any).userId !== req.user!.userId) return fail(res, 'Report not found', 404); const r = rows[0] as any; return ok(res, { report: { id: r.id, date: r.date, ...JSON.parse(decrypt(r.encryptedData, SECRET)) } }); } catch (e: any) { console.error('[medical-pg] GET id', e.message); return fail(res, 'Database error', 500); }
  }
  const r = Reports.findById(req.params.id);
  if (!r || r.userId !== req.user!.userId) return fail(res, 'Report not found', 404);
  return ok(res, { report: { id: r.id, date: r.date, ...JSON.parse(decrypt(r.encryptedData, SECRET)) } });
});
router.delete('/reports/:id', async (req: Request, res: Response) => {
  if (await usePg()) {
    try { const { rows } = await pgQuery(`DELETE FROM medical_reports WHERE id=$1 AND user_id=$2 RETURNING id`, [req.params.id, req.user!.userId]); if (!rows[0]) return fail(res, 'Report not found', 404); return ok(res, { message: 'Report deleted' }); } catch (e: any) { console.error('[medical-pg] DELETE', e.message); return fail(res, 'Database error', 500); }
  }
  const r = Reports.findById(req.params.id);
  if (!r || r.userId !== req.user!.userId) return fail(res, 'Report not found', 404);
  Reports.remove(r.id); return ok(res, { message: 'Report deleted' });
});
export default router;
