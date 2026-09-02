import { getConfig, createService } from '@nutrivedha/shared';
import authRoutes from './routes.js';

const config = getConfig('auth', 3001);
const app = createService(config, '/api/auth', (app) => {
  app.use('/api/auth', authRoutes);
});

app.listen(config.port, () => {
  console.log(`[auth] service running on :${config.port}`);
});
