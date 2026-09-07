# Doctor :3014 — `backend/services/doctor`

- **Gateway prefix:** `/api/doctor alias /api/doctors` (proxied by `gateway :8080`)
- **Tables:** `doctor_profiles, patient_records, verification_queue` (PostgreSQL `pgQuery` + JSON fallback)
- **Routes:** `POST /register, POST /verify, GET /patients, POST /patients/:id/notes`
- **Auth:** `requireAuth` + `requireRole(...)` from `shared/auth.ts` (JWT `nv_token`)
- **Run:** `npm run dev -w @nutrivedha/doctor` | `npm run build -w @nutrivedha/doctor`
- **Docker:** `Dockerfile` `node:22-alpine` `HEALTHCHECK GET /health`
- **Port:** `3014` (see `src/index.ts`)
