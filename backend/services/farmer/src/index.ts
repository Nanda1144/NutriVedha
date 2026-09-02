import { getConfig, createService } from '@nutrivedha/shared';
import farmerRoutes from './routes.js';

const config = getConfig('farmer', 3012);
const app = createService(config, '/api/farmer', (app) => {
  app.use('/api/farmer', farmerRoutes);
});

app.listen(config.port, () => {
  console.log(`[farmer] service running on :${config.port}`);
});