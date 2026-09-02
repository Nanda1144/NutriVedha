/**
 * TRAINER SERVICE API — port 3015 · gateway path /trainer
 * Trainee management, sessions, compliance tracking.
 */
import { apiGet, apiPost } from './client';

export interface TraineeDoc {
  id: string;
  userId: string;
  trainerId: string;
  name: string;
  goal: string;
  compliance: number;
  status: 'In Progress' | 'Completed';
  progress: number;
  lastActive: string;
}

export interface TrainerSessionDoc {
  id: string;
  trainerId: string;
  time: string;
  title: string;
  type: string;
}

export function fetchTrainees(): Promise<{ trainees: TraineeDoc[] }> {
  return apiGet('/trainer/trainees');
}

export function addTrainee(input: { name: string; goal: string; compliance?: number }): Promise<{ trainee: TraineeDoc }> {
  return apiPost('/trainer/trainees', input);
}

export function fetchSessions(): Promise<{ sessions: TrainerSessionDoc[] }> {
  return apiGet('/trainer/sessions');
}

export function addSession(input: { time?: string; title: string; type?: string }): Promise<{ session: TrainerSessionDoc }> {
  return apiPost('/trainer/sessions', input);
}
