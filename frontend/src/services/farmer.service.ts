/**
 * FARMER SERVICE API — port 3012 · gateway path /farmer
 * Livestock, crop inventory and earnings tracking.
 */
import type { Earning, InventoryItem, Livestock } from '../types';
import { apiGet, apiPatch, apiPost, apiPut } from './client';

export function fetchLivestock(): Promise<{ livestock: Livestock[] }> {
  return apiGet('/farmer/livestock');
}

export function addLivestock(input: { name: string; type: string; breed?: string; age?: string }): Promise<{ animal: Livestock }> {
  return apiPost('/farmer/livestock', input);
}

export function updateLivestock(id: string, patch: Partial<Livestock>): Promise<{ animal: Livestock }> {
  return apiPut(`/farmer/livestock/${id}`, patch);
}

export function fetchInventory(): Promise<{ inventory: InventoryItem[] }> {
  return apiGet('/farmer/inventory');
}

export function addInventoryItem(input: { name: string; stock: number; unit: string; price: number }): Promise<{ item: InventoryItem }> {
  return apiPost('/farmer/inventory', input);
}

export function updateInventoryItem(id: string, patch: Partial<InventoryItem>): Promise<{ item: InventoryItem }> {
  return apiPatch(`/farmer/inventory/${id}`, patch);
}

export function fetchEarnings(): Promise<{ earnings: Earning[]; total: number }> {
  return apiGet('/farmer/earnings');
}

export function addEarning(input: { month: string; amount: number; source?: string }): Promise<{ earning: Earning }> {
  return apiPost('/farmer/earnings', input);
}