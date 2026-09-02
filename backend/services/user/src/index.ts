import { getConfig, createService, isPgConfigured, isPgAvailable, getPool } from '@nutrivedha/shared';
import userRoutes from './routes.pg.js';

const config = getConfig('user', 3002);
const app = createService(config, '/api/user', (app) => {
  app.use('/api/user', userRoutes);
});

app.listen(config.port, async () => {
  console.log(`[user] service running on :${config.port}`);
  if (isPgConfigured()) console.log(`[user] PostgreSQL ${await isPgAvailable() ? 'connected' : 'fallback JSON'} (${config.pg.host}:${config.pg.port}/${config.pg.database})`);
  else console.log('[user] PostgreSQL not configured — JSON fallback');
  process.on('SIGTERM', async () => { try { await getPool()?.end(); } catch {} process.exit(0); });
});