export type Role = 'USER' | 'DOCTOR' | 'TRAINER' | 'FARMER' | 'DELIVERY' | 'ADMIN';
export const canAccess = (role: Role, area: string): boolean => {
  const matrix: Record<string, Record<Role, boolean>> = {
    own_profile: { USER: true, DOCTOR: true, TRAINER: true, FARMER: true, DELIVERY: true, ADMIN: true },
    admin: { USER: false, DOCTOR: false, TRAINER: false, FARMER: false, DELIVERY: false, ADMIN: true },
  };
  return matrix[area]?.[role] ?? false;
};
export const redirectForRole = (role: Role): string => {
  switch (role) {
    case 'USER': return '/user/dashboard';
    case 'DOCTOR': return '/doctor/dashboard';
    case 'TRAINER': return '/trainer/dashboard';
    case 'FARMER': return '/farmer/dashboard';
    case 'DELIVERY': return '/delivery/dashboard';
    case 'ADMIN': return '/admin/dashboard';
    default: return '/';
  }
};
