-- NutriVedha PostgreSQL — Migration 005: Phase 0 Auth (JWT + RBAC + User Identity)
-- Run after 004: psql $DATABASE_URL -f 005_phase0_auth_rbac.sql
-- Adds secure user identity fields and refresh token store. Preserves existing users.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Users: add Phase 0 identity fields (preserve existing rows)
-- ---------------------------------------------------------------------------
ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','PENDING','INACTIVE','SUSPENDED'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Backfill existing professional users to PENDING (require verification) — keep USER as ACTIVE
-- Keep Admin as ACTIVE + verified
UPDATE users SET status = 'ACTIVE', is_verified = TRUE WHERE role = 'User' AND status = 'ACTIVE';
UPDATE users SET status = 'ACTIVE', is_verified = TRUE WHERE role = 'Admin' AND status = 'ACTIVE';
-- Professional roles start as PENDING for new flow; existing rows already inserted stay ACTIVE to avoid breaking demo
-- (new registrations will enforce PENDING)

-- Normalize role values to canonical uppercase (USER,DOCTOR,etc) — keep CHECK flexible for transition
-- Add constraint for future inserts (case-sensitive canonical)
DO $$
BEGIN
  -- Migrate existing mixed-case roles to uppercase canonical
  UPDATE users SET role = UPPER(role) WHERE role IN ('User','Doctor','Trainer','Farmer','Delivery','Admin');
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'role migration skipped: %', SQLERRM;
END $$;

-- Ensure role check now allows canonical uppercase
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('USER','DOCTOR','TRAINER','FARMER','DELIVERY','ADMIN','User','Doctor','Trainer','Farmer','Delivery','Admin'));

CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- updated_at trigger for users
DROP TRIGGER IF EXISTS trg_users_updated ON users;
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Refresh tokens (hashed at rest, never plain)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  ip TEXT,
  user_agent TEXT
);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON refresh_tokens(expires_at);

-- ---------------------------------------------------------------------------
-- OTP store (hashed, for mobile flow) — optional, improves security over plain OTP_STORE
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS otp_codes (
  phone TEXT PRIMARY KEY,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Ensure audit_logs can store auth events (already exists)
-- ---------------------------------------------------------------------------
-- No change needed; auth service will INSERT into audit_logs and activity_events
