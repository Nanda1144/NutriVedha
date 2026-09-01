import type { Request, Response } from 'express';
import { getConfig, signToken } from '@nutrivedha/shared';

export type Role = 'User' | 'Doctor' | 'Trainer' | 'Farmer' | 'Delivery' | 'Admin';

export interface UserRecord {
  id: string;
  email: string;
  phone?: string;
  passwordHash?: string;
  name: string;
  role: Role;
  createdAt: string;
  isAdmin: boolean;
}

const config = getConfig('auth', 3001);

export const ROLE_MAP: Role[] = ['User', 'Doctor', 'Trainer', 'Farmer', 'Delivery', 'Admin'];

export function issueToken(user: UserRecord) {
  return signToken(
    { userId: user.id, email: user.email, role: user.role },
    config.jwtSecret,
    config.jwtExpiry
  );
}

export function publicUser(user: UserRecord) {
  return { id: user.id, email: user.email, name: user.name, role: user.role, isAdmin: user.isAdmin };
}
