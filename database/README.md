# NutriVedha Database

This folder documents the **data layer** for the entire NutriVedha platform.

```
database/
├── README.md                 <- you are here
├── schema/                   <- JSON schema contracts for every collection
├── usda-food-data/           <- USDA FoodData Central CSVs (reference nutrition dataset)
└── migrations-legacy/        <- old ad-hoc fix scripts (kept for reference)
```

---

## 1. Current persistence — PostgreSQL (primary) + JSON fallback (dev)

The backend ships with **PostgreSQL-native storage** (`backend/shared/src/pg.ts` `pg.Pool`) **plus** a lightweight embedded JSON store (`backend/shared/src/db.ts`) fallback.

```
PostgreSQL (when DATABASE_URL set)  →  pgQuery()  →  database/migrations/001_002*.sql
JSON-file MemDB (when no DB)        →  backend/data/<collection>.json  (zero infra)
```

`isPgAvailable()` probes `SELECT 1` at service boot; if PostgreSQL is unreachable, services automatically fall back to JSON — so `npm run dev:all` still works without a DB. Swapping is **zero code change** — services never import `pg` directly except via `shared/pg.ts`.

| Adapter | When | Where |
|---|---|---|
| PostgreSQL (primary) | `DATABASE_URL` or `PGHOST` set | `database/migrations/001_init_postgresql.sql` + `002_remaining_services_postgresql.sql` |
| JSON-file MemDB | no DB / PG unreachable (dev) | `backend/data/*.json` |

## 2. Target: PostgreSQL design (all data lives in PostgreSQL)

- **Database name:** `nutrivedha`
- **Connection:** `MONGODB_URI=mongodb://localhost:27017/nutrivedha`
- **Convention:** each microservice owns its collections; no cross-service writes.
- **Identifiers:** all documents use a string `_id` (UUID). We use `id` in the JSON
  adapter and map to `_id` in the Mongo adapter.

```
auth        | users
user        | user_profiles
ai          | ai_requests, scan_audits
medical     | health_reports            (encrypted via AES-256-GCM at rest)
telemedicine| doctors, appointments
marketplace | crops, crop_bookings, payments
delivery    | delivery_orders, tracking_points
fitness     | workouts, fitness_log
farmer      | livestock, farmer_inventory, farmer_earnings
doctor      | doctor_profiles, patient_records
notification| notifications
analytics   | audit_logs, activity_events
```

## 3. Encryption & security

- **Health reports:** encrypted with `AES-256-GCM` using `VITE_MEDICAL_ENCRYPTION_KEY`
  before writes; the key lives only in the environment, never in the database.
- **Passwords:** hashed with **bcrypt (10 rounds)** — never stored in plaintext.
- **JWT:** signed with `VITE_AUTH_JWT_SECRET`, expiry 7 days (`VITE_AUTH_JWT_EXPIRY`).
- **Audit trail:** every sensitive action writes to `audit_logs` in the Analytics service.

## 4. Indexing plan (prod)

| Collection | Index | Purpose |
|---|---|---|
| users | `email` (unique), `phone` | fast login / OTP |
| health_reports | `userId`, `date desc` | patient timeline |
| appointments | `doctorId`, `date` | schedule lookup |
| crop_bookings | `userId`, `status` | order tracking |
| tracking_points | `orderId`, `timestamp` | GPS timeline |
| fitness_log | `userId`, `year/ week` | streak calc |
| notifications | `userId`, `sentAt desc` | inbox |
| audit_logs | `userId`, `createdAt desc` | auditing |

## 5. Seed data

Seed is generated in code, not via SQL:

- `doctors` — telemedicine service seeds on first boot
- `crops` — marketplace service seeds on first boot
- `workouts` — fitness service seeds on first boot
- `users` — created only through auth register / OTP / passkey login

Run `npm run dev:all` in `backend/` once to populate `backend/data/`.

## 6. Migration strategy (PostgreSQL)

```bash
# 1. Create database
createdb nutrivedha  # or psql -c "CREATE DATABASE nutrivedha;"

# 2. Run migrations in order
psql $DATABASE_URL -f database/migrations/001_init_postgresql.sql
psql $DATABASE_URL -f database/migrations/002_remaining_services_postgresql.sql

# Env (see .env.example):
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nutrivedha
# or PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD
# PG_POOL_SIZE=10
```

Versioned scripts live in `database/migrations/` (`001_doctor + users/appointments`, `002_marketplace/farmer/fitness/medical/delivery/notification/analytics`).
Legacy ad-hoc scripts are preserved under `database/migrations-legacy/`.
To reset JSON fallback dev data: delete `backend/data/*.json` and restart `npm run dev:all`.