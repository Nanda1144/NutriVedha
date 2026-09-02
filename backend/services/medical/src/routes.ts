import { Router } from 'express';
import type { Request, Response } from 'express';
import { db, ok, created, fail, requireAuth, encrypt, decrypt, getConfig } from '@nutrivedha/shared';

const config = getConfig('medical', 3005);
const SECRET = config.medicalEncryptionKey;

export interface MedicalReport {
  id: string;
  userId: string;
  date: string;
  encryptedData: string; // AES-256-GCM of the clinical payload
  createdAt: string;
}

const Reports = db.collection<MedicalReport>('medical_reports');

const router = Router();
router.use(requireAuth(config.jwtSecret));

// POST /api/medical/reports  - create a report (encrypted at rest)
router.post('/reports', (req: Request, res: Response) => {
  const { condition, symptoms, severity, recommendations, imageData } = req.body ?? {};
  if (!condition) return fail(res, 'condition required');

  const payload = JSON.stringify({ condition, symptoms, severity, recommendations, imageData: imageData ?? null });
  const report: MedicalReport = {
    id: Reports.newId(),
    userId: req.user!.userId,
    date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    encryptedData: encrypt(payload, SECRET),
    createdAt: new Date().toISOString(),
  };
  Reports.insert(report);
  return created(res, { id: report.id, date: report.date });
});

// GET /api/medical/reports  - list user's reports (decrypted on read)
router.get('/reports', (req: Request, res: Response) => {
  const list = Reports.find({ userId: req.user!.userId } as Partial<MedicalReport>).map((r) => ({
    id: r.id,
    date: r.date,
    ...JSON.parse(decrypt(r.encryptedData, SECRET)),
  }));
  return ok(res, { reports: list });
});

// GET /api/medical/reports/:id
router.get('/reports/:id', (req: Request, res: Response) => {
  const r = Reports.findById(req.params.id);
  if (!r || r.userId !== req.user!.userId) return fail(res, 'Report not found', 404);
  return ok(res, { report: { id: r.id, date: r.date, ...JSON.parse(decrypt(r.encryptedData, SECRET)) } });
});

// DELETE /api/medical/reports/:id
router.delete('/reports/:id', (req: Request, res: Response) => {
  const r = Reports.findById(req.params.id);
  if (!r || r.userId !== req.user!.userId) return fail(res, 'Report not found', 404);
  Reports.remove(r.id);
  return ok(res, { message: 'Report deleted' });
});

export default router;