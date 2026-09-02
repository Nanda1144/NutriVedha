-- NutriVedha PostgreSQL — Migration 002: Remaining services
-- Run after 001: psql $DATABASE_URL -f 002_remaining_services_postgresql.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Marketplace: crops + crop bookings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS crops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  harvest_date TEXT NOT NULL,
  price INT NOT NULL,
  market_price INT NOT NULL,
  recommended BOOLEAN NOT NULL DEFAULT FALSE,
  farmer JSONB NOT NULL,
  description TEXT NOT NULL,
  benefits TEXT NOT NULL,
  diet_support TEXT NOT NULL,
  image TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crop_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  crop_id UUID NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
  quantity INT NOT NULL CHECK (quantity BETWEEN 1 AND 20),
  total_price INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Growing' CHECK (status IN ('Growing','Harvested','Packed','Out for Delivery','Delivered')),
  order_date TEXT NOT NULL,
  payment_intent_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_crop_bookings_user ON crop_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_crop_bookings_crop ON crop_bookings(crop_id);

-- Seed crops (idempotent by name)
INSERT INTO crops (id, name, category, harvest_date, price, market_price, recommended, farmer, description, benefits, diet_support, image)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Organic Amla (Pratapgarh)', 'Ayurvedic Grade', 'Oct 2026', 85, 120, true,
   '{"name":"Ram Singh","location":"Pratapgarh, UP","experience":"25 Years","verified":true,"crops":["Amla","Aloe Vera","Neem"],"impact":"Supports 100% natural farming in his village."}',
   'Grown without any synthetic fertilizers. High in Vitamin C, perfect for Triphala.', 'Boosts immunity, improves skin health, supports digestion.', 'Immunity Booster & Detox Diet',
   'https://images.unsplash.com/photo-1628134707412-23c8a49df5d0?auto=format&fit=crop&q=80&w=600'),
  ('22222222-2222-2222-2222-222222222222', 'Chemical-Free Turmeric', 'Natural', 'Jan 2027', 140, 190, true,
   '{"name":"Savitri Devi","location":"Erode, Tamil Nadu","experience":"15 Years","verified":true,"crops":["Turmeric","Ginger"],"impact":"Helps preserve native turmeric varieties."}',
   'Traditional Erode turmeric with high curcumin content.', 'Anti-inflammatory, blood purifier.', 'Anti-Inflammatory Plan',
   'https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?auto=format&fit=crop&q=80&w=600'),
  ('33333333-3333-3333-3333-333333333333', 'Native Ashwagandha Roots', 'Ayurvedic Grade', 'Nov 2026', 420, 550, false,
   '{"name":"Gopal Mandloi","location":"Neemuch, MP","experience":"30 Years","verified":true,"crops":["Ashwagandha","Shatavari"],"impact":"Empowering local tribal farmers through collective farming."}',
   'Sun-dried using traditional methods to preserve Ojas-building properties.', 'Reduces stress, improves sleep, boosts energy.', 'Stress Relief & Vitality Diet',
   'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=600')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Farmer: livestock, earnings, inventory
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS livestock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  breed TEXT NOT NULL DEFAULT '',
  age TEXT NOT NULL DEFAULT '',
  health TEXT NOT NULL DEFAULT 'Healthy' CHECK (health IN ('Healthy','Needs Attention')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_livestock_user ON livestock(user_id);

CREATE TABLE IF NOT EXISTS farmer_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  source TEXT NOT NULL DEFAULT 'Marketplace',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_farmer_earnings_user ON farmer_earnings(user_id);

CREATE TABLE IF NOT EXISTS farmer_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'kg',
  price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_farmer_inventory_user ON farmer_inventory(user_id);

-- ---------------------------------------------------------------------------
-- Fitness: workouts + fitness_log
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  duration INT NOT NULL,
  calories INT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner','Intermediate','Advanced')),
  premium BOOLEAN NOT NULL DEFAULT FALSE,
  description TEXT NOT NULL,
  steps JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fitness_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  year INT NOT NULL,
  week INT NOT NULL,
  day TEXT NOT NULL,
  duration NUMERIC NOT NULL,
  calories NUMERIC NOT NULL,
  done BOOLEAN NOT NULL DEFAULT TRUE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_fitness_log_user_year_week ON fitness_log(user_id, year, week);

INSERT INTO workouts (id, name, category, duration, calories, difficulty, premium, description, steps)
VALUES
  ('aaaa0001-0000-0000-0000-000000000001', 'Sun Salutation Flow', 'Yoga', 15, 85, 'Beginner', false, 'Classic Surya Namaskar sequence.', '["Mountain pose","Forward fold","Plank","Cobra","Downward dog"]'),
  ('aaaa0002-0000-0000-0000-000000000002', 'Pranayama Breathing', 'Meditation', 10, 30, 'Beginner', false, 'Anulom Vilom + Bhramari.', '["Sit comfortably","Alternate nostril breathing","Humming breath"]'),
  ('aaaa0003-0000-0000-0000-000000000003', 'Ayurvedic Core Burn', 'Strength', 25, 210, 'Intermediate', true, 'Core focused HIIT.', '["Plank holds","Russian twists","Leg raises","Mountain climbers"]')
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Medical: encrypted reports
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS medical_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  encrypted_data TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_medical_reports_user ON medical_reports(user_id);

-- ---------------------------------------------------------------------------
-- Delivery: orders + tracking_points (already seeded via 001 appointments, now add)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS delivery_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL UNIQUE,
  customer TEXT NOT NULL,
  address TEXT NOT NULL,
  items TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','In Transit','Out for Delivery','Delivered')),
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tracking_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES delivery_orders(order_id) ON DELETE CASCADE,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tracking_order ON tracking_points(order_id);

INSERT INTO delivery_orders (id, order_id, customer, address, items, status)
VALUES
  ('d0000001-0000-0000-0000-000000000001', 'ORD-101', 'Pavan Kumar', '123 Neural Lane, BLR', 'Ashwagandha Roots, Organic Honey', 'Pending'),
  ('d0000002-0000-0000-0000-000000000002', 'ORD-102', 'Anjali Sharma', '456 Wellness Rd, BLR', 'Tulsi Tea, Neem Tablets', 'In Transit')
ON CONFLICT (order_id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Notification
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'health' CHECK (type IN ('appointment','order','premium','health','alert')),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  channel TEXT NOT NULL DEFAULT 'inapp' CHECK (channel IN ('push','email','inapp'))
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, sent_at DESC);

-- ---------------------------------------------------------------------------
-- Analytics: audit_logs + activity_events
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity TEXT NOT NULL DEFAULT '',
  meta TEXT,
  ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);

CREATE TABLE IF NOT EXISTS activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_events(user_id);

-- updated_at trigger for new tables
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;
