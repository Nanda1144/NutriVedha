import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load root .env (NutriVedha/.env) then server-level env files.
dotenv.config({ path: path.resolve(__dirname, '../../../../.env'), quiet: true });
dotenv.config({ path: path.resolve(__dirname, '../../../.env'), quiet: true });
dotenv.config({ quiet: true });

export interface ServiceConfig {
  name: string;
  port: number;
  env: 'development' | 'test' | 'production';
  jwtSecret: string;
  jwtExpiry: string;
  medicalEncryptionKey: string;
  corsOrigin: string;
}

export function getConfig(name: string, defaultPort: number): ServiceConfig {
  return {
    name,
    port: parseInt(process.env[`VITE_${name.toUpperCase()}_SERVICE_URL`]
      ?.match(/:(\d+)/)?.[1] ?? '', 10) || defaultPort,
    env: (process.env.VITE_APP_ENV as ServiceConfig['env']) || 'development',
    jwtSecret: process.env.VITE_AUTH_JWT_SECRET || 'dev-secret-change-me',
    jwtExpiry: process.env.VITE_AUTH_JWT_EXPIRY || '7d',
    medicalEncryptionKey: process.env.VITE_MEDICAL_ENCRYPTION_KEY || 'dev-encryption-key-32chars!!',
    corsOrigin: process.env.VITE_CORS_ORIGIN || 'http://localhost:5173',
  };
}
