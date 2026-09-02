import { getConfig, createService, isPgConfigured, isPgAvailable, getPool } from '@nutrivedha/shared';
import marketRoutes from './routes.pg.js';

const config = getConfig('marketplace', 3007);
const app = createService(config, '/api/marketplace', (app) => {
  app.use('/api/marketplace', marketRoutes);
});

app.listen(config.port, async () => {
  console.log(`[marketplace] service running on :${config.port}`);
  if (isPgConfigured()) console.log(`[marketplace] PostgreSQL ${await isPgAvailable() ? 'connected' : 'fallback JSON'} (${config.pg.host}:${config.pg.port}/${config.pg.database})`);
  else console.log('[marketplace] PostgreSQL not configured — JSON fallback');
  process.on('SIGTERM', async () => { try { await getPool()?.end(); } catch {} process.exit(0); });
});