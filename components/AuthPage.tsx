
import React, { useState } from 'react';
import { Logo } from './Logo';
import { Mail, Lock, User, ShieldCheck, ArrowRight, ArrowLeft, UserCheck, Stethoscope } from 'lucide-react';
import { Role } from '../types';

interface AuthPageProps {
  onLogin: (role: Role) => void;
  onGuestMode: () => void;
  onBack: () => void;
  logoUrl?: string | null;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onGuestMode, onBack, logoUrl = null }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<Role>('Patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In this prototype, we just pass the selected role to trigger the login state in App
    onLogin(role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 relative overflow-hidden transition-colors duration-300">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-100/50 dark:bg-emerald-950/20 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-100/50 dark:bg-emerald-950/20 rounded-full blur-3xl -z-10 translate-y-1/2 -translate-x-1/2"></div>

      <div className="w-full max-w-xl bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-[3.5rem] shadow-2xl border border-white dark:border-slate-800 relative z-10 animate-in zoom-in-95">
        <button onClick={onBack} className="absolute top-10 left-10 text-slate-400 hover:text-emerald-600 transition-colors flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest">
           <ArrowLeft size={16} /> Home
        </button>
        
        <div className="text-center mb-10 mt-6">
          <Logo className="justify-center mb-6" size={60} logoUrl={logoUrl} />
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 font-serif">{isLogin ? 'Welcome Back' : 'Create Sanctuary'}</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Please enter your credentials to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection */}
          <div className="flex gap-4 p-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setRole('Patient')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                role === 'Patient' ? 'bg-[#134e4a] text-white shadow-lg' : 'text-slate-400'
              }`}
            >
              <User size={16} /> Patient
            </button>
            <button
              type="button"
              onClick={() => setRole('Doctor')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                role === 'Doctor' ? 'bg-[#134e4a] text-white shadow-lg' : 'text-slate-400'
              }`}
            >
              <Stethoscope size={16} /> Doctor
            </button>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-4 focus:ring-[#134e4a]/10 dark:text-white font-medium transition-all shadow-inner"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-4 focus:ring-[#134e4a]/10 dark:text-white font-medium transition-all shadow-inner"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-5 bg-[#134e4a] text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mt-4"
          >
            {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={20} className="text-[#bf953f]" />
          </button>
        </form>

        <div className="mt-10 flex flex-col items-center gap-6">
          <div className="flex items-center gap-4 w-full">
            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Or Secure Exploration</span>
            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
          </div>
          
          <button
            onClick={onGuestMode}
            className="w-full py-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
          >
            <UserCheck size={18} /> Enter as Guest
          </button>

          <p className="text-sm font-medium text-slate-500">
            {isLogin ? "Don't have a sanctuary yet?" : "Already part of NutriVedha?"}{' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[#134e4a] dark:text-[#bf953f] font-black hover:underline underline-offset-4"
            >
              {isLogin ? 'Create Account' : 'Sign In'}
            </button>
          </p>
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-[#bf953f] opacity-50">
          <ShieldCheck size={14} />
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">Bio-Metric Data Encrypted</span>
        </div>
      </div>
    </div>
  );
};
