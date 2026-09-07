# NutriVedha — Backend (Microservices)

14 services + shared lib + API Gateway. Node 22 + Express 4 + TypeScript + PostgreSQL 16.

## Services & Ports
| Service | Port | Folder | Gateway prefix | DB tables |
|---|---|---|---|---|
| Gateway | 8080 | gateway | /api/health, proxy /api/* | — |
| Auth | 3001 | services/auth | /api/auth | users |
| User | 3002 | services/user | /api/user | user_profiles |
| AI/ML | 3003 | services/ai | /api/ai | ai_requests |
| Medical | 3005 | services/medical | /api/medical | medical_reports (AES-256-GCM) |
| Telemedicine | 3006 | services/telemedicine | /api/telemedicine | doctor_profiles, appointments |
| Marketplace | 3007 | services/marketplace | /api/marketplace | crops, crop_bookings |
| Delivery | 3008 | services/delivery | /api/delivery | delivery_orders, tracking_points |
| Fitness | 3009 | services/fitness | /api/fitness | workouts, fitness_log |
| Notification | 3010 | services/notification | /api/notification | notifications |
| Analytics | 3011 | services/analytics | /api/analytics | audit_logs, activity_events |
| Farmer | 3012 | services/farmer | /api/farmer | farmer_inventory, farmer_earnings, livestock |
| Doctor | 3014 | services/doctor | /api/doctor, alias /api/doctors | doctor_profiles, patient_records |
| Trainer | 3015 | services/trainer | /api/trainer | trainer_trainees, trainer_sessions |

## Entry Point
`gateway/src/index.ts` — http-proxy-middleware, alias `doctors -> doctor`. All frontends talk to one URL: `http://localhost:8080/api`.

## Shared lib `shared/src/`
- `config.ts` — loads `.env`, `getPgConfig()` (DATABASE_URL | PGHOST)
- `pg.ts` — `Pool` lazy, `isPgAvailable() SELECT 1`, `pgQuery(text,params)`, JSON fallback if no PG
- `crypto.ts` — AES-256-GCM encrypt/decrypt (medical)
- `auth.ts:43` — `requireAuth`, `requireRole(...roles)` JWT verify
- `service.ts:12` — `createService(name)` creates Express with helmet/cors/rateLimit(15m/100)

## Run (local)
```bash
cd backend
npm install          # workspaces 214 packages
npm run build        # tsc -p shared + gateway + 14 services — must be 14/14
npm run dev:all      # concurrently 14 services + gateway (15 processes)
# single: npm run dev:auth | dev:gateway | dev:doctor …
docker compose up -d postgres  # PostgreSQL 16 pgdata, migrations auto-run from database/migrations/
```

## Build (Docker)
```bash
docker compose up --build   # postgres + gateway + services node:22-alpine HEALTHCHECK /health
```

## Deploy (AWS)
- Image: `node:22-alpine`, `HEALTHCHECK /health`
- ECS Fargate task per service, ALB -> gateway 8080, RDS Postgres, Secrets Manager for `.env`.
- See root README Deployment section for full AWS architecture.
