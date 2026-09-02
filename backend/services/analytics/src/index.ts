import { getConfig, createService, isPgConfigured, isPgAvailable, getPool } from '@nutrivedha/shared';
import routes from './routes.pg.js';

const config = getConfig('analytics', 3011);
const app = createService(config, '/api/analytics', (app) => {
  app.use('/api/analytics', routes);
});

app.listen(config.port, async () => {
  console.log(`[analytics] service running on :${config.port}`);
  if (isPgConfigured()) console.log(`[analytics] PostgreSQL ${await isPgAvailable() ? 'connected' : 'fallback JSON'} (${config.pg.host}:${config.pg.port}/${config.pg.database})`);
  else console.log('[analytics] PostgreSQL not configured — JSON fallback');
  process.on('SIGTERM', async () => { try { await getPool()?.end(); } catch {} process.exit(0); });
});
