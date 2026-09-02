import { getConfig, createService } from '@nutrivedha/shared';
import analyticsRoutes from './routes.js';

const config = getConfig('analytics', 3011);
const app = createService(config, '/api/analytics', (app) => {
  app.use('/api/analytics', analyticsRoutes);
});

app.listen(config.port, () => {
  console.log(`[analytics] service running on :${config.port}`);
});