# NutriVedha — PostgreSQL Migrations

We moved from MongoDB/JSON-file to **PostgreSQL** (your choice).

## Run

```bash
# via DATABASE_URL (recommended)
psql $DATABASE_URL -f database/migrations/001_init_postgresql.sql

# or via discrete vars
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -f database/migrations/001_init_postgresql.sql

# Docker
docker compose up -d postgres   # see docker-compose.yml if present
# then psql
```

## How services use it

`backend/shared/src/pg.ts` creates a `pg.Pool` when `DATABASE_URL` or `PGHOST` is set.
`isPgAvailable()` probes `SELECT 1` — if PostgreSQL is unreachable, services **fallback to JSON-file** `backend/data/*.json` so `npm run dev:all` still works without a DB.

Doctor service (`backend/services/doctor`) is the first PostgreSQL-native service: all `doctor_profiles / patient_records / appointments / verification_queue` queries go via `pgQuery()` when PG is available.

## Env

Add to `.env` (see `.env.example`):

```
DATABASE_URL=postgresql://user:password@localhost:5432/nutrivedha
# or
PGHOST=localhost
PGPORT=5432
PGDATABASE=nutrivedha
PGUSER=postgres
PGPASSWORD=postgres
PG_POOL_SIZE=10
```
