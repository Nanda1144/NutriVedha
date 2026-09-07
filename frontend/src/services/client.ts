/**
 * Generic fetch client for the NutriVedha API Gateway.
 *
 * Base URL comes from VITE_API_BASE_URL (fallback: http://localhost:8080/api).
 * All service modules in src/services use this client.
 */

export const API_BASE: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8080/api';

const TOKEN_KEY = 'nv_token';

// Access token in controlled client memory (per spec 13) — not localStorage persistent for refresh
// We keep localStorage as fallback for page reload before refresh cookie flow is fully adopted
let memoryToken: string | null = null;

export function setAuthToken(token: string | null): void {
  memoryToken = token;
  // For backward compat, also mirror to localStorage but refresh token NEVER goes here
  if (token) {
    try { localStorage.setItem(TOKEN_KEY, token); } catch {}
  } else {
    try { localStorage.removeItem(TOKEN_KEY); } catch {}
  }
}

export function getAuthToken(): string | null {
  if (memoryToken) return memoryToken;
  try {
    const ls = localStorage.getItem(TOKEN_KEY);
    if (ls) memoryToken = ls;
    return ls;
  } catch { return memoryToken; }
}

export function clearAuthToken(): void {
  memoryToken = null;
  try { localStorage.removeItem(TOKEN_KEY); } catch {}
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  const token = getAuthToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers, credentials: 'include' as RequestCredentials });

  if (!res.ok) {
    let message = res.statusText || `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      /* non-JSON error body — keep statusText */
    }
    throw new Error(message);
  }

  return (await res.json()) as T;
}

export const apiGet = <T>(path: string): Promise<T> => request<T>(path);

export const apiPost = <T>(path: string, body: unknown): Promise<T> =>
  request<T>(path, { method: 'POST', body: JSON.stringify(body) });

export const apiPut = <T>(path: string, body: unknown): Promise<T> =>
  request<T>(path, { method: 'PUT', body: JSON.stringify(body) });

export const apiPatch = <T>(path: string, body: unknown): Promise<T> =>
  request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });

export const apiDelete = <T>(path: string): Promise<T> => request<T>(path, { method: 'DELETE' });