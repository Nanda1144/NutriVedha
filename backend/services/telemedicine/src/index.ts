import { getConfig, createService, isPgConfigured, isPgAvailable, getPool } from '@nutrivedha/shared';
import routes from './routes.pg.js';

const config = getConfig('telemedicine', 3006);
const app = createService(config, '/api/telemedicine', (app) => {
  app.use('/api/telemedicine', routes);
});

app.listen(config.port, async () => {
  console.log(`[telemedicine] service running on :${config.port}`);
  if (isPgConfigured()) console.log(`[telemedicine] PostgreSQL ${await isPgAvailable() ? 'connected' : 'fallback JSON'} (${config.pg.host}:${config.pg.port}/${config.pg.database})`);
  else console.log('[telemedicine] PostgreSQL not configured — JSON fallback');
  process.on('SIGTERM', async () => { try { await getPool()?.end(); } catch {} process.exit(0); });
});
