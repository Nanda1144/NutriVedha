-- NutriVedha PostgreSQL — Initial migration (PostgreSQL-native)
-- Compatible with DATABASE_URL / PGHOST etc. Run via: psql $DATABASE_URL -f 001_init_postgresql.sql
-- Doctor service is the first to be PostgreSQL-backed; other services keep JSON fallback until migrated.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Users (shared across services) — mirrors backend auth/user services
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'User' CHECK (role IN ('User','Doctor','Trainer','Farmer','Delivery','Admin')),
  password_hash TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ---------------------------------------------------------------------------
-- Doctor profiles
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS doctor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  specialization TEXT NOT NULL DEFAULT 'General Ayurveda',
  reg_number TEXT NOT NULL UNIQUE,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  patients INT NOT NULL DEFAULT 0,
  experience TEXT NOT NULL DEFAULT '5+ Years',
  rating NUMERIC(2,1) NOT NULL DEFAULT 4.5,
  fee INT NOT NULL DEFAULT 500,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_user_id ON doctor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_reg_number ON doctor_profiles(reg_number);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_verified ON doctor_profiles(verified);

-- ---------------------------------------------------------------------------
-- Patient records (doctor-supervised)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS patient_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctor_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  condition TEXT,
  severity TEXT CHECK (severity IN ('Low','Medium','High')),
  last_visit TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_patient_records_doctor_id ON patient_records(doctor_id);
CREATE INDEX IF NOT EXISTS idx_patient_records_user_id ON patient_records(user_id);

-- ---------------------------------------------------------------------------
-- Appointments (telemedicine) — shared with doctor service
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  doctor_profile_id UUID NOT NULL REFERENCES doctor_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('video','chat')),
  status TEXT NOT NULL DEFAULT 'Booked' CHECK (status IN ('Booked','Completed','Cancelled')),
  fee INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_profile_id, date);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_user_id);

-- ---------------------------------------------------------------------------
-- AI verification queue (doctor must verify AI reports)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS verification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL,
  condition TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'Medium',
  report_id UUID,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Verified','Rejected')),
  assigned_doctor_id UUID REFERENCES doctor_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Seed: demo doctors (idempotent)
-- ---------------------------------------------------------------------------
INSERT INTO doctor_profiles (id, user_id, name, specialization, reg_number, verified, patients, experience, rating, fee)
VALUES
  ('00000000-0000-0000-0000-000000000001', gen_random_uuid(), 'Dr. Ananya Sharma', 'Ayurvedic Internal Medicine', 'AYU-REG-001', true, 24, '12+ Years', 4.8, 500),
  ('00000000-0000-0000-0000-000000000002', gen_random_uuid(), 'Dr. Vikram Mehra', 'Ayurvedic Skin Specialist', 'AYU-REG-002', true, 18, '8+ Years', 4.9, 800)
ON CONFLICT (reg_number) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Helper: updated_at trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_doctor_profiles_updated ON doctor_profiles;
CREATE TRIGGER trg_doctor_profiles_updated BEFORE UPDATE ON doctor_profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_patient_records_updated ON patient_records;
CREATE TRIGGER trg_patient_records_updated BEFORE UPDATE ON patient_records FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_appointments_updated ON appointments;
CREATE TRIGGER trg_appointments_updated BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION set_updated_at();
