/**
 * MEDICAL SERVICE API — port 3005 · gateway path /medical
 * Encrypted health reports & clinical records.
 */
import type { HealthReport } from '../types';
import { apiDelete, apiGet, apiPost } from './client';

export function fetchReports(): Promise<{ reports: HealthReport[] }> {
  return apiGet('/medical/reports');
}

export function fetchReport(id: string): Promise<{ report: HealthReport }> {
  return apiGet(`/medical/reports/${id}`);
}

export function uploadReport(payload: { condition: string; symptoms: string[]; severity: HealthReport['severity'] }): Promise<{ report: HealthReport }> {
  return apiPost('/medical/reports', payload);
}

export function deleteReport(id: string): Promise<{ message: string }> {
  return apiDelete(`/medical/reports/${id}`);
}