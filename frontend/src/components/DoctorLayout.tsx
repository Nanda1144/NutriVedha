import React from 'react';
import { LayoutDashboard, Users, Calendar, FileScan, UtensilsCrossed, Video, Clock, MessageCircle, User } from 'lucide-react';
import { RoleLayout } from './RoleLayout';
import '../styles/doctor.css';
import './DoctorSidebar.css';

const NAV = [
  { label: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
  { label: 'Patients', path: '/doctor/patients', icon: Users },
  { label: 'Appointments', path: '/doctor/appointments', icon: Calendar },
  { label: 'AI Reports', path: '/doctor/ai-reports', icon: FileScan },
  { label: 'Diet Reviews', path: '/doctor/diet-reviews', icon: UtensilsCrossed },
  { label: 'Telemedicine', path: '/doctor/telemedicine', icon: Video },
  { label: 'Availability', path: '/doctor/availability', icon: Clock },
  { label: 'Messages', path: '/doctor/messages', icon: MessageCircle },
  { label: 'Profile', path: '/doctor/profile', icon: User },
];

export const DoctorLayout: React.FC = () => {
  return <RoleLayout nav={NAV} theme="doctor" roleNote="Role: Doctor • Encrypted" />;
};
