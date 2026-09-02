/**
 * AUTH SERVICE API — port 3001 · gateway path /auth
 * Registration, login, OTP, passkey admin, RBAC.
 */
import type { AuthResponse, RegisterInput, User } from '../types';
import { apiGet, apiPost } from './client';

export function register(input: RegisterInput): Promise<AuthResponse> {
  return apiPost<AuthResponse>('/auth/register', input);
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return apiPost<AuthResponse>('/auth/login', { email, password });
}

export function requestOtp(phone: string): Promise<{ otp?: string; message: string }> {
  return apiPost('/auth/otp/request', { phone });
}

export function verifyOtp(phone: string, otp: string, name?: string): Promise<AuthResponse> {
  return apiPost<AuthResponse>('/auth/otp/verify', { phone, otp, name });
}

export function loginWithPasskey(passkey: string): Promise<AuthResponse> {
  return apiPost<AuthResponse>('/auth/passkey', { passkey });
}

export function fetchMe(): Promise<{ user: User }> {
  return apiGet('/auth/me');
}

export function fetchRoles(): Promise<{ roles: string[] }> {
  return apiGet('/auth/roles');
}