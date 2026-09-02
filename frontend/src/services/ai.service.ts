/**
 * AI / ML SERVICE API — port 3003 · gateway path /ai
 * Gemini-powered disease scan, diet plans, recipes and chatbot.
 * Falls back to deterministic mocks when VITE_GEMINI_API_KEY is unset.
 */
import type { DietPlan, HealthReport, Recipe, ScanResult } from '../types';
import { apiPost } from './client';

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export function scanFood(payload: { image?: string; description: string }): Promise<{ result: ScanResult }> {
  return apiPost('/ai/scan', payload);
}

export function generateDiet(payload: { diseases?: string[]; goal?: string; calories?: number }): Promise<{ plan: DietPlan }> {
  return apiPost('/ai/diet', payload);
}

export function generateRecipes(payload: { ingredients: string[]; diets?: string[] }): Promise<{ recipes: Recipe[] }> {
  return apiPost('/ai/recipes', payload);
}

export function chat(payload: { messages: ChatTurn[] }): Promise<{ reply: string }> {
  return apiPost('/ai/chat', payload);
}

export function generateHealthReport(payload: { symptoms: string[]; condition?: string }): Promise<{ report: HealthReport }> {
  return apiPost('/ai/report', payload);
}