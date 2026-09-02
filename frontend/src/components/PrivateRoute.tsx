import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { getAuthToken } from '../services/client';

interface PrivateRouteProps {
  children: React.ReactNode;
  roles?: Array<'User' | 'Doctor' | 'Trainer' | 'Farmer' | 'Delivery' | 'Admin'>;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, roles }) => {
  const { userProfile, isAdminAuthenticated } = useUserStore();
  const token = getAuthToken();
  const role = userProfile.role;

  // Check auth token exists - if gateway wiring is used, token proves backend session
  // Fallback: allow if role matches but warn that JWT missing (frontend-first mock)
  const hasToken = !!token;

  // Admin is separate flag (passkey)
  if (roles?.includes('Admin') && !isAdminAuthenticated && !hasToken) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0) {
    const allowed = roles.includes(role as any) || (roles.includes('Admin' as any) && isAdminAuthenticated);
    if (!allowed && !hasToken) {
      return <Navigate to="/login" replace />;
    }
    if (!allowed) {
      // Role mismatch - redirect to dashboard instead of showing forbidden
      return <Navigate to="/dashboard" replace />;
    }
  }

  // If no token but role matches, allow for mock dev (will wire to backend later)
  return <>{children}</>;
};

export default PrivateRoute;
