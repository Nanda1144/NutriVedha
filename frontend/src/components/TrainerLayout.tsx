import React from 'react';
import { LayoutDashboard, Users, UserPlus, Dumbbell, Flower2, Calendar, TrendingUp, MessageCircle, Wallet, User } from 'lucide-react';
import { RoleLayout } from './RoleLayout';
import '../styles/trainer.css';
import './TrainerSidebar.css';

const NAV = [
  { label: 'Dashboard', path: '/trainer/dashboard', icon: LayoutDashboard },
  { label: 'Members', path: '/trainer/members', icon: Users },
  { label: 'Join Requests', path: '/trainer/join-requests', icon: UserPlus },
  { label: 'Workout Plans', path: '/trainer/workout-plans', icon: Dumbbell },
  { label: 'Yoga', path: '/trainer/yoga', icon: Flower2 },
  { label: 'Sessions', path: '/trainer/sessions', icon: Calendar },
  { label: 'Progress', path: '/trainer/progress', icon: TrendingUp },
  { label: 'Messages', path: '/trainer/messages', icon: MessageCircle },
  { label: 'Earnings', path: '/trainer/earnings', icon: Wallet },
  { label: 'Profile', path: '/trainer/profile', icon: User },
];

export const TrainerLayout: React.FC = () => {
  return <RoleLayout nav={NAV} theme="trainer" roleNote="Role: Trainer • Fitness only" />;
};
