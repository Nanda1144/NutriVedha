import { getConfig, createService, isPgConfigured, isPgAvailable, getPool } from '@nutrivedha/shared';
import routes from './routes.pg.js';

const config = getConfig('trainer', 3015);
const app = createService(config, '/api/trainer', (app) => {
  app.use('/api/trainer', routes);
});

app.listen(config.port, async () => {
  console.log(`[trainer] service running on :${config.port}`);
  if (isPgConfigured()) console.log(`[trainer] PostgreSQL ${await isPgAvailable() ? 'connected' : 'fallback JSON'} (${config.pg.host}:${config.pg.port}/${config.pg.database})`);
  else console.log('[trainer] PostgreSQL not configured — JSON fallback');
  process.on('SIGTERM', async () => { try { await getPool()?.end(); } catch {} process.exit(0); });
});
