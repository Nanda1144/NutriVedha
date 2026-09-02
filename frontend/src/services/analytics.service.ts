/**
 * ANALYTICS SERVICE API — port 3011 · gateway path /analytics
 * Audit logs, activity events and admin overview metrics.
 */
import type { ActivityEvent, AuditLog } from '../types';
import { apiGet, apiPost } from './client';

export function fetchAuditLogs(): Promise<{ logs: AuditLog[] }> {
  return apiGet('/analytics/audit');
}

export function logEvent(event: string): Promise<{ event: ActivityEvent }> {
  return apiPost('/analytics/activity', { event });
}

export function fetchActivity(limit?: number): Promise<{ events: ActivityEvent[]; summary: Record<string, number> }> {
  const q = limit ? `?limit=${limit}` : '';
  return apiGet(`/analytics/activity${q}`);
}

export function fetchAdminOverview(): Promise<{ totalUsers: number; events: number; auditEntries: number }> {
  return apiGet('/analytics/admin/overview');
}