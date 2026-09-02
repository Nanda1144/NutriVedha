import { Router } from 'express';
import type { Request, Response } from 'express';
import { db, ok, created, fail, requireAuth, requireRole, getConfig } from '@nutrivedha/shared';

const config = getConfig('delivery', 3008);

interface DeliveryOrder {
  id: string;
  orderId: string;
  customer: string;
  address: string;
  items: string;
  status: 'Pending' | 'In Transit' | 'Out for Delivery' | 'Delivered';
  assignedTo?: string;
  createdAt: string;
}

interface TrackingPoint {
  id: string;
  orderId: string;
  lat: number;
  lng: number;
  note: string;
  timestamp: string;
}

const Orders = db.collection<DeliveryOrder>('delivery_orders');
const Tracking = db.collection<TrackingPoint>('tracking_points');

if (Orders.find().length === 0) {
  [
    { orderId: 'ORD-101', customer: 'Pavan Kumar', address: '123 Neural Lane, BLR', status: 'Pending', items: 'Ashwagandha Roots, Organic Honey' },
    { orderId: 'ORD-102', customer: 'Anjali Sharma', address: '456 Wellness Rd, BLR', status: 'In Transit', items: 'Tulsi Tea, Neem Tablets' },
  ].forEach((o) => Orders.insert({ ...o, id: Orders.newId(), createdAt: new Date().toISOString() } as DeliveryOrder));
}

const router = Router();
router.use(requireAuth(config.jwtSecret));
router.use(requireRole('Delivery', 'Admin', 'User'));

router.get('/orders', (_req: Request, res: Response) => ok(res, { orders: Orders.find() }));

router.post('/orders', (req: Request, res: Response) => {
  const { orderId, customer, address, items, status } = req.body ?? {};
  if (!orderId || !customer) return fail(res, 'orderId and customer required');
  const order: DeliveryOrder = {
    id: Orders.newId(),
    orderId,
    customer,
    address,
    items,
    status: status ?? 'Pending',
    assignedTo: req.user?.role === 'Delivery' ? req.user.userId : undefined,
    createdAt: new Date().toISOString(),
  };
  Orders.insert(order);
  return created(res, { order });
});

router.put('/orders/:id/status', (req: Request, res: Response) => {
  const order = Orders.findById(req.params.id);
  if (!order) return fail(res, 'Order not found', 404);
  const status = (req.body.status as DeliveryOrder['status']) ?? order.status;
  Orders.update(order.id, { status });
  ok(res, { order: Orders.findById(order.id) });
});

router.post('/track', (req: Request, res: Response) => {
  const { orderId, lat, lng, note } = req.body ?? {};
  const order = Orders.findOne({ orderId } as Partial<DeliveryOrder>);
  if (!order) return fail(res, 'Order not found', 404);
  const point: TrackingPoint = {
    id: Tracking.newId(),
    orderId,
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    note: note ?? '',
    timestamp: new Date().toISOString(),
  };
  Tracking.insert(point);
  return created(res, { point });
});

router.get('/track/:orderId', (req: Request, res: Response) => {
  const points = Tracking.find({ orderId: req.params.orderId } as Partial<TrackingPoint>);
  ok(res, { points });
});

export default router;