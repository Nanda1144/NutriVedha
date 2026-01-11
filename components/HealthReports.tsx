
import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, BarChart, Bar, Cell, Legend
} from 'recharts';
import { 
  TrendingUp, FileText, Sparkles, Activity, CheckCircle, 
  AlertCircle, ArrowUpRight, ArrowDownRight, Target, Brain,
  Calendar, Download, Share2
} from 'lucide-react';
import { Patient, HealthReport } from '../types';
import { generateHealthTrendsReport } from '../services/geminiService';

interface HealthReportsProps {
  patient: Patient;
}

const HealthReports: React.FC<HealthReportsProps> = ({ patient }) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<HealthReport | null>(null);

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const res = await generateHealthTrendsReport(patient);
      setReport(res);
    } catch (err) {
      console.error(err);
      alert('Failed to generate clinical trend report. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Process chart data from patient logs
  const chartData = patient.logs.map(l => ({
    date: l.date.split('-').slice(1).reverse().join('/'),
    mood: Number(l.mood),
    energy: Number(l.energy),
    sleep: Number(l.sleepQuality),
    compliance: Number(l.dietCompliance),
    symptomsCount: l.symptoms.length
  })).slice(-10); // Last 10 records for clarity

  const latestStats = chartData[chartData.length - 1] || { mood: 0, energy: 0, sleep: 0, compliance: 0 };
  
  const avgCompliance = patient.logs.length > 0 
    ? (patient.logs.reduce((acc, l) => acc + Number(l.dietCompliance), 0) / patient.logs.length).toFixed(0)
    : '0';

  const radarData = [
    { subject: 'Sattva (Mood)', A: latestStats.mood, fullMark: 10 },
    { subject: 'Prana (Energy)', A: latestStats.energy, fullMark: 10 },
    { subject: 'Nidra (Sleep)', A: latestStats.sleep, fullMark: 10 },
    { subject: 'Pathya (Diet)', A: latestStats.compliance / 10, fullMark: 10 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white font-serif">Bio-Trend Intelligence</h2>
          <p className="text-slate-500 font-medium font-sans">Multi-dimensional wellness analysis for {patient.name}</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={handleGenerateReport}
            disabled={loading}
            className="flex-1 sm:flex-none px-8 py-4 bg-[#134e4a] dark:bg-[#bf953f] text-white rounded-[1.5rem] font-black flex items-center justify-center gap-3 shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white animate-spin rounded-full" />
            ) : (
              <Sparkles size={18} className="text-[#bf953f] dark:text-white" />
            )}
            {loading ? 'ANALYZING...' : 'RUN AI TREND REPORT'}
          </button>
        </div>
      </div>

      {/* Analytics Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Vitality Trends Area Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3 font-serif">
              <Activity className="text-emerald-500" size={24} />
              Vitality Overlay
            </h3>
            <div className="flex items-center gap-4">
               <LegendItem color="#10b981" label="Prana (Energy)" />
               <LegendItem color="#bf953f" label="Sattva (Mood)" dashed />
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#bf953f" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#bf953f" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:opacity-5" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 10]} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', fontWeight: 800, background: '#fff', padding: '20px'}}
                />
                <Area type="monotone" dataKey="energy" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorEnergy)" name="Energy" />
                <Area type="monotone" dataKey="mood" stroke="#bf953f" strokeWidth={3} fillOpacity={1} fill="url(#colorMood)" strokeDasharray="5 5" name="Mood" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pathya Compliance Bar Chart */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3 mb-10 font-serif">
            <CheckCircle className="text-[#bf953f]" size={24} />
            Diet Compliance
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:opacity-5" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 100]} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 700, background: '#fff'}}
                  cursor={{fill: '#f8fafc'}}
                />
                <Bar dataKey="compliance" fill="#134e4a" radius={[8, 8, 8, 8]} barSize={24} name="Compliance %">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.compliance > 80 ? '#10b981' : entry.compliance > 50 ? '#bf953f' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between items-center mt-6">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Average Streak</p>
            <p className="text-xl font-black text-[#134e4a] dark:text-[#bf953f]">{avgCompliance}%</p>
          </div>
        </div>
      </div>

      {/* AI Generated Report Section */}
      {report && (
        <div className="animate-in slide-in-from-bottom-12 duration-1000">
          <div className="bg-white dark:bg-[#0f172a] p-12 lg:p-16 rounded-[4rem] shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-16 opacity-[0.03] text-[#bf953f] pointer-events-none">
              <FileText size={350} />
            </div>
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-center gap-10 mb-16 border-b border-slate-50 dark:border-slate-800 pb-12">
                <div className="w-28 h-28 bg-[#134e4a] dark:bg-[#bf953f] text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-[#134e4a]/20">
                  <Brain size={56} />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-5xl font-black font-serif text-slate-900 dark:text-white mb-4 leading-tight">Biometric Trend Report</h3>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-5">
                    <ReportBadge icon={<Calendar size={14} />} label={`Period: ${report.period}`} />
                    <ReportBadge icon={<Target size={14} />} label={`Alignment: ${report.ayurvedicAlignment}`} color="gold" />
                    <ReportBadge icon={<Activity size={14} />} label="Data Verified" color="emerald" />
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-32 h-32 rounded-full border-8 border-slate-50 dark:border-slate-800 flex items-center justify-center relative shadow-inner">
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                      <circle cx="50%" cy="50%" r="44%" stroke="#10b981" strokeWidth="8" fill="transparent" strokeDasharray="264" strokeDashoffset={264 - (264 * report.progressScore) / 100} strokeLinecap="round" />
                    </svg>
                    <span className="text-4xl font-black text-[#134e4a] dark:text-brand-gold">{report.progressScore}%</span>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vitality Index</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                <div className="space-y-12">
                  <section>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-2xl">
                        <TrendingUp size={24} />
                      </div>
                      <h4 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-widest font-serif">Areas of Progress</h4>
                    </div>
                    <div className="p-10 bg-slate-50 dark:bg-slate-800/40 rounded-[3rem] border border-slate-100 dark:border-slate-800 relative shadow-inner">
                      <p className="text-lg font-bold text-slate-700 dark:text-slate-200 leading-relaxed italic">
                        "{report.summary}"
                      </p>
                      <div className="mt-8 flex items-center gap-3 text-emerald-600 font-black text-xs uppercase tracking-widest">
                        <ArrowUpRight size={18} /> Trend: Improving Stability
                      </div>
                    </div>
                  </section>

                  <div className="bg-slate-900 dark:bg-slate-800 rounded-[3rem] p-10 text-white flex justify-between items-center shadow-xl">
                    <div>
                      <h5 className="text-2xl font-black font-serif mb-2">Clinical Vault</h5>
                      <p className="text-xs font-bold text-slate-400">Official biometric summary for medical records</p>
                    </div>
                    <div className="flex gap-4">
                      <button className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all" title="Download Report">
                        <Download size={24} />
                      </button>
                      <button className="p-4 bg-[#bf953f] hover:bg-[#d4af37] rounded-2xl transition-all" title="Share with Vaidya">
                        <Share2 size={24} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-12">
                  <section>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 bg-[#bf953f]/10 text-[#bf953f] rounded-2xl">
                        <AlertCircle size={24} />
                      </div>
                      <h4 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-widest font-serif">Improvement Protocol</h4>
                    </div>
                    <div className="space-y-6">
                      {report.recommendations.map((rec, i) => (
                        <div key={i} className="flex gap-8 p-8 rounded-[2.5rem] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 group hover:shadow-2xl transition-all hover:-translate-y-1">
                          <div className="flex-shrink-0 w-14 h-14 rounded-3xl bg-slate-50 dark:bg-slate-900 text-[#134e4a] dark:text-brand-gold flex items-center justify-center font-black text-xl shadow-inner group-hover:bg-[#134e4a] group-hover:text-white transition-colors">
                            {i+1}
                          </div>
                          <div className="pt-1.5">
                            <p className="text-base font-bold text-slate-800 dark:text-slate-100 leading-relaxed">{rec}</p>
                            <div className="mt-3 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                               <Sparkles size={12} className="text-[#bf953f]" /> AI Prioritized Task
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const LegendItem = ({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) => (
  <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
    <div className={`w-6 h-1 rounded-full ${dashed ? 'border-t-2 border-dashed' : ''}`} style={{ backgroundColor: dashed ? 'transparent' : color, borderColor: color }} />
    {label}
  </div>
);

const ReportBadge = ({ icon, label, color }: { icon: React.ReactNode; label: string; color?: 'gold' | 'emerald' }) => (
  <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border ${
    color === 'gold' ? 'bg-[#bf953f]/10 text-[#bf953f] border-[#bf953f]/20' : 
    color === 'emerald' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
    'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-100 dark:border-slate-700'
  }`}>
    {icon} {label}
  </span>
);

export default HealthReports;
