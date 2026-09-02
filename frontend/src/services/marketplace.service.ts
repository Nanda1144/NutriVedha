/**
 * MARKETPLACE SERVICE API — port 3007 · gateway path /marketplace
 * Farm-to-home crops, pre-bookings and simulated payments.
 */
import type { Crop, CropBooking } from '../types';
import { apiGet, apiPost } from './client';

export interface PrebookResult {
  booking: CropBooking;
  savings: number;
}

export function fetchCrops(): Promise<{ crops: Crop[] }> {
  return apiGet('/marketplace/crops');
}

export function fetchCrop(id: string): Promise<{ crop: Crop }> {
  return apiGet(`/marketplace/crops/${id}`);
}

export function fetchFarmers(cropId: string): Promise<{ farmer: Crop['farmer'] }> {
  return apiGet(`/marketplace/crops/${cropId}/farmers`);
}

export function prebookCrop(cropId: string, quantity: number): Promise<PrebookResult> {
  return apiPost('/marketplace/prebook', { cropId, quantity });
}

export function fetchBookings(): Promise<{ bookings: (CropBooking & { crop?: Crop | null })[] }> {
  return apiGet('/marketplace/bookings');
}