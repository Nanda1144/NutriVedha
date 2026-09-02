import { getConfig, createService } from '@nutrivedha/shared';
import doctorRoutes from './routes.js';

const config = getConfig('doctor', 3014);
const app = createService(config, '/api/doctor', (app) => {
  app.use('/api/doctor', doctorRoutes);
});

app.listen(config.port, () => {
  console.log(`[doctor] service running on :${config.port}`);
});