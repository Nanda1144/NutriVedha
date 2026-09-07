# Farmer :3012 — `backend/services/farmer`

- **Gateway prefix:** `/api/farmer` (proxied by `gateway :8080`)
- **Tables:** `farmer_inventory, farmer_earnings, livestock` (PostgreSQL `pgQuery` + JSON fallback)
- **Routes:** `GET/POST /inventory, GET /earnings, POST /earnings`
- **Auth:** `requireAuth` + `requireRole(...)` from `shared/auth.ts` (JWT `nv_token`)
- **Run:** `npm run dev -w @nutrivedha/farmer` | `npm run build -w @nutrivedha/farmer`
- **Docker:** `Dockerfile` `node:22-alpine` `HEALTHCHECK GET /health`
- **Port:** `3012` (see `src/index.ts`)
