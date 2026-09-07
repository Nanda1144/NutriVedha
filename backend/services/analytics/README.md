# Analytics :3011 — `backend/services/analytics`

- **Gateway prefix:** `/api/analytics` (proxied by `gateway :8080`)
- **Tables:** `audit_logs, activity_events` (PostgreSQL `pgQuery` + JSON fallback)
- **Routes:** `GET /audit?role, GET /admin/overview, POST /audit`
- **Auth:** `requireAuth` + `requireRole(...)` from `shared/auth.ts` (JWT `nv_token`)
- **Run:** `npm run dev -w @nutrivedha/analytics` | `npm run build -w @nutrivedha/analytics`
- **Docker:** `Dockerfile` `node:22-alpine` `HEALTHCHECK GET /health`
- **Port:** `3011` (see `src/index.ts`)
