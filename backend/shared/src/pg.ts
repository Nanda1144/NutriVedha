import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true });
dotenv.config({ path: path.resolve(__dirname, '../../../.env'), quiet: true });
dotenv.config({ quiet: true });

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.MONGODB_URI?.startsWith('postgres') ? process.env.MONGODB_URI : undefined;

const pgConfig = connectionString
  ? { connectionString, ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : undefined }
  : {
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT || '5432', 10),
      database: process.env.PGDATABASE || process.env.MONGODB_DB_NAME || 'nutrivedha',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres',
    };

const hasPgEnv = Boolean(connectionString || process.env.PGHOST || process.env.PGDATABASE || process.env.DATABASE_URL);

let pool: Pool | null = null;

export function getPool(): Pool | null {
  if (!hasPgEnv) return null;
  // lazy init — don't connect until first query, so JSON fallback still works if PG unreachable
  if (!pool) {
    pool = new Pool({
      ...pgConfig,
      max: parseInt(process.env.PG_POOL_SIZE || '10', 10),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
    pool.on('error', (err: Error) => console.error('[pg] pool error', err.message));
  }
  return pool;
}

export async function isPgAvailable(): Promise<boolean> {
  const p = getPool();
  if (!p) return false;
  try {
    await p.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}

export async function pgQuery<T = any>(text: string, params?: unknown[]): Promise<{ rows: T[]; rowCount: number }> {
  const p = getPool();
  if (!p) throw new Error('PostgreSQL not configured — set DATABASE_URL or PGHOST/PG* vars');
  const r = await p.query(text, params as any[]);
  return { rows: r.rows as T[], rowCount: r.rowCount ?? 0 };
}

export function isPgConfigured(): boolean {
  return hasPgEnv;
}
