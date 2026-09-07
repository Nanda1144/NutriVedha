# Telemedicine :3006 — `backend/services/telemedicine`

- **Gateway prefix:** `/api/telemedicine` (proxied by `gateway :8080`)
- **Tables:** `doctor_profiles, appointments` (PostgreSQL `pgQuery` + JSON fallback)
- **Routes:** `GET /doctors, POST /appointments, PATCH /appointments/:id/cancel, seed 4 doctors`
- **Auth:** `requireAuth` + `requireRole(...)` from `shared/auth.ts` (JWT `nv_token`)
- **Run:** `npm run dev -w @nutrivedha/telemedicine` | `npm run build -w @nutrivedha/telemedicine`
- **Docker:** `Dockerfile` `node:22-alpine` `HEALTHCHECK GET /health`
- **Port:** `3006` (see `src/index.ts`)
