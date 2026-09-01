import { Router } from 'express';
import type { Request, Response } from 'express';
import { db, ok, created, fail, requireAuth, getConfig } from '@nutrivedha/shared';

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

// Seed crops
if (Crops.find().length === 0) {
  [
    {
      name: 'Organic Amla (Pratapgarh)', category: 'Ayurvedic Grade', harvestDate: 'Oct 2026', price: 85, marketPrice: 120, recommended: true,
      farmer: { name: 'Ram Singh', location: 'Pratapgarh, UP', experience: '25 Years', verified: true, crops: ['Amla', 'Aloe Vera', 'Neem'], impact: 'Supports 100% natural farming in his village.' },
      description: 'Grown without any synthetic fertilizers. High in Vitamin C, perfect for Triphala.',
      benefits: 'Boosts immunity, improves skin health, supports digestion.', dietSupport: 'Immunity Booster & Detox Diet',
      image: 'https://images.unsplash.com/photo-1628134707412-23c8a49df5d0?auto=format&fit=crop&q=80&w=600',
    },
    {
      name: 'Chemical-Free Turmeric', category: 'Natural', harvestDate: 'Jan 2027', price: 140, marketPrice: 190, recommended: true,
      farmer: { name: 'Savitri Devi', location: 'Erode, Tamil Nadu', experience: '15 Years', verified: true, crops: ['Turmeric', 'Ginger'], impact: 'Helps preserve native turmeric varieties.' },
      description: 'Traditional Erode turmeric with high curcumin content.', benefits: 'Anti-inflammatory, blood purifier.', dietSupport: 'Anti-Inflammatory Plan',
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?auto=format&fit=crop&q=80&w=600',
    },
    {
      name: 'Native Ashwagandha Roots', category: 'Ayurvedic Grade', harvestDate: 'Nov 2026', price: 420, marketPrice: 550, recommended: false,
      farmer: { name: 'Gopal Mandloi', location: 'Neemuch, MP', experience: '30 Years', verified: true, crops: ['Ashwagandha', 'Shatavari'], impact: 'Empowering local tribal farmers through collective farming.' },
      description: 'Sun-dried using traditional methods to preserve Ojas-building properties.', benefits: 'Reduces stress, improves sleep, boosts energy.', dietSupport: 'Stress Relief & Vitality Diet',
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=600',
    },
  ].forEach((c) => Crops.insert({ ...c, id: Crops.newId() } as Crop));
}

const router = Router();
router.use(requireAuth(config.jwtSecret));

// GET /api/marketplace/crops
router.get('/crops', (_req: Request, res: Response) => ok(res, { crops: Crops.find() }));

// GET /api/marketplace/crops/:id
router.get('/crops/:id', (req: Request, res: Response) => {
  const crop = Crops.findById(req.params.id);
  if (!crop) return fail(res, 'Crop not found', 404);
  ok(res, { crop });
});

// GET /api/marketplace/crops/:id/farmers
router.get('/crops/:id/farmers', (req: Request, res: Response) => {
  const crop = Crops.findById(req.params.id);
  if (!crop) return fail(res, 'Crop not found', 404);
  ok(res, { farmer: crop.farmer });
});

// POST /api/marketplace/prebook - create booking + simulate payment capture
router.post('/prebook', (req: Request, res: Response) => {
  const { cropId, quantity } = req.body ?? {};
  const crop = Crops.findById(cropId as string);
  if (!crop) return fail(res, 'Crop not found', 404);
  const qty = Math.max(1, parseInt(quantity, 10) || 1);

  const booking: CropBooking = {
    id: Bookings.newId(),
    userId: req.user!.userId,
    cropId,
    quantity: qty,
    totalPrice: crop.price * qty + FLAT_DELIVERY,
    status: 'Growing',
    orderDate: new Date().toLocaleDateString(),
    paymentIntentId: `pi_sim_${Bookings.newId().slice(0, 8)}`,
  };
  Bookings.insert(booking);
  return created(res, { booking, savings: (crop.marketPrice - crop.price) * qty });
});

// GET /api/marketplace/bookings
router.get('/bookings', (req: Request, res: Response) => {
  const bookings = Bookings.find({ userId: req.user!.userId } as Partial<CropBooking>).map((b) => ({
    ...b,
    crop: Crops.findById(b.cropId) ?? null,
  }));
  ok(res, { bookings });
});

// PUT /api/marketplace/bookings/:id/status (used by delivery flow)
router.put('/bookings/:id/status', requireAuth(config.jwtSecret), (req: Request, res: Response) => {
  const booking = Bookings.findById(req.params.id);
  if (!booking) return fail(res, 'Booking not found', 404);
  const status = req.body.status as CropBooking['status'];
  const allowed: CropBooking['status'][] = ['Growing', 'Harvested', 'Packed', 'Out for Delivery', 'Delivered'];
  if (!allowed.includes(status)) return fail(res, 'Invalid status');
  Bookings.update(booking.id, { status });
  ok(res, { booking: Bookings.findById(booking.id) });
});

export default router;