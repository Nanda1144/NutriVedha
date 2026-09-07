# Gateway — `backend/gateway` :8080

Single entry for all frontends (`Main_interface` + `frontend`). Proxies `/api/*` to 14 services.

- `src/index.ts` — http-proxy-middleware, changeOrigin, alias `/api/doctors -> /api/doctor`
- Health: `GET /api/health -> {status:"ok",gateway:"up"}`
- Env: loads root `.env` via `shared/config.ts`
- Run: `npm run dev -w gateway` | `npm run build -w gateway`
- Docker: `Dockerfile` node:22-alpine, `HEALTHCHECK /health`
- Security: helmet, cors `VITE_CORS_ORIGIN=http://localhost:5173`, rateLimit 15m/100
- Depends on: `postgres` healthy (docker-compose)
