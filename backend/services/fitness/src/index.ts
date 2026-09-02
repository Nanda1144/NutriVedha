import { getConfig, createService, isPgConfigured, isPgAvailable, getPool } from '@nutrivedha/shared';
import routes from './routes.pg.js';

const config = getConfig('fitness', 3009);
const app = createService(config, '/api/fitness', (app) => {
  app.use('/api/fitness', routes);
});

app.listen(config.port, async () => {
  console.log(`[fitness] service running on :${config.port}`);
  if (isPgConfigured()) console.log(`[fitness] PostgreSQL ${await isPgAvailable() ? 'connected' : 'fallback JSON'} (${config.pg.host}:${config.pg.port}/${config.pg.database})`);
  else console.log('[fitness] PostgreSQL not configured — JSON fallback');
  process.on('SIGTERM', async () => { try { await getPool()?.end(); } catch {} process.exit(0); });
});
