# Fitness :3009 — `backend/services/fitness`

- **Gateway prefix:** `/api/fitness` (proxied by `gateway :8080`)
- **Tables:** `workouts, fitness_log(year,week,streak)` (PostgreSQL `pgQuery` + JSON fallback)
- **Routes:** `GET /workouts, POST /log, GET /log?year=2026, seed workouts`
- **Auth:** `requireAuth` + `requireRole(...)` from `shared/auth.ts` (JWT `nv_token`)
- **Run:** `npm run dev -w @nutrivedha/fitness` | `npm run build -w @nutrivedha/fitness`
- **Docker:** `Dockerfile` `node:22-alpine` `HEALTHCHECK GET /health`
- **Port:** `3009` (see `src/index.ts`)
