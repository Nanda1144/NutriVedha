import type { Response } from 'express';

export function ok(res: Response, data: unknown, status = 200) {
  return res.status(status).json(data);
}

export function created(res: Response, data: unknown) {
  return res.status(201).json(data);
}

export function fail(res: Response, error: string, status = 400) {
  return res.status(status).json({ error });
}
