import { Router } from 'express';
import type { Request, Response } from 'express';
import { db, ok, created, fail, requireAuth, getConfig, pgQuery, isPgAvailable, getPool } from '@nutrivedha/shared';

const config = getConfig('marketplace', 3007);
const FLAT_DELIVERY = parseInt(process.env.VITE_MARKETPLACE_DELIVERY_FEE_FLAT || '40', 10);

interface Crop {
  id: string;
  name: string;
  category: string;
  harvestDate: string;
  price: number;
  marketPrice: number;
  recommended: boolean;
  farmer: { name: string; location: string; experience: string; verified: boolean; crops: string[]; impact: string };
  description: string;
  benefits: string;
  dietSupport: string;
  image: string;
}
interface CropBooking {
  id: string;
  userId: string;
  cropId: string;
  quantity: number;
  totalPrice: number;
  status: 'Growing' | 'Harvested' | 'Packed' | 'Out for Delivery' | 'Delivered';
  orderDate: string;
  paymentIntentId?: string;
}
const Crops = db.collection<Crop>('crops');
const Bookings = db.collection<CropBooking>('crop_bookings');
if (Crops.find().length === 0) {
  [
    { name: 'Organic Amla (Pratapgarh)', category: 'Ayurvedic Grade', harvestDate: 'Oct 2026', price: 85, marketPrice: 120, recommended: true, farmer: { name: 'Ram Singh', location: 'Pratapgarh, UP', experience: '25 Years', verified: true, crops: ['Amla', 'Aloe Vera', 'Neem'], impact: 'Supports 100% natural farming in his village.' }, description: 'Grown without any synthetic fertilizers. High in Vitamin C, perfect for Triphala.', benefits: 'Boosts immunity, improves skin health, supports digestion.', dietSupport: 'Immunity Booster & Detox Diet', image: 'https://images.unsplash.com/photo-1628134707412-23c8a49df5d0?auto=format&fit=crop&q=80&w=600' },
    { name: 'Chemical-Free Turmeric', category: 'Natural', harvestDate: 'Jan 2027', price: 140, marketPrice: 190, recommended: true, farmer: { name: 'Savitri Devi', location: 'Erode, Tamil Nadu', experience: '15 Years', verified: true, crops: ['Turmeric', 'Ginger'], impact: 'Helps preserve native turmeric varieties.' }, description: 'Traditional Erode turmeric with high curcumin content.', benefits: 'Anti-inflammatory, blood purifier.', dietSupport: 'Anti-Inflammatory Plan', image: 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?auto=format&fit=crop&q=80&w=600' },
    { name: 'Native Ashwagandha Roots', category: 'Ayurvedic Grade', harvestDate: 'Nov 2026', price: 420, marketPrice: 550, recommended: false, farmer: { name: 'Gopal Mandloi', location: 'Neemuch, MP', experience: '30 Years', verified: true, crops: ['Ashwagandha', 'Shatavari'], impact: 'Empowering local tribal farmers through collective farming.' }, description: 'Sun-dried using traditional methods to preserve Ojas-building properties.', benefits: 'Reduces stress, improves sleep, boosts energy.', dietSupport: 'Stress Relief & Vitality Diet', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=600' },
  ].forEach((c) => Crops.insert({ ...c, id: Crops.newId() } as Crop));
}
async function usePg(): Promise<boolean> { if (!getPool()) return false; return isPgAvailable(); }

const router = Router();
router.use(requireAuth(config.jwtSecret));

router.get('/crops', async (_req: Request, res: Response) => {
  if (await usePg()) {
    try {
      const { rows } = await pgQuery(`SELECT id, name, category, harvest_date as "harvestDate", price, market_price as "marketPrice", recommended, farmer, description, benefits, diet_support as "dietSupport", image FROM crops ORDER BY created_at`);
      return ok(res, { crops: rows });
    } catch (e: any) { console.error('[marketplace-pg] crops', e.message); return fail(res, 'Database error', 500); }
  }
  return ok(res, { crops: Crops.find() });
});
router.get('/crops/:id', async (req: Request, res: Response) => {
  if (await usePg()) {
    try {
      const { rows } = await pgQuery(`SELECT id, name, category, harvest_date as "harvestDate", price, market_price as "marketPrice", recommended, farmer, description, benefits, diet_support as "dietSupport", image FROM crops WHERE id=$1`, [req.params.id]);
      if (!rows[0]) return fail(res, 'Crop not found', 404);
      return ok(res, { crop: rows[0] });
    } catch (e: any) { console.error('[marketplace-pg] crop id', e.message); return fail(res, 'Database error', 500); }
  }
  const crop = Crops.findById(req.params.id);
  if (!crop) return fail(res, 'Crop not found', 404);
  return ok(res, { crop });
});
router.get('/crops/:id/farmers', async (req: Request, res: Response) => {
  if (await usePg()) {
    try {
      const { rows } = await pgQuery(`SELECT farmer FROM crops WHERE id=$1`, [req.params.id]);
      if (!rows[0]) return fail(res, 'Crop not found', 404);
      return ok(res, { farmer: rows[0].farmer });
    } catch (e: any) { console.error('[marketplace-pg] farmer', e.message); return fail(res, 'Database error', 500); }
  }
  const crop = Crops.findById(req.params.id);
  if (!crop) return fail(res, 'Crop not found', 404);
  return ok(res, { farmer: crop.farmer });
});
router.post('/prebook', async (req: Request, res: Response) => {
  const { cropId, quantity } = req.body ?? {};
  const qty = Math.max(1, parseInt(quantity, 10) || 1);
  if (await usePg()) {
    try {
      const { rows } = await pgQuery(`SELECT id, price, market_price as "marketPrice" FROM crops WHERE id=$1`, [cropId]);
      if (!rows[0]) return fail(res, 'Crop not found', 404);
      const crop = rows[0] as any;
      const totalPrice = crop.price * qty + FLAT_DELIVERY;
      const { rows: b } = await pgQuery(`INSERT INTO crop_bookings (user_id, crop_id, quantity, total_price, status, order_date, payment_intent_id) VALUES ($1,$2,$3,$4,'Growing',$5,$6) RETURNING id, user_id as "userId", crop_id as "cropId", quantity, total_price as "totalPrice", status, order_date as "orderDate", payment_intent_id as "paymentIntentId"`, [req.user!.userId, cropId, qty, totalPrice, new Date().toLocaleDateString(), `pi_sim_${Math.random().toString(36).slice(2, 10)}`]);
      return created(res, { booking: b[0], savings: (crop.marketPrice - crop.price) * qty });
    } catch (e: any) { console.error('[marketplace-pg] prebook', e.message); return fail(res, 'Database error', 500); }
  }
  const crop = Crops.findById(cropId as string);
  if (!crop) return fail(res, 'Crop not found', 404);
  const booking: CropBooking = { id: Bookings.newId(), userId: req.user!.userId, cropId, quantity: qty, totalPrice: crop.price * qty + FLAT_DELIVERY, status: 'Growing', orderDate: new Date().toLocaleDateString(), paymentIntentId: `pi_sim_${Bookings.newId().slice(0, 8)}` };
  Bookings.insert(booking);
  return created(res, { booking, savings: (crop.marketPrice - crop.price) * qty });
});
router.get('/bookings', async (req: Request, res: Response) => {
  if (await usePg()) {
    try {
      const { rows } = await pgQuery(`SELECT b.id, b.user_id as "userId", b.crop_id as "cropId", b.quantity, b.total_price as "totalPrice", b.status, b.order_date as "orderDate", b.payment_intent_id as "paymentIntentId", to_jsonb(c) as crop FROM crop_bookings b JOIN crops c ON c.id=b.crop_id WHERE b.user_id=$1 ORDER BY b.created_at DESC`, [req.user!.userId]);
      return ok(res, { bookings: rows });
    } catch (e: any) { console.error('[marketplace-pg] bookings', e.message); return fail(res, 'Database error', 500); }
  }
  const bookings = Bookings.find({ userId: req.user!.userId } as Partial<CropBooking>).map((b) => ({ ...b, crop: Crops.findById(b.cropId) ?? null }));
  return ok(res, { bookings });
});
router.put('/bookings/:id/status', async (req: Request, res: Response) => {
  const status = req.body.status as CropBooking['status'];
  const allowed: CropBooking['status'][] = ['Growing', 'Harvested', 'Packed', 'Out for Delivery', 'Delivered'];
  if (!allowed.includes(status)) return fail(res, 'Invalid status');
  if (await usePg()) {
    try {
      const { rows } = await pgQuery(`UPDATE crop_bookings SET status=$1 WHERE id=$2 RETURNING id, status`, [status, req.params.id]);
      if (!rows[0]) return fail(res, 'Booking not found', 404);
      return ok(res, { booking: rows[0] });
    } catch (e: any) { console.error('[marketplace-pg] status', e.message); return fail(res, 'Database error', 500); }
  }
  const booking = Bookings.findById(req.params.id);
  if (!booking) return fail(res, 'Booking not found', 404);
  Bookings.update(booking.id, { status });
  return ok(res, { booking: Bookings.findById(booking.id) });
});

export default router;
