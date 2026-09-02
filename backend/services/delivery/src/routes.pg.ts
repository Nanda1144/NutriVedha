import { Router } from 'express';
import type { Request, Response } from 'express';
import { db, ok, created, fail, requireAuth, requireRole, getConfig, pgQuery, isPgAvailable, getPool } from '@nutrivedha/shared';

const config = getConfig('delivery', 3008);
interface DeliveryOrder { id: string; orderId: string; customer: string; address: string; items: string; status: 'Pending' | 'In Transit' | 'Out for Delivery' | 'Delivered'; assignedTo?: string; createdAt: string; }
interface TrackingPoint { id: string; orderId: string; lat: number; lng: number; note: string; timestamp: string; }
const Orders = db.collection<DeliveryOrder>('delivery_orders');
const Tracking = db.collection<TrackingPoint>('tracking_points');
if (Orders.find().length === 0) {
  [
    { orderId: 'ORD-101', customer: 'Pavan Kumar', address: '123 Neural Lane, BLR', status: 'Pending', items: 'Ashwagandha Roots, Organic Honey' },
    { orderId: 'ORD-102', customer: 'Anjali Sharma', address: '456 Wellness Rd, BLR', status: 'In Transit', items: 'Tulsi Tea, Neem Tablets' },
  ].forEach((o) => Orders.insert({ ...o, id: Orders.newId(), createdAt: new Date().toISOString() } as DeliveryOrder));
}
async function usePg(): Promise<boolean> { if (!getPool()) return false; return isPgAvailable(); }
const router = Router();
router.use(requireAuth(config.jwtSecret));
router.use(requireRole('Delivery', 'Admin', 'User'));
router.get('/orders', async (req: Request, res: Response) => {
  const search = (req.query.search as string) || '';
  const filterStatus = (req.query.status as string) || '';
  if (await usePg()) {
    try {
      // Microservice isolation: Delivery sees assigned_to = self OR unassigned, Admin sees all, User sees all
      const isDelivery = req.user!.role === 'Delivery';
      let q = `SELECT id, order_id as "orderId", customer, address, items, status, assigned_to as "assignedTo", created_at as "createdAt" FROM delivery_orders WHERE 1=1`;
      const params: any[] = [];
      if (isDelivery) { q += ` AND (assigned_to IS NULL OR assigned_to = $${params.length + 1})`; params.push(req.user!.userId); }
      if (search) { q += ` AND (order_id ILIKE $${params.length + 1} OR customer ILIKE $${params.length + 1} OR items ILIKE $${params.length + 1})`; params.push(`%${search}%`); }
      if (filterStatus && filterStatus !== 'All') { q += ` AND status = $${params.length + 1}`; params.push(filterStatus); }
      // Server-side search via ILIKE on idx_delivery_orders (order_id, customer)
      q += ` ORDER BY created_at DESC`;
      const { rows } = await pgQuery(q, params);
      return ok(res, { orders: rows });
    } catch (e: any) { console.error('[delivery-pg] orders GET', e.message); return fail(res, 'Database error', 500); }
  }
  let list = Orders.find();
  if (search) list = list.filter(o => o.orderId.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase()));
  if (filterStatus && filterStatus !== 'All') list = list.filter(o => o.status === filterStatus);
  return ok(res, { orders: list });
});
router.post('/orders', async (req: Request, res: Response) => {
  const { orderId, customer, address, items, status } = req.body ?? {};
  if (!orderId || !customer) return fail(res, 'orderId and customer required');
  if (await usePg()) {
    try { const { rows } = await pgQuery(`INSERT INTO delivery_orders (order_id, customer, address, items, status, assigned_to) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, order_id as "orderId", customer, address, items, status, assigned_to as "assignedTo", created_at as "createdAt"`, [orderId, customer, address, items, status ?? 'Pending', req.user?.role === 'Delivery' ? req.user.userId : null]); return created(res, { order: rows[0] }); } catch (e: any) { if (e.code === '23505') return fail(res, 'Order ID already exists', 409); console.error('[delivery-pg] orders POST', e.message); return fail(res, 'Database error', 500); }
  }
  const order: DeliveryOrder = { id: Orders.newId(), orderId, customer, address, items, status: status ?? 'Pending', assignedTo: req.user?.role === 'Delivery' ? req.user.userId : undefined, createdAt: new Date().toISOString() };
  Orders.insert(order); return created(res, { order });
});
router.put('/orders/:id/status', async (req: Request, res: Response) => {
  const status = (req.body.status as DeliveryOrder['status']) ?? 'Pending';
  if (await usePg()) {
    try { const { rows } = await pgQuery(`UPDATE delivery_orders SET status=$1 WHERE id=$2 RETURNING id, order_id as "orderId", status`, [status, req.params.id]); if (!rows[0]) return fail(res, 'Order not found', 404); return ok(res, { order: rows[0] }); } catch (e: any) { console.error('[delivery-pg] status', e.message); return fail(res, 'Database error', 500); }
  }
  const order = Orders.findById(req.params.id);
  if (!order) return fail(res, 'Order not found', 404);
  Orders.update(order.id, { status }); return ok(res, { order: Orders.findById(order.id) });
});
router.post('/track', async (req: Request, res: Response) => {
  const { orderId, lat, lng, note } = req.body ?? {};
  if (await usePg()) {
    try { const chk = await pgQuery(`SELECT order_id FROM delivery_orders WHERE order_id=$1`, [orderId]); if (!chk.rows[0]) return fail(res, 'Order not found', 404); const { rows } = await pgQuery(`INSERT INTO tracking_points (order_id, lat, lng, note) VALUES ($1,$2,$3,$4) RETURNING id, order_id as "orderId", lat, lng, note, timestamp`, [orderId, parseFloat(lat), parseFloat(lng), note ?? '']); return created(res, { point: rows[0] }); } catch (e: any) { console.error('[delivery-pg] track POST', e.message); return fail(res, 'Database error', 500); }
  }
  const order = Orders.findOne({ orderId } as Partial<DeliveryOrder>);
  if (!order) return fail(res, 'Order not found', 404);
  const point: TrackingPoint = { id: Tracking.newId(), orderId, lat: parseFloat(lat), lng: parseFloat(lng), note: note ?? '', timestamp: new Date().toISOString() };
  Tracking.insert(point); return created(res, { point });
});
router.get('/track/:orderId', async (req: Request, res: Response) => {
  if (await usePg()) {
    try { const { rows } = await pgQuery(`SELECT id, order_id as "orderId", lat, lng, note, timestamp FROM tracking_points WHERE order_id=$1 ORDER BY timestamp`, [req.params.orderId]); return ok(res, { points: rows }); } catch (e: any) { console.error('[delivery-pg] track GET', e.message); return fail(res, 'Database error', 500); }
  }
  const points = Tracking.find({ orderId: req.params.orderId } as Partial<TrackingPoint>); return ok(res, { points });
});
export default router;
