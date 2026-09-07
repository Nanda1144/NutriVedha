import React from 'react';
import { LayoutDashboard, Package, Truck, MapPinned, History, Wallet, User } from 'lucide-react';
import { RoleLayout } from './RoleLayout';
import '../styles/delivery.css';
import './DeliverySidebar.css';

const NAV = [
  { label: 'Dashboard', path: '/delivery/dashboard', icon: LayoutDashboard },
  { label: "Today's Deliveries", path: '/delivery/today', icon: Package },
  { label: 'Active Delivery', path: '/delivery/active', icon: Truck },
  { label: 'Route', path: '/delivery/route', icon: MapPinned },
  { label: 'History', path: '/delivery/history', icon: History },
  { label: 'Earnings', path: '/delivery/earnings', icon: Wallet },
  { label: 'Profile', path: '/delivery/profile', icon: User },
];

export const DeliveryLayout: React.FC = () => {
  return <RoleLayout nav={NAV} theme="delivery" roleNote="Role: Delivery • Logistics only" />;
};
