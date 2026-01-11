
import React, { useEffect, useState } from 'react';
import { Sparkles, Sun, Moon, Wind, Flame, CheckCircle2, AlertTriangle, PlayCircle, Activity, Heart, Zap, DollarSign } from 'lucide-react';
import { Patient, PredictiveAlert } from '../types';
import { generatePredictiveAlert, generateDailySutra } from '../services/geminiService';

interface PatientDashboardProps {
  patient: Patient;
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ patient }) => {
  const [prediction, setPrediction] = useState<PredictiveAlert | null>(null);
  const [sutra, setSutra] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [realtimePulse, setRealtimePulse] = useState(72);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const [pred, s] = await Promise.all([
          generatePredictiveAlert(patient),
          generateDailySutra(patient)
        ]);
        setPrediction(pred);
        setSutra(s);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();

    const interval = setInterval(() => {
      setRealtimePulse(prev => prev + (Math.random() > 0.5 ? 1 : -1));
    }, 3000);
    return () => clearInterval(interval);
  }, [patient]);

  const progress = 75; 

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-1000">
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        <div className="flex-1 bg-white dark:bg-[#1e293b]/20 p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden transition-colors duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-[#bf953f] dark:opacity-[0.05]">
            <Sparkles size={160} />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight text-[#134e4a] dark:text-white font-serif">Namaste, {patient.name}</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium italic">Your <span className="text-[#bf953f] font-bold">{patient.dosha.join('/')}</span> balance journey continues.</p>
            
            <div className="bg-emerald-50 dark:bg-emerald-950/20 p-6 sm:p-8 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-900/30 italic text-[#134e4a] dark:text-emerald-50 relative group transition-all hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30">
               <span className="absolute -top-3 left-6 sm:left-8 bg-[#bf953f] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-[#bf953f]/20">Daily Sutra</span>
               <p className="text-lg sm:text-xl font-medium leading-relaxed font-serif">
                "{sutra || 'Arjun, let your fire be a light that guides, not a heat that consumes; for in the coolness of patience, the sharpest mind finds its true power.'}"
               </p>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-96 flex flex-col gap-6">
          <div className="flex-1 bg-[#134e4a] dark:bg-[#064e3b] text-white p-8 rounded-[2.5rem] shadow-2xl flex items-center justify-between border-b-8 border-b-[#bf953f]">
             <div className="relative w-24 h-24">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="50%" cy="50%" r="42%" stroke="white" strokeWidth="8" fill="transparent" opacity="0.1" />
                  <circle cx="50%" cy="50%" r="42%" stroke="#bf953f" strokeWidth="10" fill="transparent" strokeDasharray="264" strokeDashoffset={264 - (264 * progress) / 100} strokeLinecap="round" className="transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-black text-2xl text-white">
                  {progress}%
                </div>
             </div>
             <div className="text-right">
               <div className="flex items-center gap-1 justify-end text-[#bf953f] mb-1">
                  <DollarSign size={14} />
                  <span className="text-[10px] font-black uppercase">Economic Plan</span>
               </div>
               <p className="font-black text-lg text-white">Goal Progress</p>
               <p className="text-[9px] text-white mt-1 uppercase tracking-widest font-black opacity-60">Today's Rituals</p>
             </div>
          </div>

          <div className="flex-1 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-2xl flex items-center justify-center shadow-inner">
                 <Heart className="animate-pulse" size={24} />
               </div>
               <div>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Real-time Pulse</p>
                 <p className="text-2xl font-black text-slate-800 dark:text-white">{realtimePulse} <span className="text-xs font-medium text-slate-400">bpm</span></p>
               </div>
             </div>
             <div className="flex flex-col items-end">
                <div className="flex gap-1">
                   {[1,2,3,4,5].map(i => <div key={i} className={`w-1 h-3 rounded-full ${i < 4 ? 'bg-[#bf953f]' : 'bg-slate-100 dark:bg-slate-800'}`} />)}
                </div>
                <p className="text-[9px] font-black text-[#bf953f] uppercase mt-2">Sama (Stable)</p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8 pb-10">
        <div className="xl:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl sm:text-2xl font-black flex items-center gap-3 text-[#134e4a] dark:text-white font-serif">
              <div className="p-2 bg-[#f5e6c8] dark:bg-[#bf953f]/20 text-[#bf953f] rounded-xl shadow-sm">
                <Sun size={24} />
              </div>
              Precision Pathya (Routine)
            </h3>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">Live Schedule</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RoutineCard time="06:30 AM" task="Ushapan (Warm Water)" icon={<Wind />} done={true} />
            <RoutineCard time="08:00 AM" task="Brahmi Breakfast" icon={<Sparkles />} done={true} />
            <RoutineCard time="01:00 PM" task="Main Meal (Pittahara)" icon={<Flame />} done={false} />
            <RoutineCard time="09:00 PM" task="Triphala & Rest" icon={<Moon />} done={false} />
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl sm:text-2xl font-black flex items-center gap-3 text-[#134e4a] dark:text-white font-serif">
            <div className="p-2 bg-[#134e4a]/10 dark:bg-brand-gold/20 text-[#134e4a] rounded-xl">
              <Zap size={24} className="text-[#bf953f]" />
            </div>
            Bio-Tracker
          </h3>
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm group hover:shadow-xl transition-all duration-500 border-t-4 border-t-[#bf953f]">
            {loading ? (
              <div className="flex flex-col items-center py-10">
                <div className="w-12 h-12 border-4 border-[#134e4a] dark:border-brand-gold border-t-transparent rounded-full animate-spin mb-6" />
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest animate-pulse">Syncing Lifestyle Data...</p>
              </div>
            ) : prediction ? (
              <div className="space-y-5">
                <div className={`flex items-center gap-3 font-black text-xs uppercase tracking-widest ${
                  prediction.severity === 'high' ? 'text-rose-500' : 'text-[#134e4a] dark:text-[#bf953f]'
                }`}>
                  <div className={`p-2 rounded-lg ${prediction.severity === 'high' ? 'bg-rose-50' : 'bg-emerald-50 dark:bg-emerald-950/40 text-[#bf953f]'}`}>
                    {prediction.severity === 'high' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                  </div>
                  {prediction.title}
                </div>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{prediction.description}</p>
                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] text-xs text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800 leading-loose">
                  <span className="font-black block mb-2 text-[#134e4a] dark:text-[#bf953f] uppercase tracking-widest">Health Forecast</span>
                  {prediction.imbalanceForecast}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 px-4">
                 <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                   <Activity size={32} />
                 </div>
                 <p className="text-slate-400 text-sm font-medium italic">Monitor vitals for precision tracking.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const RoutineCard = ({ time, task, icon, done }: any) => (
  <div className={`p-6 rounded-[2rem] border transition-all duration-500 cursor-pointer ${done ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg hover:-translate-y-1'}`}>
    <div className="flex items-center gap-5">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${done ? 'bg-[#134e4a] dark:bg-emerald-800 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{time}</p>
        <p className={`font-black text-sm sm:text-base ${done ? 'text-[#134e4a] dark:text-emerald-500 line-through opacity-40' : 'text-slate-800 dark:text-slate-100'}`}>{task}</p>
      </div>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${done ? 'bg-emerald-100 dark:bg-emerald-900/50 text-[#bf953f]' : 'bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600'}`}>
        {done ? <CheckCircle2 size={18} /> : <PlayCircle size={18} />}
      </div>
    </div>
  </div>
);

export default PatientDashboard;
