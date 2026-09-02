import { getConfig, createService } from '@nutrivedha/shared';
import marketRoutes from './routes.js';

const config = getConfig('marketplace', 3007);
const app = createService(config, '/api/marketplace', (app) => {
  app.use('/api/marketplace', marketRoutes);
});

app.listen(config.port, () => {
  console.log(`[marketplace] service running on :${config.port}`);
});