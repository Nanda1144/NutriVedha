# USDA FoodData — `database/usda-food-data/`

25 CSV files from USDA FoodData Central (reference nutrition dataset).

- Not wired to runtime; `frontend/src/data/foodDatabase.ts` uses a curated 120-item subset.
- For production ingestion: parse CSV -> seed `crops` or enrich `foodDatabase.ts`, then migrate to PostgreSQL.
- Keep as reference — do not commit derived DB dumps.

Source: https://fdc.nal.usda.gov/
