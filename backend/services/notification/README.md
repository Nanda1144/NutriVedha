# Notification :3010 — `backend/services/notification`

- **Gateway prefix:** `/api/notification` (proxied by `gateway :8080`)
- **Tables:** `notifications(userId,title,read,channel)` (PostgreSQL `pgQuery` + JSON fallback)
- **Routes:** `GET /, POST /send, POST /broadcast, PATCH /:id/read, DELETE /clear`
- **Auth:** `requireAuth` + `requireRole(...)` from `shared/auth.ts` (JWT `nv_token`)
- **Run:** `npm run dev -w @nutrivedha/notification` | `npm run build -w @nutrivedha/notification`
- **Docker:** `Dockerfile` `node:22-alpine` `HEALTHCHECK GET /health`
- **Port:** `3010` (see `src/index.ts`)
