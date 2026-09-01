import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import type { Request, Response, NextFunction } from 'express';
import type { ServiceConfig } from './config.js';

/**
 * Creates a hardened Express app for a microservice.
 * Each service exposes optional routers under /api/<service>.
 */
export function createService(config: ServiceConfig, mountPrefix: string, register: (app: express.Express) => void) {
  const app = express();
  const trustProxy = config.env === 'production' ? 1 : false;

  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin, credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use(
    rateLimit({
      windowMs: parseInt(process.env.VITE_RATE_LIMIT_WINDOW_MS || '900000', 10),
      max: parseInt(process.env.VITE_RATE_LIMIT_MAX_REQUESTS || '100', 10),
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  // Health check for orchestrators/load balancers
  app.get('/health', (_req, res) => {
    res.json({ service: config.name, status: 'ok', uptime: process.uptime() });
  });

  register(app);

  // 404
  app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

  // Error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(`[${config.name}]`, err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
