import { getConfig, createService } from '@nutrivedha/shared';
import fitnessRoutes from './routes.js';

const config = getConfig('fitness', 3009);
const app = createService(config, '/api/fitness', (app) => {
  app.use('/api/fitness', fitnessRoutes);
});

app.listen(config.port, () => {
  console.log(`[fitness] service running on :${config.port}`);
});