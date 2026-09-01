import { getConfig } from '@nutrivedha/shared';

const config = getConfig('ai', 3003);

const API_KEY = process.env.VITE_GEMINI_API_KEY;
const MODEL = process.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash';
const TEMPERATURE = parseFloat(process.env.VITE_GEMINI_TEMPERATURE || '0.7');

// Lazy import the SDK only when a key exists (avoids crash for mock mode).
let genai: any = null;
async function getClient() {
  if (!genai && API_KEY) {
    const { GoogleGenAI } = await import('@google/genai');
    genai = new GoogleGenAI({ apiKey: API_KEY });
  }
  return genai;
}

export interface GeminiResult {
  text: string;
  usedLive: boolean;
}

/** Calls Gemini; returns { text, usedLive:false } with a fallback string on any failure. */
export async function generate(prompt: string, fallback: string): Promise<GeminiResult> {
  if (!API_KEY) return { text: fallback, usedLive: false };
  try {
    const client = await getClient();
    const response = await client.models.generateContent({
      model: MODEL,
      contents: prompt,
      generationConfig: { temperature: TEMPERATURE },
    });
    const text = response?.text ?? response?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') ?? '';
    if (text.trim()) return { text, usedLive: true };
    return { text: fallback, usedLive: false };
  } catch (err) {
    console.warn('[ai] Gemini call failed, using fallback:', err);
    return { text: fallback, usedLive: false };
  }
}