/**
 * TELEMEDICINE SERVICE API — port 3006 · gateway path /telemedicine
 * Doctors directory and appointment booking.
 */
import type { Appointment, DoctorProfile } from '../types';
import { apiGet, apiPost } from './client';

export function fetchDoctors(): Promise<{ doctors: DoctorProfile[] }> {
  return apiGet('/telemedicine/doctors');
}

export function bookAppointment(input: {
  doctorId: string;
  date: string;
  time: string;
  mode: 'video' | 'chat';
}): Promise<{ appointment: Appointment }> {
  return apiPost('/telemedicine/appointments', input);
}

export function fetchAppointments(): Promise<{ appointments: Appointment[] }> {
  return apiGet('/telemedicine/appointments');
}

export function cancelAppointment(id: string): Promise<{ message: string }> {
  return apiPost(`/telemedicine/appointments/${id}/cancel`, {});
}