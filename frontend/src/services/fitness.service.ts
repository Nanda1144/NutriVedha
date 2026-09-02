/**
 * FITNESS SERVICE API — port 3009 · gateway path /fitness
 * Workouts, focus streaks and analytics.
 */
import type { Workout } from '../types';
import { apiGet, apiPost } from './client';

export function fetchWorkouts(): Promise<{ workouts: Workout[] }> {
  return apiGet('/fitness/workouts');
}

export function fetchWorkout(id: string): Promise<{ workout: Workout }> {
  return apiGet(`/fitness/workouts/${id}`);
}

export function logWorkout(input: { workoutId: string; year: number; week: number; day: string; duration: number; calories: number }): Promise<{ entry: unknown }> {
  return apiPost('/fitness/log', input);
}

export function fetchLog(year: number, week: number): Promise<{ logs: unknown[]; focus: number; done: number; scheduled: number; streak: number }> {
  return apiGet(`/fitness/log?year=${year}&week=${week}`);
}

export function fetchFitnessAnalytics(): Promise<{ totalCalories: number; totalMinutes: number; workoutsDone: number; activeDays: number }> {
  return apiGet('/fitness/analytics');
}

export function clearFitnessLog(): Promise<{ message: string }> {
  return apiPost('/fitness/log/clear', {});
}