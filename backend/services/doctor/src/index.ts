import { getConfig, createService, isPgConfigured, isPgAvailable, getPool } from '@nutrivedha/shared';
import doctorRoutes from './routes.pg.js';

const config = getConfig('doctor', 3014);
const app = createService(config, '/api/doctor', (app) => {
  app.use('/api/doctor', doctorRoutes);
});

app.listen(config.port, async () => {
  console.log(`[doctor] service running on :${config.port}`);
  if (isPgConfigured()) {
    const ok = await isPgAvailable();
    console.log(`[doctor] PostgreSQL ${ok ? 'connected' : 'unreachable — falling back to JSON file'} (${config.pg.host}:${config.pg.port}/${config.pg.database})`);
  } else {
    console.log('[doctor] PostgreSQL not configured — using JSON-file fallback (set DATABASE_URL to enable)');
  }
  // graceful shutdown: close pg pool
  process.on('SIGTERM', async () => { try { await getPool()?.end(); } catch {} process.exit(0); });
});