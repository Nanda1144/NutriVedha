# Services — `backend/services/*`

One folder per microservice. Each has `package.json`, `Dockerfile`, `tsconfig.json`, `src/index.ts`, `src/routes.pg.ts`.

- Pattern: `routes.pg.ts` uses `pgQuery("SELECT ...")` when `isPgAvailable()` else JSON fallback (`shared/db.ts`).
- Health: `GET /health -> {service:"auth",status:"ok"}`
- Auth: every protected route uses `requireAuth` + `requireRole("Doctor")` from `shared/auth.ts`
- Build: `npm run build -w @nutrivedha/auth` etc. Root `npm run build` builds all 14.

Add a new service: copy `services/auth`, rename in `backend/package.json` workspaces + scripts + `dev:all`, add proxy in `gateway/src/index.ts` and a service entry in `docker-compose.yml`.
