# Migrations Legacy — `database/migrations-legacy/`

Old ad-hoc `fix_db*.js` scripts kept for reference only.

Do not run. Use versioned migrations:
```bash
psql $DATABASE_URL -f database/migrations/001_init_postgresql.sql
psql $DATABASE_URL -f database/migrations/002_remaining_services_postgresql.sql
psql $DATABASE_URL -f database/migrations/003_auth_user_ai_postgresql.sql
psql $DATABASE_URL -f database/migrations/004_trainer_postgresql.sql
```
Or `docker compose up -d postgres` which auto-runs 001–004 via `initdb.d` volume.
