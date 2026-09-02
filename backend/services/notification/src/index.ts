import { getConfig, createService } from '@nutrivedha/shared';
import notifyRoutes from './routes.js';

const config = getConfig('notification', 3010);
const app = createService(config, '/api/notification', (app) => {
  app.use('/api/notification', notifyRoutes);
});

app.listen(config.port, () => {
  console.log(`[notification] service running on :${config.port}`);
});