import type { CanonicalRole } from './auth.js';

export type Resource =
  | 'own_profile'
  | 'user_health'
  | 'ai_scan'
  | 'diet'
  | 'doctors'
  | 'patients'
  | 'trainer_members'
  | 'crops'
  | 'deliveries'
  | 'marketplace'
  | 'admin'
  | 'audit_logs';

export type Access = 'OWN' | 'AUTHORIZED' | 'OWN_MEMBERS' | 'OWN_PRODUCTS' | 'ASSIGNED' | 'MANAGE' | 'CONTROLLED' | 'MONITORING' | 'BROWSE' | boolean;

export const RBAC_MATRIX: Record<Resource, Record<CanonicalRole, Access>> = {
  own_profile: { USER: true, DOCTOR: true, TRAINER: true, FARMER: true, DELIVERY: true, ADMIN: true },
  user_health: { USER: 'OWN', DOCTOR: 'AUTHORIZED', TRAINER: false, FARMER: false, DELIVERY: false, ADMIN: 'CONTROLLED' },
  ai_scan: { USER: true, DOCTOR: 'AUTHORIZED', TRAINER: false, FARMER: false, DELIVERY: false, ADMIN: 'MONITORING' },
  diet: { USER: true, DOCTOR: 'AUTHORIZED', TRAINER: false, FARMER: false, DELIVERY: false, ADMIN: 'MONITORING' },
  doctors: { USER: 'BROWSE', DOCTOR: 'OWN', TRAINER: false, FARMER: false, DELIVERY: false, ADMIN: 'MANAGE' },
  patients: { USER: false, DOCTOR: 'OWN', TRAINER: false, FARMER: false, DELIVERY: false, ADMIN: 'CONTROLLED' },
  trainer_members: { USER: false, DOCTOR: false, TRAINER: 'OWN_MEMBERS', FARMER: false, DELIVERY: false, ADMIN: 'CONTROLLED' },
  crops: { USER: 'BROWSE', DOCTOR: false, TRAINER: false, FARMER: 'OWN_PRODUCTS', DELIVERY: false, ADMIN: 'MANAGE' },
  deliveries: { USER: 'OWN', DOCTOR: false, TRAINER: false, FARMER: 'OWN', DELIVERY: 'ASSIGNED', ADMIN: 'MANAGE' },
  marketplace: { USER: 'BROWSE', DOCTOR: 'AUTHORIZED', TRAINER: false, FARMER: 'OWN_PRODUCTS', DELIVERY: 'ASSIGNED', ADMIN: 'MANAGE' },
  admin: { USER: false, DOCTOR: false, TRAINER: false, FARMER: false, DELIVERY: false, ADMIN: true },
  audit_logs: { USER: false, DOCTOR: false, TRAINER: false, FARMER: false, DELIVERY: false, ADMIN: true },
};

export function can(role: CanonicalRole, resource: Resource): boolean {
  const v = RBAC_MATRIX[resource]?.[role];
  return v === true || (typeof v === 'string' && v !== 'false' as any);
}
