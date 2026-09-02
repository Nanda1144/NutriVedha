import { Router } from 'express';
import type { Request, Response } from 'express';
import { getConfig, ok, fail, pgQuery, isPgAvailable, getPool } from '@nutrivedha/shared';
import { generate } from './gemini.js';

const config = getConfig('ai', 3003);
export interface ScanResult { condition: string; symptoms: string[]; severity: 'Low' | 'Medium' | 'High'; recommendations: { title: string; text: string }[]; }
const SCAN_BANK: ScanResult[] = [
  { condition: 'Pitta Imbalance (Skin Irritation)', symptoms: ['Redness', 'Mild Inflammation', 'Heat Sensitivity'], severity: 'Low', recommendations: [{ title: 'Cooling Herbs', text: 'Apply Aloe Vera gel or drink Neem water.' }, { title: 'Dietary Adjustment', text: 'Avoid spicy and oily foods for 3 days.' }] },
  { condition: 'Vata Dryness (Dehydration)', symptoms: ['Dry skin', 'Flaky patches', 'Chapped lips'], severity: 'Medium', recommendations: [{ title: 'Hydration Plus', text: 'Drink warm water with a pinch of rock salt.' }, { title: 'Oil Massage', text: 'Apply Sesame oil or Coconut oil before bath.' }] },
  { condition: 'Kapha Slow Metabolism', symptoms: ['Oily skin', 'Puffy face', 'Lethargy'], severity: 'Low', recommendations: [{ title: 'Stimulating Herbs', text: 'Drink Trikatu tea (Ginger, Pepper, Pippali).' }, { title: 'Activity', text: 'Include 20 mins of brisk walking in the morning.' }] },
];
async function logAi(type: string, prompt: string, response: unknown, usedLive: boolean, userId?: string) {
  if (!getPool()) return;
  try { if (await isPgAvailable()) await pgQuery(`INSERT INTO ai_requests (user_id, type, prompt, response, used_live) VALUES ($1,$2,$3,$4,$5)`, [userId || null, type, prompt, JSON.stringify(response), usedLive]); } catch {}
}
const router = Router();
router.post('/scan', async (req: Request, res: Response) => {
  const { image, description } = req.body ?? {};
  if (!image && !description) return fail(res, 'Provide image data or a symptom description');
  const prompt = `You are an Ayurvedic diagnostic AI. Analyze this patient description/image: "${description || 'skin symptoms'}" and respond as JSON: {condition, symptoms: string[], severity: Low|Medium|High, recommendations: [{title, text}]}. Keep it concise and clinical.`;
  const fallback = SCAN_BANK[Math.floor(Math.random() * SCAN_BANK.length)];
  const fallbackText = JSON.stringify(fallback);
  const { text, usedLive } = await generate(prompt, fallbackText);
  let result: ScanResult; try { result = JSON.parse(text); } catch { result = fallback; }
  await logAi('scan', prompt, result, usedLive, (req as any).user?.userId);
  return ok(res, { result, meta: { usedLive } });
});
interface Meal { time: string; meal: string; ingredients: string[]; budget: boolean; health: string; isDoctorRecommended?: boolean; }
const DIET_BANK: Record<string, Meal[]> = {
  pitta: [{ time: 'Breakfast', meal: 'Cucumber & Mint Cooler with Oats', ingredients: ['Oats', 'Mint', 'Cucumber', 'Coconut Milk'], budget: true, health: 'Pitta Cooling' }, { time: 'Lunch', meal: 'Sweet Potato & Mung Beans', ingredients: ['Mung Dal', 'Sweet Potato', 'Ghee', 'Coriander'], budget: true, health: 'Anti-inflammatory' }, { time: 'Dinner', meal: 'Bottle Gourd Stew', ingredients: ['Lauki', 'Cumin', 'Ginger', 'Coconut'], budget: true, health: 'Digestive Support' }],
  vata: [{ time: 'Breakfast', meal: 'Warm Ragi Porridge', ingredients: ['Ragi', 'Jaggery', 'Almonds', 'Sesame Oil'], budget: true, health: 'Vata Grounding' }, { time: 'Lunch', meal: 'Steamed Rice & Lentil Soup', ingredients: ['Basmati Rice', 'Toor Dal', 'Turmeric', 'Garlic'], budget: true, health: 'Hydrating' }, { time: 'Dinner', meal: 'Carrot & Ginger Creamy Soup', ingredients: ['Carrots', 'Ginger', 'Coconut Milk'], budget: true, health: 'Warming' }],
  kapha: [{ time: 'Breakfast', meal: 'Spiced Quinoa with Apple', ingredients: ['Quinoa', 'Apple', 'Cardamom', 'Honey'], budget: true, health: 'Kapha Stimulating' }, { time: 'Lunch', meal: 'Mixed Vegetable Kichdi', ingredients: ['Brown Rice', 'Moong Dal', 'Turmeric', 'Black Pepper'], budget: true, health: 'Metabolic Boost' }, { time: 'Dinner', meal: 'Clear Vegetable Broth', ingredients: ['Spinach', 'Bottle Gourd', 'Fenugreek'], budget: true, health: 'Light & Easy' }],
};
router.post('/diet', async (req: Request, res: Response) => {
  const { condition, budget, preferences, exclusions } = req.body ?? {};
  const lower = String(condition ?? '').toLowerCase();
  const key = lower.includes('pitta') ? 'pitta' : lower.includes('vata') ? 'vata' : 'kapha';
  const plan = DIET_BANK[key];
  const prompt = `Create an Ayurvedic diet plan as JSON array of {time, meal, ingredients: string[], budget: boolean, health}. Condition: "${condition || 'generic'}", budget: ${budget ?? 'low'}, preferences: ${preferences ?? 'vegetarian'}, exclusions: ${exclusions ?? 'none'}. 3 meals.`;
  const fallbackText = JSON.stringify(plan);
  const { text, usedLive } = await generate(prompt, fallbackText);
  let meals: Meal[]; try { meals = JSON.parse(text); } catch { meals = plan; }
  await logAi('diet', prompt, meals, usedLive, (req as any).user?.userId);
  return ok(res, { meals, meta: { usedLive } });
});
const RECIPE_BANK = [
  { title: 'Golden Turmeric Milk', tags: ['turmeric', 'milk', 'honey', 'ginger'], time: '5 mins', difficulty: 'Easy', benefits: 'Anti-inflammatory, Boosts Immunity', steps: ['Boil milk with a pinch of turmeric.', 'Add ginger and black pepper.', 'Sweeten with honey or jaggery.'] },
  { title: 'Ayurvedic Ginger Tea', tags: ['ginger', 'water', 'lemon', 'honey'], time: '10 mins', difficulty: 'Easy', benefits: 'Aids Digestion, Relieves Colds', steps: ['Crush fresh ginger.', 'Boil in water for 5 mins.', 'Add lemon and honey.'] },
  { title: 'Amla Immunity Shot', tags: ['amla', 'honey', 'water'], time: '3 mins', difficulty: 'Easy', benefits: 'Vitamin C Boost, Glowing Skin', steps: ['Grate Amla and squeeze juice.', 'Mix with warm water and honey.', 'Consume on empty stomach.'] },
];
router.post('/recipes', async (req: Request, res: Response) => {
  const { ingredients } = req.body ?? {};
  if (!ingredients) return fail(res, 'Provide ingredients array');
  const tags = ingredients.map((i: string) => String(i).toLowerCase().trim());
  const matched = RECIPE_BANK.filter((r) => r.tags.some((t) => tags.includes(t)));
  const prompt = `You are an Ayurvedic chef. Given ingredients ${JSON.stringify(tags)}, return 2-3 recipes as JSON array of {title, tags, time, difficulty, benefits, steps: string[]}.`;
  const fallbackText = JSON.stringify(matched.length ? matched : RECIPE_BANK.slice(0, 2));
  const { text, usedLive } = await generate(prompt, fallbackText);
  let recipes: unknown[]; try { recipes = JSON.parse(text); } catch { recipes = matched.length ? matched : RECIPE_BANK.slice(0, 2); }
  await logAi('recipes', prompt, recipes, usedLive, (req as any).user?.userId);
  return ok(res, { recipes, meta: { usedLive } });
});
function chatReply(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('diet') || m.includes('food')) return 'AyurAI offers a personalized Diet module. We analyze your body type (Prakriti) and current health state to recommend specific Ayurvedic foods.';
  if (m.includes('scan') || m.includes('disease')) return 'Our AI Disease Scan uses computer vision to analyze physical symptoms and provides Ayurvedic recommendations.';
  if (m.includes('fitness') || m.includes('workout') || m.includes('gym')) return 'The Fitness module tailors workouts to your age stage and body goal (Bulk, Skinny, or Cut), including Yoga classes and progress tracking.';
  if (m.includes('who are you') || m.includes('help')) return 'I am AyurAI Intelligence, your unified health companion for AI Scans, Personalized Diets, Fitness Plans, and Telemedicine.';
  if (m.includes('admin') || m.includes('login')) return 'Standard user access is enabled. System administrators can provide their authorized passkey to unlock restricted zones.';
  return "I'm analyzing your request. Can you tell me more about your health goals?";
}
router.post('/chat', async (req: Request, res: Response) => {
  const { message } = req.body ?? {};
  if (!message) return fail(res, 'message required');
  const prompt = `You are AyurAI Intelligence, an Ayurvedic health assistant. Answer the user briefly and helpfully: "${message}"`;
  const { text, usedLive } = await generate(prompt, chatReply(message));
  await logAi('chat', prompt, text, usedLive, (req as any).user?.userId);
  return ok(res, { reply: text, meta: { usedLive } });
});
export default router;
