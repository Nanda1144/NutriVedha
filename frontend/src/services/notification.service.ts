/**
 * NOTIFICATION SERVICE API — port 3010 · gateway path /notification
 * In-app push/email alerts and admin broadcasts.
 */
import type { Notification } from '../types';
import { apiGet, apiPost } from './client';

export function fetchNotifications(): Promise<{ notifications: Notification[]; unread: number }> {
  return apiGet('/notification');
}

export function sendNotification(input: { title: string; message: string; type?: Notification['type']; channel?: Notification['channel'] }): Promise<{ notification: Notification }> {
  return apiPost('/notification/send', input);
}

export function broadcastNotification(input: { title: string; message: string; type?: Notification['type'] }): Promise<{ broadcast: number }> {
  return apiPost('/notification/broadcast', input);
}

export function markRead(id: string): Promise<{ notification: Notification }> {
  return apiPost(`/notification/${id}/read`, {});
}

export function clearNotifications(): Promise<{ message: string }> {
  return apiPost('/notification/clear', {});
}