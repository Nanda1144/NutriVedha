import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load env files in priority order:
//   1. <repo-root>/backend/.env   (backend-specific overrides)
//   2. <repo-root>/.env           (shared monorepo root env)
//   3. process.env / shell-provided vars
dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true });
dotenv.config({ path: path.resolve(__dirname, '../../../.env'), quiet: true });
dotenv.config({ quiet: true });

export interface PgConfig {
  url?: string;
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  poolSize: number;
  configured: boolean;
}

export interface ServiceConfig {
  name: string;
  port: number;
  env: 'development' | 'test' | 'production';
  jwtSecret: string;
  jwtExpiry: string;
  medicalEncryptionKey: string;
  corsOrigin: string;
  pg: PgConfig;
}

export function getPgConfig(): PgConfig {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  return {
    url,
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432', 10),
    database: process.env.PGDATABASE || process.env.MONGODB_DB_NAME || 'nutrivedha',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    poolSize: parseInt(process.env.PG_POOL_SIZE || process.env.PGPOOL_SIZE || '10', 10),
    configured: Boolean(url || process.env.PGHOST || process.env.PGDATABASE),
  };
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
    pg: getPgConfig(),
  };
}
