import bcrypt from 'bcryptjs';

// Centralized password hashing — single source, never duplicated across controllers
// Uses bcryptjs with cost 12 (secure, ~250ms). If Argon2id is later adopted, change here once.
const BCRYPT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// Strength check: at least 8 chars, letters + numbers, no plain common patterns
export function isStrongPassword(pw: string): boolean {
  if (pw.length < 8) return false;
  if (!/[A-Za-z]/.test(pw)) return false;
  if (!/\d/.test(pw)) return false;
  // Reject trivially weak
  if (/^(password|12345678|qwerty)/i.test(pw)) return false;
  return true;
}
