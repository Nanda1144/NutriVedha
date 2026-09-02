import { getConfig, createService, isPgConfigured, isPgAvailable, getPool } from '@nutrivedha/shared';
import routes from './routes.pg.js';

const config = getConfig('delivery', 3008);
const app = createService(config, '/api/delivery', (app) => {
  app.use('/api/delivery', routes);
});

app.listen(config.port, async () => {
  console.log(`[delivery] service running on :${config.port}`);
  if (isPgConfigured()) console.log(`[delivery] PostgreSQL ${await isPgAvailable() ? 'connected' : 'fallback JSON'} (${config.pg.host}:${config.pg.port}/${config.pg.database})`);
  else console.log('[delivery] PostgreSQL not configured — JSON fallback');
  process.on('SIGTERM', async () => { try { await getPool()?.end(); } catch {} process.exit(0); });
});
