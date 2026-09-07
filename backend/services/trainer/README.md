# Trainer :3015 — `backend/services/trainer`

- **Gateway prefix:** `/api/trainer` (proxied by `gateway :8080`)
- **Tables:** `trainer_trainees, trainer_sessions` (PostgreSQL `pgQuery` + JSON fallback)
- **Routes:** `GET/POST /trainees, GET /trainees/:id, POST /trainees/:id/plan`
- **Auth:** `requireAuth` + `requireRole(...)` from `shared/auth.ts` (JWT `nv_token`)
- **Run:** `npm run dev -w @nutrivedha/trainer` | `npm run build -w @nutrivedha/trainer`
- **Docker:** `Dockerfile` `node:22-alpine` `HEALTHCHECK GET /health`
- **Port:** `3015` (see `src/index.ts`)
