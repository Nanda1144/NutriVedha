import React from 'react';
import { LayoutDashboard, Users, Stethoscope, Dumbbell, Sprout, Truck, Store, ShoppingBag, Cpu, BarChart3, ScrollText, Settings } from 'lucide-react';
import { RoleLayout } from './RoleLayout';
import '../styles/admin.css';
import './AdminSidebar.css';

const NAV = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Users', path: '/admin/users', icon: Users },
  { label: 'Doctors', path: '/admin/doctors', icon: Stethoscope },
  { label: 'Trainers', path: '/admin/trainers', icon: Dumbbell },
  { label: 'Farmers', path: '/admin/farmers', icon: Sprout },
  { label: 'Delivery', path: '/admin/delivery', icon: Truck },
  { label: 'Marketplace', path: '/admin/marketplace', icon: Store },
  { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
  { label: 'AI Monitoring', path: '/admin/ai-monitoring', icon: Cpu },
  { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
  { label: 'Audit Logs', path: '/admin/audit-logs', icon: ScrollText },
  { label: 'System', path: '/admin/system', icon: Settings },
];

export const AdminLayout: React.FC = () => {
  return <RoleLayout nav={NAV} theme="admin" roleNote="Role: Admin • Secrets never in FE" />;
};
