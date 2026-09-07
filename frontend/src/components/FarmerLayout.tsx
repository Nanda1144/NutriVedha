import React from 'react';
import { LayoutDashboard, Sprout, ShoppingBag, Package, Wheat, Boxes, Wallet, BarChart3, User } from 'lucide-react';
import { RoleLayout } from './RoleLayout';
import '../styles/farmer.css';
import './FarmerSidebar.css';

const NAV = [
  { label: 'Dashboard', path: '/farmer/dashboard', icon: LayoutDashboard },
  { label: 'Crops', path: '/farmer/crops', icon: Sprout },
  { label: 'Pre-bookings', path: '/farmer/pre-bookings', icon: ShoppingBag },
  { label: 'Orders', path: '/farmer/orders', icon: Package },
  { label: 'Harvest', path: '/farmer/harvest', icon: Wheat },
  { label: 'Inventory', path: '/farmer/inventory', icon: Boxes },
  { label: 'Earnings', path: '/farmer/earnings', icon: Wallet },
  { label: 'Reports', path: '/farmer/reports', icon: BarChart3 },
  { label: 'Profile', path: '/farmer/profile', icon: User },
];

export const FarmerLayout: React.FC = () => {
  return <RoleLayout nav={NAV} theme="farmer" roleNote="Role: Farmer • Marketplace linked" />;
};
