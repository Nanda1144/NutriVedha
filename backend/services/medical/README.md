# Medical :3005 — `backend/services/medical`

- **Gateway prefix:** `/api/medical` (proxied by `gateway :8080`)
- **Tables:** `medical_reports(userId, encrypted_data AES-256-GCM)` (PostgreSQL `pgQuery` + JSON fallback)
- **Routes:** `GET /reports, POST /reports, GET /reports/:id (decrypted server-side)`
- **Auth:** `requireAuth` + `requireRole(...)` from `shared/auth.ts` (JWT `nv_token`)
- **Run:** `npm run dev -w @nutrivedha/medical` | `npm run build -w @nutrivedha/medical`
- **Docker:** `Dockerfile` `node:22-alpine` `HEALTHCHECK GET /health`
- **Port:** `3005` (see `src/index.ts`)
