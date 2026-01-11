
import React from 'react';
import { useForm } from 'react-hook-form';
import { Activity, Moon, Zap, Smile, CheckCircle2 } from 'lucide-react';
import { HealthLog } from '../types';

interface HealthMonitoringProps {
  onSaveLog: (log: Partial<HealthLog>) => void;
}

const HealthMonitoring: React.FC<HealthMonitoringProps> = ({ onSaveLog }) => {
  const { register, handleSubmit, reset } = useForm<Partial<HealthLog>>();

  const onSubmit = (data: any) => {
    onSaveLog({
      ...data,
      date: new Date().toISOString().split('T')[0],
      symptoms: data.symptoms?.split(',').map((s: string) => s.trim()).filter(Boolean) || []
    });
    reset();
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
          <Activity size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Daily Vital Check-in</h2>
          <p className="text-slate-500">Track your progress and help AI refine your diet</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mood Slider */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-700 font-bold">
              <Smile className="text-amber-500" size={20} />
              <span>How are you feeling mentally?</span>
            </div>
            <input 
              type="range" min="1" max="10" 
              {...register('mood')}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
            />
            <div className="flex justify-between text-xs text-slate-400 font-bold px-1">
              <span>DRAINED</span>
              <span>BLISSFUL</span>
            </div>
          </div>

          {/* Energy Slider */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-700 font-bold">
              <Zap className="text-yellow-500" size={20} />
              <span>Current Energy Levels</span>
            </div>
            <input 
              type="range" min="1" max="10" 
              {...register('energy')}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
            />
            <div className="flex justify-between text-xs text-slate-400 font-bold px-1">
              <span>EXHAUSTED</span>
              <span>VIBRANT</span>
            </div>
          </div>

          {/* Sleep Slider */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-700 font-bold">
              <Moon className="text-indigo-500" size={20} />
              <span>Sleep Quality (Last Night)</span>
            </div>
            <input 
              type="range" min="1" max="10" 
              {...register('sleepQuality')}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
            />
            <div className="flex justify-between text-xs text-slate-400 font-bold px-1">
              <span>RESTLESS</span>
              <span>DEEP REFRESH</span>
            </div>
          </div>

          {/* Compliance Slider */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-700 font-bold">
              <CheckCircle2 className="text-emerald-500" size={20} />
              <span>Diet Chart Compliance (%)</span>
            </div>
            <input 
              type="range" min="0" max="100" 
              {...register('dietCompliance')}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
            />
            <div className="flex justify-between text-xs text-slate-400 font-bold px-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-bold text-slate-700">Any symptoms today? (Separate with commas)</label>
          <input 
            type="text"
            {...register('symptoms')}
            placeholder="e.g. Acid reflux, Mild bloating, Joint pain"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <button 
          type="submit"
          className="w-full py-4 ayur-gradient text-white rounded-2xl font-bold shadow-xl hover:scale-[1.01] active:scale-95 transition-all"
        >
          Submit Daily Log
        </button>
      </form>
    </div>
  );
};

export default HealthMonitoring;
