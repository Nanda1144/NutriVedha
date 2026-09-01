import { getConfig, createService } from '@nutrivedha/shared';
import aiRoutes from './routes.js';

const config = getConfig('ai', 3003);
const app = createService(config, '/api/ai', (app) => {
  app.use('/api/ai', aiRoutes);
});

app.listen(config.port, () => {
  console.log(`[ai] service running on :${config.port}`);
});