# Marketplace :3007 — `backend/services/marketplace`

- **Gateway prefix:** `/api/marketplace` (proxied by `gateway :8080`)
- **Tables:** `crops, crop_bookings(pi_sim_*)` (PostgreSQL `pgQuery` + JSON fallback)
- **Routes:** `GET /crops, POST /crops/book, GET /bookings, seed 3 crops`
- **Auth:** `requireAuth` + `requireRole(...)` from `shared/auth.ts` (JWT `nv_token`)
- **Run:** `npm run dev -w @nutrivedha/marketplace` | `npm run build -w @nutrivedha/marketplace`
- **Docker:** `Dockerfile` `node:22-alpine` `HEALTHCHECK GET /health`
- **Port:** `3007` (see `src/index.ts`)
