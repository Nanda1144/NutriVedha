import { Router } from 'express';
import type { Request, Response } from 'express';
import { db, ok, created, fail, requireAuth, requireRole, getConfig } from '@nutrivedha/shared';

const config = getConfig('farmer', 3012);

interface Livestock {
  id: string;
  userId: string;
  name: string;
  type: string;
  breed: string;
  age: string;
  health: 'Healthy' | 'Needs Attention';
}

interface Earning {
  id: string;
  userId: string;
  month: string;
  amount: number;
  source: string;
}

interface InventoryItem {
  id: string;
  userId: string;
  name: string;
  stock: number;
  unit: string;
  price: number;
}

const LivestockDb = db.collection<Livestock>('livestock');
const Earnings = db.collection<Earning>('farmer_earnings');
const Inventory = db.collection<InventoryItem>('farmer_inventory');

const router = Router();
router.use(requireAuth(config.jwtSecret));
router.use(requireRole('Farmer', 'Admin'));

// Animals
router.get('/livestock', (req: Request, res: Response) => {
  ok(res, { livestock: LivestockDb.find({ userId: req.user!.userId } as Partial<Livestock>) });
});

router.post('/livestock', (req: Request, res: Response) => {
  const { name, type, breed, age } = req.body ?? {};
  if (!name || !type) return fail(res, 'name and type required');
  const animal: Livestock = {
    id: LivestockDb.newId(),
    userId: req.user!.userId,
    name,
    type,
    breed: breed ?? '',
    age: age ?? '',
    health: 'Healthy',
  };
  LivestockDb.insert(animal);
  return created(res, { animal });
});

router.put('/livestock/:id', (req: Request, res: Response) => {
  const animal = LivestockDb.findById(req.params.id);
  if (!animal || animal.userId !== req.user!.userId) return fail(res, 'Animal not found', 404);
  LivestockDb.update(animal.id, req.body ?? {});
  ok(res, { animal: LivestockDb.findById(animal.id) });
});

// Earnings
router.get('/earnings', (req: Request, res: Response) => {
  const earnings = Earnings.find({ userId: req.user!.userId } as Partial<Earning>);
  const total = earnings.reduce((s, e) => s + (e.amount || 0), 0);
  ok(res, { earnings, total });
});

router.post('/earnings', (req: Request, res: Response) => {
  const { month, amount, source } = req.body ?? {};
  if (!month || !amount) return fail(res, 'month and amount required');
  const earning: Earning = { id: Earnings.newId(), userId: req.user!.userId, month, amount: parseFloat(amount), source: source ?? 'Marketplace' };
  Earnings.insert(earning);
  return created(res, { earning });
});

// Inventory
router.get('/inventory', (req: Request, res: Response) => {
  ok(res, { inventory: Inventory.find({ userId: req.user!.userId } as Partial<InventoryItem>) });
});

router.post('/inventory', (req: Request, res: Response) => {
  const { name, stock, unit, price } = req.body ?? {};
  if (!name || price === undefined) return fail(res, 'name and price required');
  const item: InventoryItem = {
    id: Inventory.newId(),
    userId: req.user!.userId,
    name,
    stock: parseInt(stock, 10) || 0,
    unit: unit ?? 'kg',
    price: parseFloat(price),
  };
  Inventory.insert(item);
  return created(res, { item });
});

router.patch('/inventory/:id', (req: Request, res: Response) => {
  const item = Inventory.findById(req.params.id);
  if (!item || item.userId !== req.user!.userId) return fail(res, 'Item not found', 404);
  Inventory.update(item.id, req.body ?? {});
  ok(res, { item: Inventory.findById(item.id) });
});

export default router;