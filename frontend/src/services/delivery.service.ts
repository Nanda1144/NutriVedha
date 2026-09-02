/**
 * DELIVERY SERVICE API — port 3008 · gateway path /delivery
 * Order queue and live GPS tracking.
 */
import type { DeliveryOrder, TrackingPoint } from '../types';
import { apiGet, apiPost, apiPut } from './client';

export function fetchOrders(): Promise<{ orders: DeliveryOrder[] }> {
  return apiGet('/delivery/orders');
}

export function createOrder(input: Partial<DeliveryOrder>): Promise<{ order: DeliveryOrder }> {
  return apiPost('/delivery/orders', input);
}

export function updateOrderStatus(id: string, status: DeliveryOrder['status']): Promise<{ order: DeliveryOrder }> {
  return apiPut(`/delivery/orders/${id}/status`, { status });
}

export function recordTrackingPoint(input: { orderId: string; lat: number; lng: number; note?: string }): Promise<{ point: TrackingPoint }> {
  return apiPost('/delivery/track', input);
}

export function fetchTrack(orderId: string): Promise<{ points: TrackingPoint[] }> {
  return apiGet(`/delivery/track/${orderId}`);
}