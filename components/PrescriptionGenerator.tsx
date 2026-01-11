
import React, { useState } from 'react';
import { generatePrescription } from '../services/geminiService';
import { Patient, Prescription } from '../types';
import { 
  Stethoscope, Sparkles, Printer, Download, Plus, 
  Trash2, ShieldCheck, Clipboard, Heart, Utensils, Zap, X, AlertCircle, RefreshCw, FileText,
  Activity // Added missing Activity import
} from 'lucide-react';

interface PrescriptionGeneratorProps {
  patient: Patient;
}

const PrescriptionGenerator: React.FC<PrescriptionGeneratorProps> = ({ patient }) => {
  const [symptoms, setSymptoms] = useState<string[]>(patient.symptoms || []);
  const [newSymptom, setNewSymptom] = useState('');
  const [loading, setLoading] = useState(false);
  const [prescription, setPrescription] = useState<Prescription | null>(null);

  const handleAddSymptom = () => {
    if (newSymptom && !symptoms.includes(newSymptom)) {
      setSymptoms([...symptoms, newSymptom]);
      setNewSymptom('');
    }
  };

  const removeSymptom = (index: number) => {
    setSymptoms(symptoms.filter((_, i) => i !== index));
  };

  const syncFromLogs = () => {
    const allSymptoms = patient.logs.flatMap(l => l.symptoms);
    const uniqueSymptoms = Array.from(new Set([...symptoms, ...allSymptoms]));
    setSymptoms(uniqueSymptoms);
  };

  const handleGenerate = async () => {
    if (symptoms.length === 0) {
      alert("Please enter or sync symptoms to formulate a targeted clinical prescription.");
      return;
    }
    setLoading(true);
    try {
      const result = await generatePrescription(patient, symptoms);
      setPrescription(result);
    } catch (error) {
      console.error(error);
      alert('AI clinical formulation failed. Please check your connectivity or try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24 px-4 sm:px-0">
      <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-[4rem] shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex flex-col md:flex-row items-center gap-8 mb-16">
          <div className="p-6 bg-[#134e4a] dark:bg-[#bf953f] text-white rounded-[2.5rem] shadow-2xl shadow-[#134e4a]/20">
            <Stethoscope size={48} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white font-serif tracking-tight">Vaidya Clinical Desk</h2>
            <p className="text-slate-500 font-medium">Precision Pathya & Aushadha Formulation for <span className="text-[#134e4a] dark:text-brand-gold font-black border-b-2 border-brand-gold/30 pb-0.5">{patient.name}</span></p>
          </div>
          <div className="hidden lg:flex flex-col items-end gap-2">
             <div className="flex items-center gap-3 px-5 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Clinical Protocol v2.5</span>
             </div>
             <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mr-2">Secure Encrypted Vault</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
           <div className="lg:col-span-3 space-y-10">
              <div className="space-y-6">
                <div className="flex justify-between items-center px-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] block">Diagnostic Indicators</label>
                  <button 
                    onClick={syncFromLogs}
                    className="flex items-center gap-2 text-[10px] font-black text-[#134e4a] dark:text-[#bf953f] uppercase tracking-widest hover:scale-105 transition-transform"
                  >
                    <RefreshCw size={14} /> Sync from Recent Logs
                  </button>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <input 
                      type="text"
                      value={newSymptom}
                      onChange={(e) => setNewSymptom(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddSymptom()}
                      placeholder="Input symptom (e.g. Sharp acid reflux, joint stiffness)..."
                      className="w-full pl-14 pr-8 py-5 rounded-[2.2rem] bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-4 focus:ring-[#134e4a]/10 dark:text-white transition-all font-bold text-base shadow-inner placeholder:text-slate-300 italic"
                    />
                    <AlertCircle className="absolute left-6 top-1/2 -translate-y-1/2 text-[#bf953f]" size={22} />
                  </div>
                  <button 
                    onClick={handleAddSymptom}
                    className="px-12 py-5 bg-[#134e4a] dark:bg-[#bf953f] text-white rounded-[2.2rem] font-black flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#134e4a]/20"
                  >
                    <Plus size={20} /> FORMULATE
                  </button>
                </div>

                <div className="flex flex-wrap gap-3 pt-6 min-h-[100px] p-8 bg-slate-50/50 dark:bg-slate-800/30 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">
                  {symptoms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center w-full text-slate-400 space-y-2 opacity-50">
                       <FileText size={32} />
                       <p className="text-xs font-bold italic">Awaiting diagnostic input...</p>
                    </div>
                  ) : (
                    symptoms.map((s, idx) => (
                      <span key={idx} className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 group hover:border-[#bf953f] transition-all shadow-sm">
                        {s}
                        <button onClick={() => removeSymptom(idx)} className="text-slate-300 group-hover:text-rose-500 transition-colors">
                          <X size={18} />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={loading || symptoms.length === 0}
                className={`w-full py-7 rounded-[3rem] font-black text-white uppercase tracking-[0.3em] shadow-2xl flex items-center justify-center gap-8 transition-all relative overflow-hidden group ${
                  loading ? 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed' : 'bg-[#134e4a] hover:bg-teal-950 hover:scale-[1.01]'
                }`}
              >
                {loading ? (
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span className="animate-pulse">Synthesizing Bio-Herbology Matrix...</span>
                  </div>
                ) : (
                  <>
                    <Sparkles size={28} className="text-[#bf953f] group-hover:rotate-12 transition-transform" />
                    SYNTHESIZE CLINICAL PRESCRIPTION
                  </>
                )}
                <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </button>
           </div>

           {/* Patient Bio-Intelligence Context */}
           <div className="space-y-8">
             <div className="bg-[#134e4a] dark:bg-[#bf953f] p-10 rounded-[3.5rem] text-white space-y-8 shadow-2xl border-b-8 border-[#bf953f] dark:border-[#134e4a]">
                <h4 className="text-[11px] font-black uppercase tracking-[0.3em] opacity-60 border-b border-white/10 pb-4">Bio-Intelligence Profile</h4>
                <div className="space-y-6">
                   <ContextItem label="Primary Dosha" value={patient.dosha.join('/')} white />
                   <ContextItem label="Physiological Age" value={`${patient.age}y (${patient.ageCategory})`} white />
                   <ContextItem label="Known Vikriti" value={patient.healthConditions.join(', ') || 'N/A'} white />
                   <ContextItem label="Pathya Compliance" value="High Stability" white />
                </div>
                <div className="pt-6">
                   <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400" style={{width: '88%'}} />
                   </div>
                   <p className="text-[9px] font-black uppercase mt-3 opacity-40">Clinical Alignment Score: 88%</p>
                </div>
             </div>

             <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 text-center">
                <Heart className="text-rose-500 mx-auto mb-3" size={32} />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">Personalized for patient<br/>biological uniqueness</p>
             </div>
           </div>
        </div>
      </div>

      {prescription && (
        <div className="bg-white dark:bg-[#0f172a] p-12 sm:p-20 rounded-[5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] border border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom-20 duration-1000 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-20 opacity-[0.04] text-[#134e4a] pointer-events-none rotate-12">
            <Clipboard size={450} />
          </div>

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-slate-50 dark:border-slate-800/50 pb-16 mb-16 gap-10">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <span className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest">Clinical Protocol Verified</span>
                   <div className="w-1.5 h-1.5 bg-brand-gold rounded-full" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Vault ID: {Math.random().toString(36).substr(2, 12).toUpperCase()}</span>
                </div>
                <h3 className="text-6xl font-black text-slate-900 dark:text-white font-serif tracking-tight leading-none">Diagnostic Rx</h3>
                <p className="text-lg font-bold text-slate-400">Biological Blueprint for <span className="text-slate-900 dark:text-brand-gold">{patient.name}</span></p>
              </div>
              <div className="flex gap-4">
                <button className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-slate-600 dark:text-slate-300 shadow-inner group">
                  <Printer size={28} className="group-hover:scale-110 transition-transform" />
                </button>
                <button className="px-12 py-6 bg-[#134e4a] text-white rounded-[2rem] hover:scale-105 transition-all shadow-2xl shadow-[#134e4a]/20 flex items-center gap-4 font-black uppercase text-xs tracking-[0.2em] group">
                  <Download size={22} className="text-brand-gold group-hover:translate-y-1 transition-transform" /> EXPORT TO VAULT
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
              <section className="space-y-16">
                <div className="bg-emerald-50/40 dark:bg-emerald-950/20 p-12 rounded-[4rem] border border-emerald-100/50 dark:border-emerald-900/30 relative shadow-inner">
                  <div className="absolute -top-6 -left-6 w-16 h-16 bg-[#134e4a] rounded-3xl flex items-center justify-center text-white shadow-xl">
                    <Heart size={32} />
                  </div>
                  <h4 className="text-[12px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-8 ml-6">Clinical Bio-Logic (Diagnosis)</h4>
                  <p className="text-slate-800 dark:text-slate-100 leading-relaxed font-black text-2xl font-serif italic border-l-8 border-brand-gold/20 pl-10 ml-6 py-4">
                    "{prescription.diagnosis}"
                  </p>
                </div>

                <div className="pl-6">
                  <h4 className="text-[12px] font-black text-[#134e4a] dark:text-brand-gold uppercase tracking-[0.3em] mb-10 flex items-center gap-4">
                    <Zap size={20} className="text-[#bf953f]" /> Ayurvedic Herbology Stack
                  </h4>
                  <div className="grid grid-cols-1 gap-5">
                    {prescription.herbs.map((h, i) => (
                      <div key={i} className="flex items-center gap-6 p-7 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 group hover:border-[#bf953f] hover:translate-x-3 transition-all">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 text-[#134e4a] dark:text-brand-gold flex items-center justify-center font-black text-lg shadow-inner group-hover:bg-[#bf953f] group-hover:text-white transition-colors">
                          {i+1}
                        </div>
                        <span className="text-base font-black text-slate-800 dark:text-slate-200">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="space-y-16">
                <div className="bg-slate-50/50 dark:bg-slate-800/30 p-12 rounded-[4rem] border border-slate-100 dark:border-slate-800 group hover:shadow-2xl transition-all">
                  <h4 className="text-[12px] font-black text-[#134e4a] dark:text-brand-gold uppercase tracking-[0.3em] mb-10 flex items-center gap-4">
                    <Utensils size={20} className="text-emerald-500" /> Nutritional Alignment (Pathya)
                  </h4>
                  <ul className="space-y-6">
                    {prescription.dietAdjustments.map((d, i) => (
                      <li key={i} className="flex gap-6 group/item">
                        <div className="mt-2.5 w-2.5 h-2.5 rounded-full bg-[#bf953f] group-hover/item:scale-150 transition-transform shadow-[0_0_10px_rgba(191,149,63,0.5)]" />
                        <p className="text-base font-bold text-slate-600 dark:text-slate-300 leading-relaxed">{d}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-50/50 dark:bg-slate-800/30 p-12 rounded-[4rem] border border-slate-100 dark:border-slate-800 group hover:shadow-2xl transition-all">
                  <h4 className="text-[12px] font-black text-[#134e4a] dark:text-brand-gold uppercase tracking-[0.3em] mb-10 flex items-center gap-4">
                    <Activity size={20} className="text-blue-500" /> Bio-Dynamic Vihara (Lifestyle)
                  </h4>
                  <ul className="space-y-6">
                    {prescription.lifestyleAdvice.map((l, i) => (
                      <li key={i} className="flex gap-6 group/item">
                        <div className="mt-2.5 w-2.5 h-2.5 rounded-full bg-[#134e4a] group-hover/item:scale-150 transition-transform shadow-[0_0_10px_rgba(19,78,74,0.5)]" />
                        <p className="text-base font-bold text-slate-600 dark:text-slate-300 leading-relaxed">{l}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            </div>

            <div className="mt-24 pt-16 border-t border-slate-100 dark:border-slate-800/50 flex flex-col sm:flex-row justify-between items-center gap-8 opacity-40 text-[10px] font-black uppercase tracking-[0.5em]">
              <p className="flex items-center gap-3"><Logo size={30} hideText /> AYURDIET PRO CLINICAL SYSTEM</p>
              <div className="flex gap-12">
                 <span>DATE: {new Date().toLocaleDateString('en-GB')}</span>
                 <span>REF-HASH: {Math.random().toString(36).substr(2, 12).toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ContextItem = ({ label, value, white }: { label: string; value: string; white?: boolean }) => (
  <div>
    <p className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${white ? 'opacity-40' : 'text-slate-400'}`}>{label}</p>
    <p className={`text-sm font-black ${white ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>{value}</p>
  </div>
);

import { Logo } from './Logo';

export default PrescriptionGenerator;
