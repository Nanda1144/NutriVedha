# Delivery :3008 — `backend/services/delivery`

- **Gateway prefix:** `/api/delivery` (proxied by `gateway :8080`)
- **Tables:** `delivery_orders(assigned_to), tracking_points(lat,lng)` (PostgreSQL `pgQuery` + JSON fallback)
- **Routes:** `GET /orders?search, PATCH /orders/:id/status, POST /orders/:id/tracking`
- **Auth:** `requireAuth` + `requireRole(...)` from `shared/auth.ts` (JWT `nv_token`)
- **Run:** `npm run dev -w @nutrivedha/delivery` | `npm run build -w @nutrivedha/delivery`
- **Docker:** `Dockerfile` `node:22-alpine` `HEALTHCHECK GET /health`
- **Port:** `3008` (see `src/index.ts`)
