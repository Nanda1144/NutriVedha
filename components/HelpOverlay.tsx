
import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Info, HelpCircle } from 'lucide-react';

interface HelpOverlayProps {
  onClose: () => void;
}

const steps = [
  {
    target: "Sutra Engine",
    description: "Your daily focus. Based on your unique dosha balance, we generate a biological mantra to guide your routine.",
    icon: <Info className="text-[#bf953f]" />
  },
  {
    target: "Daily Rituals",
    description: "Follow your precision schedule. Each task is timed to align with natural circadian rhythms and digestive fire.",
    icon: <HelpCircle className="text-emerald-500" />
  },
  {
    target: "AI Pathya Matrix",
    description: "The core of your journey. A 7-day diet plan formulated with clinical precision and market-aware ingredient choices.",
    icon: <HelpCircle className="text-[#134e4a]" />
  }
];

export const HelpOverlay: React.FC<HelpOverlayProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-500">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden relative border border-white/20 animate-in zoom-in-95">
        <button onClick={onClose} className="absolute top-8 right-8 p-2 text-slate-400 hover:text-rose-500 transition-colors">
          <X size={20} />
        </button>

        <div className="p-12 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-2xl">
              {steps[currentStep].icon}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Module {currentStep + 1} of {steps.length}</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white font-serif tracking-tight">{steps[currentStep].target}</h3>
            </div>
          </div>

          <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            {steps[currentStep].description}
          </p>

          <div className="flex gap-4 pt-6">
            <button 
              disabled={currentStep === 0}
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="flex-1 py-5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-3xl font-black uppercase tracking-widest disabled:opacity-30 transition-all flex items-center justify-center"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => {
                if (currentStep < steps.length - 1) setCurrentStep(prev => prev + 1);
                else onClose();
              }}
              className="flex-[3] py-5 bg-[#134e4a] dark:bg-[#bf953f] text-white rounded-3xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
            >
              {currentStep < steps.length - 1 ? 'Next Principle' : 'Finish Orientation'} <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="h-2 bg-slate-100 dark:bg-slate-800">
           <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} />
        </div>
      </div>
    </div>
  );
};
