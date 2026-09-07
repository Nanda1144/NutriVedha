# AI/ML :3003 — `backend/services/ai`

- **Gateway prefix:** `/api/ai` (proxied by `gateway :8080`)
- **Tables:** `ai_requests(type, payload, result)` (PostgreSQL `pgQuery` + JSON fallback)
- **Routes:** `POST /scan, POST /diet, POST /recipes, POST /chat — Gemini 2.0-flash + mock fallback SCAN_BANK`
- **Auth:** `requireAuth` + `requireRole(...)` from `shared/auth.ts` (JWT `nv_token`)
- **Run:** `npm run dev -w @nutrivedha/ai` | `npm run build -w @nutrivedha/ai`
- **Docker:** `Dockerfile` `node:22-alpine` `HEALTHCHECK GET /health`
- **Port:** `3003` (see `src/index.ts`)
