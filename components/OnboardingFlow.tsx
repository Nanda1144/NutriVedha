
import React, { useState } from 'react';
import { Logo } from './Logo';
import { ArrowRight, Clock, Utensils, Heart, X, Wallet } from 'lucide-react';
import { OnboardingData } from '../types';

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
  userName: string;
  initialData?: OnboardingData;
  onCancel?: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, userName, initialData, onCancel }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(initialData || {
    healthGoal: '',
    dailyActivity: 'moderate',
    workingHours: '',
    currentDiet: '',
    physicalActivityLevel: '',
    sleepHours: 7,
    monthlyBudget: 5000
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const steps = [
    {
      title: "Health Goals",
      icon: <Heart className="text-rose-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-500 font-medium">What is your primary health focus?</p>
          <textarea
            value={data.healthGoal}
            onChange={(e) => setData({ ...data, healthGoal: e.target.value })}
            className="w-full p-6 rounded-3xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-[#134e4a] min-h-[120px] dark:text-white"
            placeholder="e.g. Weight loss, Stress reduction..."
          />
        </div>
      )
    },
    {
      title: "Energy & Budget",
      icon: <Wallet className="text-[#bf953f]" />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3 block">Monthly Food Budget (₹)</label>
            <input
              type="number"
              value={data.monthlyBudget}
              onChange={(e) => setData({ ...data, monthlyBudget: Number(e.target.value) })}
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-[#134e4a] dark:text-white"
              placeholder="e.g. 5000"
            />
          </div>
          <div>
            <label className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3 block">Working Hours</label>
            <input
              type="text"
              value={data.workingHours}
              onChange={(e) => setData({ ...data, workingHours: e.target.value })}
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-[#134e4a] dark:text-white"
              placeholder="9 AM - 6 PM"
            />
          </div>
        </div>
      )
    },
    {
      title: "Dietary Rituals",
      icon: <Utensils className="text-emerald-500" />,
      content: (
        <div className="space-y-6">
          <div>
            <label className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3 block">Current Eating Habits</label>
            <textarea
              value={data.currentDiet}
              onChange={(e) => setData({ ...data, currentDiet: e.target.value })}
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-[#134e4a] dark:text-white min-h-[80px]"
              placeholder="e.g. Late dinners, spicy food..."
            />
          </div>
          <div>
            <label className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3 block">Weekly Activity</label>
            <input
              type="text"
              value={data.physicalActivityLevel}
              onChange={(e) => setData({ ...data, physicalActivityLevel: e.target.value })}
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-[#134e4a] dark:text-white"
              placeholder="e.g. Yoga 3x week"
            />
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-full flex items-center justify-center p-2 sm:p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] sm:rounded-[3.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-8 sm:p-12 overflow-hidden relative">
        {onCancel && (
          <button onClick={onCancel} className="absolute top-8 right-8 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 z-20">
            <X size={20} />
          </button>
        )}
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
           <Logo size={200} hideText />
        </div>
        
        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-3xl">
              {steps[step-1].icon}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Step {step} of {steps.length}</p>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white font-serif">{steps[step-1].title}</h2>
            </div>
          </div>

          <div className="py-4">
            {steps[step-1].content}
          </div>

          <div className="flex gap-4 pt-4">
            {step > 1 && (
              <button onClick={prevStep} className="flex-1 py-5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-3xl font-black uppercase tracking-widest transition-all">Back</button>
            )}
            <button 
              onClick={step === steps.length ? () => onComplete(data) : nextStep}
              className="flex-[2] py-5 bg-[#134e4a] dark:bg-[#bf953f] text-white rounded-3xl font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2"
            >
              {step === steps.length ? 'Update Bio-Profile' : 'Continue'} <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
