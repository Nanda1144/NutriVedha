import { getConfig, createService } from '@nutrivedha/shared';
import deliveryRoutes from './routes.js';

const config = getConfig('delivery', 3008);
const app = createService(config, '/api/delivery', (app) => {
  app.use('/api/delivery', deliveryRoutes);
});

app.listen(config.port, () => {
  console.log(`[delivery] service running on :${config.port}`);
});