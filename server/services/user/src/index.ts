import { getConfig, createService } from '@nutrivedha/shared';
import userRoutes from './routes.js';

const config = getConfig('user', 3002);
const app = createService(config, '/api/user', (app) => {
  app.use('/api/user', userRoutes);
});

app.listen(config.port, () => {
  console.log(`[user] service running on :${config.port}`);
});