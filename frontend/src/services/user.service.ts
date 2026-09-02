/**
 * USER SERVICE API — port 3002 · gateway path /users
 * Profiles, RBAC, security settings, data export & delete.
 */
import type { User } from '../types';
import { apiGet, apiPost, apiPut, apiDelete } from './client';

export function fetchProfile(): Promise<{ user: User }> {
  return apiGet('/users/me');
}

export function updateProfile(patch: Partial<User>): Promise<{ user: User }> {
  return apiPut('/users/me', patch);
}

export function fetchAuditLogs(): Promise<{ logs: unknown[] }> {
  return apiGet('/users/audit');
}

export function exportData(): Promise<{ url?: string; data?: unknown; message?: string }> {
  return apiPost('/users/export', {});
}

export function deleteAccount(): Promise<{ message: string; graceDays?: number }> {
  return apiDelete('/users/me');
}

export function changePasskey(passkey: string): Promise<{ message: string }> {
  return apiPost('/users/passkey', { passkey });
}