import { getConfig, createService, isPgConfigured, isPgAvailable, getPool } from '@nutrivedha/shared';
import farmerRoutes from './routes.pg.js';

const config = getConfig('farmer', 3012);
const app = createService(config, '/api/farmer', (app) => {
  app.use('/api/farmer', farmerRoutes);
});

app.listen(config.port, async () => {
  console.log(`[farmer] service running on :${config.port}`);
  if (isPgConfigured()) console.log(`[farmer] PostgreSQL ${await isPgAvailable() ? 'connected' : 'fallback JSON'} (${config.pg.host}:${config.pg.port}/${config.pg.database})`);
  else console.log('[farmer] PostgreSQL not configured — JSON fallback');
  process.on('SIGTERM', async () => { try { await getPool()?.end(); } catch {} process.exit(0); });
});