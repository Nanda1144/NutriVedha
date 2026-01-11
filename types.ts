
export type Rasa = 'sweet' | 'sour' | 'salty' | 'bitter' | 'pungent' | 'astringent';
export type Virya = 'hot' | 'cold';
export type Guna = 'heavy' | 'light';
export type Dosha = 'vata' | 'pitta' | 'kapha';
export type Role = 'Doctor' | 'Patient' | 'Admin';
export type AgeGroup = 'child' | 'teenager' | 'adult' | 'senior';
export type Language = 'en' | 'hi' | 'ta' | 'te' | 'bn';

export interface UserPreferences {
  preferredCuisines: string[];
  excludedIngredients: string[];
}

export interface OnboardingData {
  healthGoal: string;
  dailyActivity: 'sedentary' | 'moderate' | 'active';
  workingHours: string;
  currentDiet: string;
  physicalActivityLevel: string;
  sleepHours: number;
  monthlyBudget?: number;
  preferences?: UserPreferences;
}

export interface HealthLog {
  id: string;
  date: string;
  mood: number;
  energy: number;
  sleepQuality: number;
  vitals: {
    weight?: number;
    bloodPressure?: string;
  };
  symptoms: string[];
  dietCompliance: number;
}

export interface Food {
  id: string;
  name: string;
  category: 'veg' | 'non-veg' | 'salad';
  cuisine: string;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  rasa: Rasa[];
  virya: Virya;
  guna: Guna;
  benefits: string;
  uses: string;
  localMarketCost: string;
  purchaseUrl: string;
  recipe?: { step: number; instruction: string }[];
}

export interface Patient {
  _id?: string; 
  id: string;
  userId: string; // Used for secure lookups
  name: string;
  age: number;
  gender: string;
  dosha: Dosha[];
  dietaryHabits: string;
  healthConditions: string[];
  allergies: string[];
  symptoms?: string[];
  logs: HealthLog[];
  ageCategory: AgeGroup;
  onboarding?: OnboardingData;
  currentDietPlan?: DietPlanResponse;
  lastSynced?: string; // Database timestamp
}

export interface RecipeInfo {
  ingredients: string[];
  steps: string[];
}

export interface DietPlanResponse {
  weeklyPlan: Record<string, string[]>;
  summary: string;
  ayurvedaScore: number;
  quantumBalanceFactor: number;
  isBudgetFriendly: boolean;
  recipes: Record<string, RecipeInfo>;
}

export interface HealthReport {
  period: string;
  summary: string;
  progressScore: number;
  ayurvedicAlignment: string;
  recommendations: string[];
}

export interface Prescription {
  diagnosis: string;
  herbs: string[];
  dietAdjustments: string[];
  lifestyleAdvice: string[];
}

export interface Doctor {
  id: string;
  name: string;
  designation: string;
  specialization: string;
  status: 'Online' | 'Offline';
  patientsHandled: number;
}

export interface PredictiveAlert {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  imbalanceForecast: string;
}
