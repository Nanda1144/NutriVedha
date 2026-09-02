-- NutriVedha PostgreSQL — Migration 003: Auth / User / AI (remaining core)
-- Run after 002: psql $DATABASE_URL -f 003_auth_user_ai_postgresql.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Auth users already created in 001 (users). Ensure columns for auth flow:
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- User profiles (extended fields from frontend Profile)
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  avatar TEXT,
  role TEXT NOT NULL DEFAULT 'User',
  age INT,
  dob DATE,
  weight NUMERIC,
  height NUMERIC,
  blood_group TEXT,
  diseases TEXT[],
  fitness_goal TEXT,
  education TEXT,
  member_since TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- User RBAC per-user
CREATE TABLE IF NOT EXISTS user_rbac (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  doctor BOOLEAN NOT NULL DEFAULT TRUE,
  trainer BOOLEAN NOT NULL DEFAULT TRUE,
  farmer BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User security settings
CREATE TABLE IF NOT EXISTS user_security (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  two_step_verification BOOLEAN NOT NULL DEFAULT FALSE,
  data_encrypted BOOLEAN NOT NULL DEFAULT TRUE,
  last_backup TIMESTAMPTZ,
  integrity_passed BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI requests log (scan/diet/recipes/chat)
CREATE TABLE IF NOT EXISTS ai_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('scan','diet','recipes','chat','report')),
  prompt TEXT NOT NULL,
  response JSONB NOT NULL,
  used_live BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_requests_user_type ON ai_requests(user_id, type);
