import React from 'react';
import { LayoutDashboard, HeartPulse, ScanSearch, Apple, Dumbbell, Stethoscope, ShoppingBag, Package, FileText, Bell, User } from 'lucide-react';
import { RoleLayout } from './RoleLayout';
import '../styles/user.css';
import './UserSidebar.css';

const NAV = [
  { label: 'Dashboard', path: '/user/dashboard', icon: LayoutDashboard },
  { label: 'My Health', path: '/user/health', icon: HeartPulse },
  { label: 'AI Scan', path: '/user/ai-scan', icon: ScanSearch },
  { label: 'Diet', path: '/user/diet', icon: Apple },
  { label: 'Fitness', path: '/user/fitness', icon: Dumbbell },
  { label: 'Doctors', path: '/user/doctors', icon: Stethoscope },
  { label: 'Marketplace', path: '/user/marketplace', icon: ShoppingBag },
  { label: 'Orders', path: '/user/orders', icon: Package },
  { label: 'Reports', path: '/user/reports', icon: FileText },
  { label: 'Notifications', path: '/user/notifications', icon: Bell },
  { label: 'Profile', path: '/user/profile', icon: User },
];

export const UserLayout: React.FC = () => {
  return <RoleLayout nav={NAV} theme="user" roleNote="Role: User" />;
};
