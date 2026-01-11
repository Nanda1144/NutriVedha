
import { Food, Patient, HealthLog, Doctor } from './types';

export const MOCK_FOODS: Food[] = [
  {
    id: 'f1',
    name: 'Basmati Rice',
    category: 'veg',
    cuisine: 'Indian',
    servingSize: '1 cup cooked',
    calories: 205,
    protein: 4.3,
    carbs: 45,
    fat: 0.4,
    fiber: 0.6,
    rasa: ['sweet'],
    virya: 'cold',
    guna: 'light',
    benefits: 'Easily digestible, provides sustained energy, balances Vata and Pitta.',
    uses: 'Staple grain for daily meals, used in khichdi for recovery.',
    localMarketCost: '₹60 - ₹120 per kg',
    purchaseUrl: 'https://www.bigbasket.com/ps/?q=basmati%20rice',
    recipe: [
      { step: 1, instruction: 'Wash rice 2-3 times until water runs clear.' },
      { step: 2, instruction: 'Soak for 20 minutes for better texture.' },
      { step: 3, instruction: 'Boil with 2 parts water to 1 part rice until soft.' }
    ]
  },
  {
    id: 'f2',
    name: 'Moong Dal (Yellow)',
    category: 'veg',
    cuisine: 'Indian',
    servingSize: '1 cup cooked',
    calories: 147,
    protein: 12,
    carbs: 25,
    fat: 0.8,
    fiber: 7.5,
    rasa: ['sweet', 'astringent'],
    virya: 'cold',
    guna: 'light',
    benefits: 'Highest protein digestibility, detoxifying, balances all three doshas.',
    uses: 'Primary protein source in Ayurvedic diets, base for healing soups.',
    localMarketCost: '₹110 - ₹150 per kg',
    purchaseUrl: 'https://www.bigbasket.com/ps/?q=moong%20dal',
    recipe: [
      { step: 1, instruction: 'Rinse dal thoroughly.' },
      { step: 2, instruction: 'Pressure cook with turmeric and salt for 3 whistles.' },
      { step: 3, instruction: 'Temper with cumin and ghee for maximum nutrition.' }
    ]
  },
  {
    id: 'f5',
    name: 'Sprouts & Cucumber Salad',
    category: 'salad',
    cuisine: 'Global',
    servingSize: '1 bowl',
    calories: 110,
    protein: 8,
    carbs: 18,
    fat: 1.2,
    fiber: 6,
    rasa: ['sweet', 'astringent'],
    virya: 'cold',
    guna: 'light',
    benefits: 'Rich in enzymes, hydrating, cools Pitta and boosts digestion.',
    uses: 'Mid-day snack or side dish for lunch.',
    localMarketCost: '₹30 - ₹50 per serving',
    purchaseUrl: 'https://www.bigbasket.com/ps/?q=cucumber',
    recipe: [
      { step: 1, instruction: 'Mix sprouted moong with finely chopped cucumber.' },
      { step: 2, instruction: 'Add a pinch of rock salt and lemon juice.' },
      { step: 3, instruction: 'Garnish with fresh coriander.' }
    ]
  },
  {
    id: 'f6',
    name: 'Grilled Chicken Breast',
    category: 'non-veg',
    cuisine: 'Global',
    servingSize: '100g',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    rasa: ['sweet'],
    virya: 'hot',
    guna: 'heavy',
    benefits: 'High quality protein for muscle building, increases Ojas.',
    uses: 'Post-workout meal or strengthening diet for Vata types.',
    localMarketCost: '₹250 - ₹400 per kg',
    purchaseUrl: 'https://www.licious.in/chicken',
    recipe: [
      { step: 1, instruction: 'Marinate with ginger-garlic paste and salt.' },
      { step: 2, instruction: 'Grill on medium flame with minimal oil until cooked through.' },
      { step: 3, instruction: 'Serve with steamed vegetables.' }
    ]
  }
];

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'p1',
    userId: 'u1',
    name: 'Arjun Sharma',
    age: 34,
    gender: 'Male',
    dosha: ['pitta'],
    dietaryHabits: 'Vegetarian',
    // Fix: Removed mealFrequency, bowelMovements, and waterIntake as they are not defined in the Patient interface
    healthConditions: ['Acidity', 'IBS'],
    allergies: ['Peanuts'],
    symptoms: ['Burning sensation', 'Acidity'],
    logs: [],
    ageCategory: 'adult'
  }
];

// Added missing MOCK_DOCTORS
export const MOCK_DOCTORS: Doctor[] = [
  {
    id: 'd1',
    name: 'Dr. Shanti Swaroop',
    designation: 'Senior Ayurvedic Physician',
    specialization: 'Internal Medicine (Kayachikitsa)',
    status: 'Online',
    patientsHandled: 1284
  },
  {
    id: 'd2',
    name: 'Dr. Meena Iyer',
    designation: 'Chief Nutritionist',
    specialization: 'Pathya-Apathya Expert',
    status: 'Offline',
    patientsHandled: 856
  }
];
