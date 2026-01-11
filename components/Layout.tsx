
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Utensils, Sparkles, Stethoscope, Activity,
  FileBarChart, Video, LogOut, Home, Calendar, ShieldCheck, Menu, X, Bell, Settings, Moon, Sun, User as UserIcon, Edit2, Wifi, WifiOff, HelpCircle
} from 'lucide-react';
import { Role } from '../types';
import { Logo } from './Logo';

interface LayoutProps {
  children: React.ReactNode;
  role: Role;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout?: () => void;
  onEditProfile?: () => void;
  onShowHelp?: () => void;
  userName?: string;
  syncStatus?: 'synced' | 'syncing' | 'error';
  logoUrl?: string | null;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, role, isDarkMode, onToggleDarkMode, onLogout, onEditProfile, onShowHelp, userName, syncStatus = 'synced', logoUrl = null
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans transition-colors duration-300">
      {/* Help FAB */}
      <button 
        onClick={onShowHelp}
        className="fixed bottom-24 right-6 z-[100] w-14 h-14 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center text-[#134e4a] dark:text-[#bf953f] shadow-2xl hover:scale-110 transition-all group"
      >
        <HelpCircle size={28} />
        <span className="absolute right-16 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">How to Use</span>
      </button>

      <div 
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
        onClick={toggleMenu}
      />
      
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-[70] w-72 bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl lg:shadow-none sidebar-transition transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="p-8 flex justify-between items-center">
          <Logo size={45} logoUrl={logoUrl} />
          <button onClick={toggleMenu} className="lg:hidden p-2 text-slate-400 hover:text-[#134e4a] dark:hover:text-[#bf953f]">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-6 space-y-2 overflow-y-auto pt-4">
          {role === 'Admin' ? (
            <>
              <NavItem to="/" icon={<Settings size={20} />} label="Admin Panel" onClick={() => setIsMenuOpen(false)} />
              <NavItem to="/patients" icon={<Users size={20} />} label="System Registry" onClick={() => setIsMenuOpen(false)} />
              <NavItem to="/foods" icon={<Utensils size={20} />} label="Pharmacopeia" onClick={() => setIsMenuOpen(false)} />
            </>
          ) : role === 'Doctor' ? (
            <>
              <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Command Center" onClick={() => setIsMenuOpen(false)} />
              <NavItem to="/patients" icon={<Users size={20} />} label="Patient Registry" onClick={() => setIsMenuOpen(false)} />
              <NavItem to="/telehealth" icon={<Video size={20} />} label="Consultation" onClick={() => setIsMenuOpen(false)} />
              <NavItem to="/diet-generator" icon={<Sparkles size={20} />} label="AI Diet Gen" onClick={() => setIsMenuOpen(false)} />
            </>
          ) : (
            <>
              <NavItem to="/" icon={<Home size={20} />} label="Sanctuary" onClick={() => setIsMenuOpen(false)} />
              <NavItem to="/monitoring" icon={<Activity size={20} />} label="Daily Ritual" onClick={() => setIsMenuOpen(false)} />
              <NavItem to="/telehealth" icon={<Video size={20} />} label="Call Vaidya" onClick={() => setIsMenuOpen(false)} />
              <NavItem to="/reports" icon={<FileBarChart size={20} />} label="Health Reports" onClick={() => setIsMenuOpen(false)} />
            </>
          )}
        </nav>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
          {/* Persistent Connectivity Indicator */}
          <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all duration-500 ${
            !isOnline ? 'bg-rose-50 border-rose-200 text-rose-600' :
            syncStatus === 'syncing' ? 'bg-amber-50 border-amber-200 text-amber-600' :
            'bg-emerald-50 border-emerald-200 text-emerald-600'
          }`}>
            {!isOnline ? <WifiOff size={14} /> : syncStatus === 'syncing' ? <ShieldCheck className="animate-pulse" size={14} /> : <Wifi size={14} />}
            <span className="text-[10px] font-black uppercase tracking-[0.1em]">
              {!isOnline ? 'Offline Mode' : syncStatus === 'syncing' ? 'Securing Vault...' : 'Bio-State Secured'}
            </span>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={onToggleDarkMode}
              className="flex-1 p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-brand-gold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 text-xs font-bold"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button 
              onClick={onLogout}
              className="p-3 bg-rose-500/10 text-rose-600 rounded-2xl hover:bg-rose-500/20 transition-all border border-rose-500/20 flex items-center justify-center"
            >
              <LogOut size={18} />
            </button>
          </div>

          <div className="flex items-center gap-4 px-5 py-4 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shadow-lg ${
              role === 'Admin' ? 'bg-slate-900 text-[#bf953f]' : 'bg-[#134e4a] text-white'
            }`}>
              {(userName || role).charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black truncate text-slate-800 dark:text-slate-100">{userName || 'User'}</p>
              <p className="text-[9px] uppercase font-bold opacity-40">{role}</p>
            </div>
            {onEditProfile && (
              <button onClick={onEditProfile} className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-full text-emerald-600">
                <Edit2 size={14} />
              </button>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 lg:h-20 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40">
           <div className="flex items-center gap-3">
              <button onClick={toggleMenu} className="p-2 -ml-2 text-slate-500 lg:hidden">
                <Menu size={24} />
              </button>
              <Logo size={35} logoUrl={logoUrl} />
           </div>
           <div className="hidden sm:block">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Precision Ayurvedic Intelligence Engine</span>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 main-content">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ to, icon, label, onClick }: any) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) => 
      `flex items-center gap-4 px-6 py-4 rounded-[1.5rem] transition-all duration-300 ${
        isActive 
          ? 'bg-[#134e4a] dark:bg-brand-gold text-white shadow-xl translate-x-1' 
          : 'text-slate-500 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-[#134e4a]'
      }`
    }
  >
    {icon}
    <span className="text-sm font-bold tracking-tight">{label}</span>
  </NavLink>
);

export default Layout;
