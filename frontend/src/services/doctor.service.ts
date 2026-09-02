/**
 * DOCTOR SERVICE API — port 3014 · gateway path /doctor
 * Practitioner profiles, verification and patient records.
 */
import type { User } from '../types';
import { apiGet, apiPost } from './client';

export interface DoctorProfileDoc {
  id: string;
  userId: string;
  name: string;
  specialization: string;
  regNumber: string;
  verified: boolean;
  patients: number;
  experience: string;
}

export function fetchDoctorProfile(): Promise<{ profile: DoctorProfileDoc }> {
  return apiGet('/doctor/profile');
}

export function registerDoctor(input: { name: string; specialization?: string; regNumber: string; experience?: string }): Promise<{ profile: DoctorProfileDoc; message: string }> {
  return apiPost('/doctor/profile', input);
}

export function verifyDoctor(id: string): Promise<{ profile: DoctorProfileDoc }> {
  return apiPost(`/doctor/verify/${id}`, {});
}

export function fetchPatients(): Promise<{ patients: { id: string; name: string; lastVisit: string; notes: string }[] }> {
  return apiGet('/doctor/patients');
}

export function updatePatientNotes(id: string, notes: string): Promise<{ patient: unknown }> {
  return apiPost(`/doctor/patients/${id}/notes`, { notes });
}

export function fetchVerificationQueue(): Promise<{ queue: unknown[] }> {
  return apiGet('/doctor/verification-queue');
}

export type DoctorRoleUser = User;