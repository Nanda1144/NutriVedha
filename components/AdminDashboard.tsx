
import React, { useState, useEffect } from 'react';
import { Users, UserPlus, ShieldAlert, Activity, Award, Briefcase, Image as ImageIcon, Save, Check, Loader2, PlayCircle } from 'lucide-react';
import { Patient, Doctor } from '../types';
import { MOCK_DOCTORS } from '../constants';
import { apiService } from '../services/apiService';

interface AdminDashboardProps {
  patients: Patient[];
  onConfigUpdate?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ patients, onConfigUpdate }) => {
  const doctors: Doctor[] = MOCK_DOCTORS;
  const [logoUrl, setLogoUrl] = useState('');
  const [demoVideoUrl, setDemoVideoUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    apiService.getConfig().then(cfg => {
      if (cfg.logoUrl) setLogoUrl(cfg.logoUrl);
      if (cfg.demoVideoUrl) setDemoVideoUrl(cfg.demoVideoUrl);
    });
  }, []);

  const handleSaveBranding = async () => {
    setIsSaving(true);
    const result = await apiService.updateConfig({ logoUrl, demoVideoUrl });
    setIsSaving(false);
    if (result) {
      setIsSaved(true);
      if (onConfigUpdate) onConfigUpdate();
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white font-serif">System Administrator Panel</h2>
          <p className="text-slate-500 font-medium">Enterprise Health Infrastructure Management</p>
        </div>
        <div className="px-5 py-2.5 bg-slate-900 text-emerald-400 rounded-2xl text-xs font-black uppercase tracking-widest border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
          Root Access Active
        </div>
      </div>

      {/* Global Branding Management */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden relative group">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
           <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/30 text-[#bf953f] rounded-2xl flex items-center justify-center">
                <ImageIcon size={28} />
              </div>
              <div>
                 <h3 className="text-xl font-bold dark:text-white">Global Branding</h3>
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Update visual identity across all modules</p>
              </div>
           </div>
           <button 
             onClick={handleSaveBranding}
             disabled={isSaving}
             className={`px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 ${
               isSaved ? 'bg-emerald-500 text-white' : 'bg-[#134e4a] text-white shadow-xl hover:scale-105'
             }`}
           >
             {isSaving ? <Loader2 size={18} className="animate-spin" /> : isSaved ? <Check size={18} /> : <Save size={18} />}
             {isSaving ? 'UPDATING...' : isSaved ? 'BRANDING UPDATED' : 'SAVE BRANDING'}
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2">
                <ImageIcon size={14} /> Website Logo URL (PNG/SVG/BASE64)
              </label>
              <div className="relative">
                 <input 
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="w-full pl-6 pr-20 py-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-4 focus:ring-[#bf953f]/10 dark:text-white font-medium shadow-inner"
                 />
                 <div className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 flex items-center justify-center overflow-hidden">
                    {logoUrl ? <img src={logoUrl} alt="Preview" className="max-w-full max-h-full" /> : <ImageIcon size={20} className="text-slate-200" />}
                 </div>
              </div>
           </div>

           <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2">
                <PlayCircle size={14} /> Watch Demo Video URL (Embed Link)
              </label>
              <div className="relative">
                 <input 
                    value={demoVideoUrl}
                    onChange={(e) => setDemoVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/embed/..."
                    className="w-full pl-6 pr-10 py-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-4 focus:ring-[#bf953f]/10 dark:text-white font-medium shadow-inner"
                 />
              </div>
              <p className="text-[9px] text-slate-400 italic ml-4">Use 'Embed' URLs for direct viewing within the platform.</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/30 text-blue-600 rounded-3xl flex items-center justify-center">
            <Users size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Users</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{patients.length + doctors.length + 120}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-3xl flex items-center justify-center">
            <Award size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Doctors</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{doctors.length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-6">
          <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/30 text-rose-600 rounded-3xl flex items-center justify-center">
            <ShieldAlert size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Security Health</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">100%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
