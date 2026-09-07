# Auth :3001 — `backend/services/auth`

- **Gateway prefix:** `/api/auth` (proxied by `gateway :8080`)
- **Tables:** `users(id,email,passwordHash,role) JWT+bcrypt+OTP, passkey admin` (PostgreSQL `pgQuery` + JSON fallback)
- **Routes:** `POST /register, POST /login, POST /otp/request, POST /otp/verify, GET /me`
- **Auth:** `requireAuth` + `requireRole(...)` from `shared/auth.ts` (JWT `nv_token`)
- **Run:** `npm run dev -w @nutrivedha/auth` | `npm run build -w @nutrivedha/auth`
- **Docker:** `Dockerfile` `node:22-alpine` `HEALTHCHECK GET /health`
- **Port:** `3001` (see `src/index.ts`)
