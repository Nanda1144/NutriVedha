import { createProxyMiddleware } from 'http-proxy-middleware';
import { getConfig, createService } from '@nutrivedha/shared';

const gateway = getConfig('gateway', 8080);

const routes: Record<string, number> = {
  auth: 3001,
  user: 3002,
  ai: 3003,
  medical: 3005,
  telemedicine: 3006,
  marketplace: 3007,
  delivery: 3008,
  fitness: 3009,
  notification: 3010,
  analytics: 3011,
  farmer: 3012,
  doctor: 3014,
  trainer: 3015,
};
// Alias: frontend .env uses plural /api/doctors, normalize to singular microservice
const aliasRoutes: Record<string, string> = {
  doctors: 'doctor',
};

const app = createService(gateway, '/api', (app) => {
  app.get('/api/health', (_req, res) => res.json({ status: 'ok', gateway: 'up' }));

  for (const [name, port] of Object.entries(routes)) {
    const proxy = createProxyMiddleware({
      target: `http://localhost:${port}`,
      changeOrigin: true,
      pathFilter: `/api/${name}`,
    });
    app.use(proxy);
  }
  // alias proxies (e.g. /api/doctors -> doctor:3014)
  for (const [alias, targetName] of Object.entries(aliasRoutes)) {
    const port = routes[targetName];
    if (!port) continue;
    const proxy = createProxyMiddleware({
      target: `http://localhost:${port}`,
      changeOrigin: true,
      pathFilter: `/api/${alias}`,
      pathRewrite: { [`^/api/${alias}`]: `/api/${targetName}` },
    });
    app.use(proxy);
  }

  app.use('/api', (_req, res) => res.status(404).json({ error: 'No route matched' }));
});

app.listen(gateway.port, () => {
  console.log(`[gateway] running on :${gateway.port}`);
  for (const [name, port] of Object.entries(routes)) console.log(`  /api/${name} -> http://localhost:${port}`);
});