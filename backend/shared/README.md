# Shared — `backend/shared`

Infrastructure used by all 14 services. Do not import `pg` directly elsewhere.

- `src/config.ts` — dotenv, `getPgConfig()` reads `DATABASE_URL | PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD`
- `src/pg.ts` — `Pool` lazy (10), `isPgAvailable() SELECT 1`, `pgQuery(text,params)`, fallback to JSON if no PG
- `src/db.ts` — JSON-file MemDB fallback `backend/data/*.json` (zero-infra dev)
- `src/crypto.ts` — AES-256-GCM `encrypt(text,key)` / `decrypt(cipher,key)` (medical)
- `src/auth.ts:43` — `requireAuth`, `requireRole(...roles)` JWT verify `VITE_AUTH_JWT_SECRET`
- `src/resp.ts` — uniform `ok(data)` / `err(message,status)`
- `src/service.ts:12` — `createService(name)` creates Express with helmet/cors/rateLimit

Build: `npm run build -w shared` must succeed before any service build.
