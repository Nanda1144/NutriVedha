import { Router } from 'express';
import type { Request, Response } from 'express';
import { db, ok, created, fail, requireAuth, requireRole, getConfig, pgQuery, isPgAvailable, getPool } from '@nutrivedha/shared';

const config = getConfig('farmer', 3012);
interface Livestock { id: string; userId: string; name: string; type: string; breed: string; age: string; health: 'Healthy' | 'Needs Attention'; }
interface Earning { id: string; userId: string; month: string; amount: number; source: string; }
interface InventoryItem { id: string; userId: string; name: string; stock: number; unit: string; price: number; }
const LivestockDb = db.collection<Livestock>('livestock');
const Earnings = db.collection<Earning>('farmer_earnings');
const Inventory = db.collection<InventoryItem>('farmer_inventory');
async function usePg(): Promise<boolean> { if (!getPool()) return false; return isPgAvailable(); }
const router = Router();
router.use(requireAuth(config.jwtSecret));
router.use(requireRole('Farmer', 'Admin'));

router.get('/livestock', async (req: Request, res: Response) => {
  if (await usePg()) {
    try { const { rows } = await pgQuery(`SELECT id, user_id as "userId", name, type, breed, age, health FROM livestock WHERE user_id=$1 ORDER BY created_at DESC`, [req.user!.userId]); return ok(res, { livestock: rows }); } catch (e: any) { console.error('[farmer-pg] livestock GET', e.message); return fail(res, 'Database error', 500); }
  }
  return ok(res, { livestock: LivestockDb.find({ userId: req.user!.userId } as Partial<Livestock>) });
});
router.post('/livestock', async (req: Request, res: Response) => {
  const { name, type, breed, age } = req.body ?? {};
  if (!name || !type) return fail(res, 'name and type required');
  if (await usePg()) {
    try { const { rows } = await pgQuery(`INSERT INTO livestock (user_id, name, type, breed, age, health) VALUES ($1,$2,$3,$4,$5,'Healthy') RETURNING id, user_id as "userId", name, type, breed, age, health`, [req.user!.userId, name, type, breed ?? '', age ?? '']); return created(res, { animal: rows[0] }); } catch (e: any) { console.error('[farmer-pg] livestock POST', e.message); return fail(res, 'Database error', 500); }
  }
  const animal: Livestock = { id: LivestockDb.newId(), userId: req.user!.userId, name, type, breed: breed ?? '', age: age ?? '', health: 'Healthy' };
  LivestockDb.insert(animal); return created(res, { animal });
});
router.put('/livestock/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  if (await usePg()) {
    try { const { rows } = await pgQuery(`UPDATE livestock SET name=COALESCE($1,name), type=COALESCE($2,type), breed=COALESCE($3,breed), age=COALESCE($4,age), health=COALESCE($5,health) WHERE id=$6 AND user_id=$7 RETURNING id, user_id as "userId", name, type, breed, age, health`, [req.body.name, req.body.type, req.body.breed, req.body.age, req.body.health, id, req.user!.userId]); if (!rows[0]) return fail(res, 'Animal not found', 404); return ok(res, { animal: rows[0] }); } catch (e: any) { console.error('[farmer-pg] livestock PUT', e.message); return fail(res, 'Database error', 500); }
  }
  const animal = LivestockDb.findById(id);
  if (!animal || animal.userId !== req.user!.userId) return fail(res, 'Animal not found', 404);
  LivestockDb.update(animal.id, req.body ?? {}); return ok(res, { animal: LivestockDb.findById(animal.id) });
});
router.get('/earnings', async (req: Request, res: Response) => {
  if (await usePg()) {
    try { const { rows } = await pgQuery(`SELECT id, user_id as "userId", month, amount, source FROM farmer_earnings WHERE user_id=$1 ORDER BY created_at DESC`, [req.user!.userId]); const total = rows.reduce((s: number, e: any) => s + parseFloat(e.amount), 0); return ok(res, { earnings: rows, total }); } catch (e: any) { console.error('[farmer-pg] earnings GET', e.message); return fail(res, 'Database error', 500); }
  }
  const earnings = Earnings.find({ userId: req.user!.userId } as Partial<Earning>);
  const total = earnings.reduce((s, e) => s + (e.amount || 0), 0); return ok(res, { earnings, total });
});
router.post('/earnings', async (req: Request, res: Response) => {
  const { month, amount, source } = req.body ?? {};
  if (!month || !amount) return fail(res, 'month and amount required');
  if (await usePg()) {
    try { const { rows } = await pgQuery(`INSERT INTO farmer_earnings (user_id, month, amount, source) VALUES ($1,$2,$3,$4) RETURNING id, user_id as "userId", month, amount, source`, [req.user!.userId, month, parseFloat(amount), source ?? 'Marketplace']); return created(res, { earning: rows[0] }); } catch (e: any) { console.error('[farmer-pg] earnings POST', e.message); return fail(res, 'Database error', 500); }
  }
  const earning: Earning = { id: Earnings.newId(), userId: req.user!.userId, month, amount: parseFloat(amount), source: source ?? 'Marketplace' }; Earnings.insert(earning); return created(res, { earning });
});
router.get('/inventory', async (req: Request, res: Response) => {
  if (await usePg()) {
    try { const { rows } = await pgQuery(`SELECT id, user_id as "userId", name, stock, unit, price FROM farmer_inventory WHERE user_id=$1 ORDER BY created_at DESC`, [req.user!.userId]); return ok(res, { inventory: rows }); } catch (e: any) { console.error('[farmer-pg] inventory GET', e.message); return fail(res, 'Database error', 500); }
  }
  return ok(res, { inventory: Inventory.find({ userId: req.user!.userId } as Partial<InventoryItem>) });
});
router.post('/inventory', async (req: Request, res: Response) => {
  const { name, stock, unit, price } = req.body ?? {};
  if (!name || price === undefined) return fail(res, 'name and price required');
  if (await usePg()) {
    try { const { rows } = await pgQuery(`INSERT INTO farmer_inventory (user_id, name, stock, unit, price) VALUES ($1,$2,$3,$4,$5) RETURNING id, user_id as "userId", name, stock, unit, price`, [req.user!.userId, name, parseInt(stock,10)||0, unit ?? 'kg', parseFloat(price)]); return created(res, { item: rows[0] }); } catch (e: any) { console.error('[farmer-pg] inventory POST', e.message); return fail(res, 'Database error', 500); }
  }
  const item: InventoryItem = { id: Inventory.newId(), userId: req.user!.userId, name, stock: parseInt(stock,10)||0, unit: unit ?? 'kg', price: parseFloat(price) }; Inventory.insert(item); return created(res, { item });
});
router.patch('/inventory/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  if (await usePg()) {
    try { const { rows } = await pgQuery(`UPDATE farmer_inventory SET name=COALESCE($1,name), stock=COALESCE($2,stock), unit=COALESCE($3,unit), price=COALESCE($4,price) WHERE id=$5 AND user_id=$6 RETURNING id, user_id as "userId", name, stock, unit, price`, [req.body.name, req.body.stock !== undefined ? parseInt(req.body.stock,10) : null, req.body.unit, req.body.price !== undefined ? parseFloat(req.body.price) : null, id, req.user!.userId]); if (!rows[0]) return fail(res, 'Item not found', 404); return ok(res, { item: rows[0] }); } catch (e: any) { console.error('[farmer-pg] inventory PATCH', e.message); return fail(res, 'Database error', 500); }
  }
  const item = Inventory.findById(id);
  if (!item || item.userId !== req.user!.userId) return fail(res, 'Item not found', 404);
  Inventory.update(item.id, req.body ?? {}); return ok(res, { item: Inventory.findById(item.id) });
});

export default router;
