-- Trainer microservice — 3015
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE TABLE IF NOT EXISTS trainer_trainees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  goal TEXT NOT NULL,
  compliance INT NOT NULL DEFAULT 65 CHECK (compliance BETWEEN 0 AND 100),
  status TEXT NOT NULL DEFAULT 'In Progress' CHECK (status IN ('In Progress','Completed')),
  progress INT NOT NULL DEFAULT 65,
  last_active TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_trainer_trainees_trainer ON trainer_trainees(trainer_id);
CREATE TABLE IF NOT EXISTS trainer_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  time TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Custom',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_trainer_sessions_trainer ON trainer_sessions(trainer_id);
