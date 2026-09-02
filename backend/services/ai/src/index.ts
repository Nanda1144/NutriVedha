import { getConfig, createService, isPgConfigured, isPgAvailable, getPool } from '@nutrivedha/shared';
import aiRoutes from './routes.pg.js';

const config = getConfig('ai', 3003);
const app = createService(config, '/api/ai', (app) => {
  app.use('/api/ai', aiRoutes);
});

app.listen(config.port, async () => {
  console.log(`[ai] service running on :${config.port}`);
  if (isPgConfigured()) console.log(`[ai] PostgreSQL ${await isPgAvailable() ? 'connected (ai_requests logged)' : 'fallback — ai_requests not logged'} (${config.pg.host}:${config.pg.port}/${config.pg.database})`);
  else console.log('[ai] PostgreSQL not configured — ai_requests not logged');
  process.on('SIGTERM', async () => { try { await getPool()?.end(); } catch {} process.exit(0); });
});