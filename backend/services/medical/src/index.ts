import { getConfig, createService, isPgConfigured, isPgAvailable, getPool } from '@nutrivedha/shared';
import routes from './routes.pg.js';

const config = getConfig('medical', 3005);
const app = createService(config, '/api/medical', (app) => {
  app.use('/api/medical', routes);
});

app.listen(config.port, async () => {
  console.log(`[medical] service running on :${config.port}`);
  if (isPgConfigured()) console.log(`[medical] PostgreSQL ${await isPgAvailable() ? 'connected' : 'fallback JSON'} (${config.pg.host}:${config.pg.port}/${config.pg.database})`);
  else console.log('[medical] PostgreSQL not configured — JSON fallback');
  process.on('SIGTERM', async () => { try { await getPool()?.end(); } catch {} process.exit(0); });
});
