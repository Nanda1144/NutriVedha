import { getConfig, createService, isPgConfigured, isPgAvailable, getPool } from '@nutrivedha/shared';
import authRoutes from './routes.pg.js';

const config = getConfig('auth', 3001);
const app = createService(config, '/api/auth', (app) => {
  app.use('/api/auth', authRoutes);
});

app.listen(config.port, async () => {
  console.log(`[auth] service running on :${config.port}`);
  if (isPgConfigured()) console.log(`[auth] PostgreSQL ${await isPgAvailable() ? 'connected' : 'fallback JSON'} (${config.pg.host}:${config.pg.port}/${config.pg.database})`);
  else console.log('[auth] PostgreSQL not configured — JSON fallback');
  process.on('SIGTERM', async () => { try { await getPool()?.end(); } catch {} process.exit(0); });
});
