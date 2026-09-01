import { getConfig, createService } from '@nutrivedha/shared';
import teleRoutes from './routes.js';

const config = getConfig('telemedicine', 3006);
const app = createService(config, '/api/telemedicine', (app) => {
  app.use('/api/telemedicine', teleRoutes);
});

app.listen(config.port, () => {
  console.log(`[telemedicine] service running on :${config.port}`);
});