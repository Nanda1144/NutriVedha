import { getConfig, createService, isPgConfigured, isPgAvailable, getPool } from '@nutrivedha/shared';
import routes from './routes.pg.js';

const config = getConfig('notification', 3010);
const app = createService(config, '/api/notification', (app) => {
  app.use('/api/notification', routes);
});

app.listen(config.port, async () => {
  console.log(`[notification] service running on :${config.port}`);
  if (isPgConfigured()) console.log(`[notification] PostgreSQL ${await isPgAvailable() ? 'connected' : 'fallback JSON'} (${config.pg.host}:${config.pg.port}/${config.pg.database})`);
  else console.log('[notification] PostgreSQL not configured — JSON fallback');
  process.on('SIGTERM', async () => { try { await getPool()?.end(); } catch {} process.exit(0); });
});
