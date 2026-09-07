# User :3002 — `backend/services/user`

- **Gateway prefix:** `/api/user` (proxied by `gateway :8080`)
- **Tables:** `user_profiles(userId,phone,address,avatar)` (PostgreSQL `pgQuery` + JSON fallback)
- **Routes:** `GET/PUT /profile, PUT /security, POST /export`
- **Auth:** `requireAuth` + `requireRole(...)` from `shared/auth.ts` (JWT `nv_token`)
- **Run:** `npm run dev -w @nutrivedha/user` | `npm run build -w @nutrivedha/user`
- **Docker:** `Dockerfile` `node:22-alpine` `HEALTHCHECK GET /health`
- **Port:** `3002` (see `src/index.ts`)
