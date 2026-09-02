/**
 * NutriVedha — shared domain types for the frontend.
 *
 * These mirror the backend microservice models so the UI and the API
 * layer (src/services) speak the same shape.
 */

// ---------- Auth ----------
export type UserRole = 'User' | 'Doctor' | 'Trainer' | 'Farmer' | 'Delivery' | 'Admin';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  passkeyIdentity?: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: UserRole;
}

// ---------- Health / Medical ----------
export interface Recommendation {
  title: string;
  text: string;
}

export interface HealthReport {
  id: string;
  date: string;
  condition: string;
  symptoms: string[];
  severity: 'Low' | 'Medium' | 'High';
  recommendations: Recommendation[];
}

export interface ScanResult extends HealthReport {
  confidence?: number;
}

// ---------- Diet & Recipes ----------
export interface IngredientRef {
  name: string;
  amount?: string;
  health?: string;
}

export interface Meal {
  time: string;
  meal: string;
  ingredients: IngredientRef[];
  budget: boolean;
  health: string;
  instructions?: string;
  isDoctorRecommended?: boolean;
}

export interface DietPlan {
  id: string;
  day: string;
  meals: Meal[];
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  dietSupport: string;
  tags?: string[];
}

// ---------- Fitness ----------
export interface Workout {
  id: string;
  name: string;
  category: 'Yoga' | 'Meditation' | 'Strength' | 'Cardio';
  duration: number;
  calories: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  premium?: boolean;
  description: string;
  steps: string[];
}

export interface FitnessProfile {
  bodyType: 'bulk' | 'skinny' | 'cut' | null;
  ageStage: 1 | 2 | 3 | null;
  trainerId: string | null;
  isPremium: boolean;
  workoutStreak: number;
  weightHistory: { date: string; weight: number }[];
  completedWorkouts: string[];
}

// ---------- Telemedicine ----------
export interface DoctorProfile {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  rating: number;
  reviews: number;
  status: 'Available' | 'In Call' | 'Offline';
  fee: number;
  photo: string;
}

export interface Appointment {
  id: string;
  doctorId: string;
  date: string;
  time: string;
  mode: 'video' | 'chat';
  status: 'Booked' | 'Completed' | 'Cancelled';
}

// ---------- Marketplace ----------
export interface Crop {
  id: string;
  name: string;
  category: string;
  harvestDate: string;
  price: number;
  marketPrice: number;
  recommended: boolean;
  farmer: {
    name: string;
    location: string;
    experience: string;
    verified: boolean;
    crops: string[];
    impact: string;
  };
  description: string;
  benefits: string;
  dietSupport: string;
  image: string;
}

export interface CropBooking {
  id: string;
  cropId: string;
  quantity: number;
  totalPrice: number;
  status: 'Growing' | 'Harvested' | 'Packed' | 'Out for Delivery' | 'Delivered';
  orderDate: string;
  paymentIntentId?: string;
}

// ---------- Delivery ----------
export interface DeliveryOrder {
  id: string;
  orderId: string;
  customer: string;
  address: string;
  items: string;
  status: 'Pending' | 'In Transit' | 'Out for Delivery' | 'Delivered';
  createdAt: string;
}

export interface TrackingPoint {
  id: string;
  orderId: string;
  lat: number;
  lng: number;
  note: string;
  timestamp: string;
}

// ---------- Farmer ----------
export interface Livestock {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: string;
  health: 'Healthy' | 'Needs Attention';
}

export interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  unit: string;
  price: number;
}

export interface Earning {
  id: string;
  month: string;
  amount: number;
  source: string;
}

// ---------- Notification ----------
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'appointment' | 'order' | 'premium' | 'health' | 'alert';
  read: boolean;
  sentAt: string;
  channel: 'push' | 'email' | 'inapp';
}

// ---------- Analytics ----------
export interface AuditLog {
  id: string;
  userId?: string;
  accessor?: string;
  role?: string;
  action: string;
  entity?: string;
  status?: 'Success' | 'Denied';
  createdAt?: string;
  timestamp?: string;
}

export interface ActivityEvent {
  id: string;
  event: string;
  createdAt: string;
}