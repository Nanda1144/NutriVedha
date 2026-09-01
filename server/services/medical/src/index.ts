import { getConfig, createService } from '@nutrivedha/shared';
import medicalRoutes from './routes.js';

const config = getConfig('medical', 3005);
const app = createService(config, '/api/medical', (app) => {
  app.use('/api/medical', medicalRoutes);
});

app.listen(config.port, () => {
  console.log(`[medical] service running on :${config.port}`);
});