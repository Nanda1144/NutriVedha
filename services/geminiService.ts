import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Patient, Food, Language, Prescription, PredictiveAlert, DietPlanResponse, UserPreferences } from "../types";

// Note: GoogleGenAI is instantiated inside functions to ensure the most up-to-date API key is used, following high-priority coding guidelines.

const DIET_PLAN_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    weeklyPlan: {
      type: Type.OBJECT,
      properties: {
        Monday: { type: Type.ARRAY, items: { type: Type.STRING } },
        Tuesday: { type: Type.ARRAY, items: { type: Type.STRING } },
        Wednesday: { type: Type.ARRAY, items: { type: Type.STRING } },
        Thursday: { type: Type.ARRAY, items: { type: Type.STRING } },
        Friday: { type: Type.ARRAY, items: { type: Type.STRING } },
        Saturday: { type: Type.ARRAY, items: { type: Type.STRING } },
        Sunday: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    },
    summary: { type: Type.STRING },
    ayurvedaScore: { type: Type.NUMBER },
    quantumBalanceFactor: { type: Type.NUMBER },
    isBudgetFriendly: { type: Type.BOOLEAN },
    recipes: {
      type: Type.OBJECT,
      description: "A map of food items mentioned in the weeklyPlan to their detailed preparation steps and ingredients.",
      additionalProperties: {
        type: Type.OBJECT,
        properties: {
          ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
          steps: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["ingredients", "steps"]
      }
    }
  },
  required: ["weeklyPlan", "summary", "ayurvedaScore", "isBudgetFriendly", "recipes"]
};

// Create a new GoogleGenAI instance right before making an API call to ensure it always uses the most up-to-date API key.
export const generateAiDietPlan = async (
  patient: Patient, 
  availableFoods: Food[], 
  focusSymptoms?: string,
  language: Language = 'en',
  preferences?: UserPreferences
): Promise<DietPlanResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const foodList = availableFoods.map(f => `${f.name} (Cost: ${f.localMarketCost})`).join(', ');
  
  const lifestyle = patient.onboarding ? `
    Lifestyle Context:
    - Goals: ${patient.onboarding.healthGoal}
    - Budget: ${patient.onboarding.monthlyBudget ? '₹' + patient.onboarding.monthlyBudget + ' per month' : 'Budget-friendly/Economical'}
    - Work: ${patient.onboarding.workingHours}
    - Current: ${patient.onboarding.currentDiet}
  ` : '';

  const preferenceText = preferences ? `
    User Preferences:
    - Preferred Cuisines: ${preferences.preferredCuisines.join(', ')}
    - Excluded Ingredients: ${preferences.excludedIngredients.join(', ')}
  ` : '';
  
  const prompt = `
    Acts as a Senior Ayurvedic Physician and Nutritionist. 
    Create a PRECISION, BUDGET-FRIENDLY 7-day diet plan in ${language}.
    Patient: ${patient.dosha.join('/')} dosha, Age: ${patient.age}, Symptoms: ${focusSymptoms || 'None'}.
    ${lifestyle}
    ${preferenceText}
    Available Foods with market rates: ${foodList}
    
    CRITICAL: 
    1. Prioritize locally available, low-cost ingredients that balance the patient's doshas.
    2. Strictly follow cuisines and exclusions if provided.
    3. For every food item suggested in the weekly plan, provide a simplified recipe (ingredients and steps).
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: DIET_PLAN_SCHEMA
    }
  });

  return JSON.parse(response.text?.trim() || "{}");
};

// Create a new GoogleGenAI instance right before making an API call.
export const validateDietPlan = async (
  patient: Patient,
  modifiedPlan: Record<string, string[]>,
  language: Language = 'en'
): Promise<DietPlanResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Acts as a Senior Ayurvedic Physician.
    A patient (Dosha: ${patient.dosha.join('/')}, Age: ${patient.age}) has manually modified their diet plan.
    Review this modified weekly plan for nutritional balance and Ayurvedic compatibility.
    Update the Ayurvedic score, summary, and provide recipes for any NEW items added that weren't there before.

    Modified Plan:
    ${JSON.stringify(modifiedPlan, null, 2)}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: DIET_PLAN_SCHEMA
    }
  });

  return JSON.parse(response.text?.trim() || "{}");
};

// Create a new GoogleGenAI instance right before making an API call and properly initialize chat history.
export const getVaidyaChatResponse = async (history: any[], message: string, patient: Patient) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const geminiHistory = history.map(m => ({
    role: m.role === 'bot' ? 'model' : 'user',
    parts: [{ text: m.text }]
  }));

  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    history: geminiHistory,
    config: {
      systemInstruction: `You are 'Vaidya AI'. You provide budget-friendly Ayurvedic advice. Help ${patient.name} manage their ${patient.dosha.join('/')} balance.`
    }
  });
  const response = await chat.sendMessage({ message: message });
  return response.text;
};

// Create a new GoogleGenAI instance right before making an API call.
export const generateSpeech = async (text: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Say: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};

// Create a new GoogleGenAI instance right before making an API call.
export const generatePrescription = async (patient: Patient, symptoms: string[]): Promise<Prescription> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Clinical prescription for ${patient.ageCategory} (${patient.age}y). Symptoms: ${symptoms.join(', ')}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          diagnosis: { type: Type.STRING },
          herbs: { type: Type.ARRAY, items: { type: Type.STRING } },
          dietAdjustments: { type: Type.ARRAY, items: { type: Type.STRING } },
          lifestyleAdvice: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["diagnosis", "herbs", "dietAdjustments", "lifestyleAdvice"]
      }
    }
  });
  return JSON.parse(response.text?.trim() || "{}");
};

// Create a new GoogleGenAI instance right before making an API call.
export const generateHealthTrendsReport = async (patient: Patient) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const logData = patient.logs.map(l => `${l.date}: ${l.symptoms.join(',')}`).join('\n');
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Ayurvedic Health Report for ${patient.name}. Data: ${logData}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          period: { type: Type.STRING },
          summary: { type: Type.STRING },
          progressScore: { type: Type.NUMBER },
          ayurvedicAlignment: { type: Type.STRING },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["summary", "progressScore", "ayurvedicAlignment", "recommendations"]
      }
    }
  });
  return JSON.parse(response.text?.trim() || "{}");
};

// Create a new GoogleGenAI instance right before making an API call.
export const generateDailySutra = async (patient: Patient): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a short, inspiring Ayurvedic motivational quote (Sutra) for ${patient.name} based on their ${patient.dosha.join('/')} dosha.`,
  });
  return response.text?.trim() || "Let balance be your guide today.";
};

// Create a new GoogleGenAI instance right before making an API call.
export const generatePredictiveAlert = async (patient: Patient): Promise<PredictiveAlert> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const logData = patient.logs.slice(-7).map(l => 
    `Date: ${l.date}, Symptoms: ${l.symptoms.join(',')}, Compliance: ${l.dietCompliance}%`
  ).join('\n');

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze these logs and predict future dosha imbalance trends for a ${patient.dosha.join('/')}: \n${logData}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
          imbalanceForecast: { type: Type.STRING }
        },
        required: ["title", "description", "severity", "imbalanceForecast"]
      }
    }
  });

  return JSON.parse(response.text?.trim() || "{}");
};
