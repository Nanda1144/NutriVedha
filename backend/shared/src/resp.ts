import type { Response } from 'express';

export function ok(res: Response, data: unknown, status = 200) {
  // Standardized per spec 46: {success:true, message, data} + legacy top-level for compat
  if (data && typeof data === 'object' && !Array.isArray(data) && 'success' in (data as any)) {
    return res.status(status).json(data);
  }
  const d = data as any;
  const message = d?.message || 'OK';
  // Preserve legacy top-level fields for existing frontend, add standardized wrapper
  return res.status(status).json({ success: true, message, data: d, ...(d && typeof d === 'object' ? d : { data: d }) });
}

export function created(res: Response, data: unknown) {
  if (data && typeof data === 'object' && 'success' in (data as any)) {
    return res.status(201).json(data);
  }
  const d = data as any;
  const message = d?.message || 'Created';
  return res.status(201).json({ success: true, message, data: d, ...(d && typeof d === 'object' ? d : { data: d }) });
}

function codeForStatus(status: number, message: string): string {
  if (status === 400) return 'VALIDATION_ERROR';
  if (status === 401) {
    if (/invalid email or password/i.test(message)) return 'INVALID_CREDENTIALS';
    if (/invalid.*token/i.test(message)) return 'INVALID_TOKEN';
    return 'UNAUTHENTICATED';
  }
  if (status === 403) {
    if (/pending/i.test(message)) return 'PENDING_VERIFICATION';
    if (/suspended/i.test(message)) return 'ACCOUNT_SUSPENDED';
    return 'FORBIDDEN';
  }
  if (status === 404) return 'NOT_FOUND';
  if (status === 409) return 'CONFLICT';
  if (status === 429) return 'RATE_LIMITED';
  return 'ERROR';
}

export function fail(res: Response, error: string, status = 400) {
  const code = codeForStatus(status, error);
  // New format per spec 29, keep legacy `error` string for backward compat
  return res.status(status).json({ success: false, error: { code, message: error }, message: error, code });
}

export function unauthorized(res: Response, message = 'Invalid email or password') {
  return fail(res, message, 401);
}
