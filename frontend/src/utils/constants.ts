/**
 * NutriVedha — static registry of backend microservices.
 *
 * `path` is the route prefix exposed by the API Gateway (http://localhost:8080).
 * The gateway forwards /api/<path> to the matching service port.
 */

export interface ServiceMeta {
  name: string;
  port: number;
  path: string;
  description: string;
}

export const SERVICES: ServiceMeta[] = [
  { name: 'auth', port: 3001, path: '/auth', description: 'Registration, login, OTP, passkey admin, RBAC' },
  { name: 'user', port: 3002, path: '/users', description: 'Profiles, security settings, export & delete' },
  { name: 'ai', port: 3003, path: '/ai', description: 'Gemini disease scan, diet, recipes, chatbot' },
  { name: 'medical', port: 3005, path: '/medical', description: 'Encrypted health reports' },
  { name: 'telemedicine', port: 3006, path: '/telemedicine', description: 'Doctors & appointments' },
  { name: 'marketplace', port: 3007, path: '/marketplace', description: 'Crops, pre-bookings, payments' },
  { name: 'delivery', port: 3008, path: '/delivery', description: 'Orders & GPS tracking' },
  { name: 'fitness', port: 3009, path: '/fitness', description: 'Workouts, streaks, analytics' },
  { name: 'notification', port: 3010, path: '/notification', description: 'Push/email/in-app alerts' },
  { name: 'analytics', port: 3011, path: '/analytics', description: 'Audit logs & activity metrics' },
  { name: 'farmer', port: 3012, path: '/farmer', description: 'Livestock, inventory, earnings' },
  { name: 'doctor', port: 3014, path: '/doctor', description: 'Doctor profiles & patients' },
];

export const ROLES = ['User', 'Doctor', 'Trainer', 'Farmer', 'Delivery', 'Admin'] as const;

export const ADMIN_PASSKEYS = ['@cC1411441', 'pavan', 'manil', 'jyo', 'janu'] as const;

export const APP_ROUTES = [
  { path: '/', label: 'Home' },
  { path: '/login', label: 'Login' },
  { path: '/scan', label: 'Disease Scan' },
  { path: '/diet', label: 'Diet Planner' },
  { path: '/recipes', label: 'Recipes' },
  { path: '/fitness', label: 'Fitness' },
  { path: '/telemedicine', label: 'Telemedicine' },
  { path: '/marketplace', label: 'Marketplace' },
  { path: '/food-intel', label: 'Food Intelligence' },
  { path: '/sign-ai', label: 'Sign Language AI' },
  { path: '/profile', label: 'Profile' },
] as const;