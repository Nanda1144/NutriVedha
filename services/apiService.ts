
import { Patient, HealthLog, OnboardingData, DietPlanResponse } from '../types';

/**
 * NUTRIVEDHA API SERVICE (Database Bridge)
 */

const BASE_URL = 'http://localhost:5000/api'; 
const SYNC_QUEUE_KEY = 'nutrivedha_sync_queue';

export const apiService = {
  // Global Config Management
  getConfig: async () => {
    try {
      const res = await fetch(`${BASE_URL}/config`);
      return await res.json();
    } catch (e) {
      return { logoUrl: null };
    }
  },

  updateConfig: async (config: any) => {
    try {
      const res = await fetch(`${BASE_URL}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  getQueue: (): any[] => {
    const queue = localStorage.getItem(SYNC_QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  },

  addToQueue: (data: any) => {
    const queue = apiService.getQueue();
    queue.push({ ...data, timestamp: Date.now() });
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  },

  clearQueue: () => {
    localStorage.removeItem(SYNC_QUEUE_KEY);
  },

  getPatientData: async (userId: string): Promise<Patient | null> => {
    try {
      if (!navigator.onLine) throw new Error("Offline");
      const response = await fetch(`${BASE_URL}/patient/${userId}`);
      if (response.status === 404) return null;
      if (!response.ok) throw new Error("Retrieval failed");
      const data = await response.json();
      localStorage.setItem(`nutrivedha_patient_${userId}`, JSON.stringify(data));
      return data;
    } catch (error) {
      const saved = localStorage.getItem(`nutrivedha_patient_${userId}`);
      return saved ? JSON.parse(saved) : null;
    }
  },

  syncPatientData: async (patient: Patient): Promise<boolean> => {
    localStorage.setItem(`nutrivedha_patient_${patient.userId}`, JSON.stringify(patient));
    if (!navigator.onLine) {
      apiService.addToQueue(patient);
      return false; 
    }
    try {
      const response = await fetch(`${BASE_URL}/patient/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patient)
      });
      return response.ok;
    } catch (error) {
      apiService.addToQueue(patient);
      return false;
    }
  },

  processSyncQueue: async () => {
    const queue = apiService.getQueue();
    if (queue.length === 0 || !navigator.onLine) return;
    const latestState = queue[queue.length - 1];
    try {
      const response = await fetch(`${BASE_URL}/patient/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(latestState)
      });
      if (response.ok) apiService.clearQueue();
    } catch (e) {}
  }
};
