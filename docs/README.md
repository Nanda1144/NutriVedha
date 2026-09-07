# Docs — `docs/`

- `documentation.pdf` — original project specification
- Root `README.md` sections 1–28 are the living docs: motive, solution, stack, structure, execution, test cases, env, challenges
- `database/README.md` — persistence, indexing, migrations
- `database/migrations/README.md` — PostgreSQL run guide (001–004)
- `Main_interface/README.md` — public website spec (7 pages, navbar, animations, auth flow)
- `frontend/README.md` — role-based app (23 routes, 6 dashboards)
- `backend/README.md` — 14 microservices + gateway + shared
- `backend/gateway/README.md`, `backend/shared/README.md`, `backend/services/README.md` — per-layer docs

For deployment see root README **Vercel + AWS** sections and `../docker-compose.yml`.

## How to maintain docs
- Keep root README as single source of truth; per-folder READMEs link back to it.
- When adding a service/page/migration, update both the per-folder README and the Feature-Role Matrix in root README.
- Do not commit `.env` — only `.env.example`.
