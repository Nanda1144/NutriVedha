
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import DoctorDashboard from './components/DoctorDashboard';
import PatientDashboard from './components/PatientDashboard';
import PrescriptionGenerator from './components/PrescriptionGenerator';
import HealthMonitoring from './components/HealthMonitoring';
import HealthReports from './components/HealthReports';
import AdminDashboard from './components/AdminDashboard';
import { Chatbot } from './components/Chatbot';
import { Telehealth } from './components/Telehealth';
import { OnboardingFlow } from './components/OnboardingFlow';
import { HelpOverlay } from './components/HelpOverlay';
import { MOCK_PATIENTS, MOCK_FOODS } from './constants';
import { Patient, Food, HealthLog, DietPlanResponse, Language, Role, OnboardingData, UserPreferences } from './types';
import { 
  Search, Sparkles, Activity, Plus, Edit3, Save, Info, Target, Calendar, CloudSync, ShieldCheck, Check, ChevronDown, ChevronUp, Trash2, RotateCcw, Utensils, X, User as UserIcon
} from 'lucide-react';
import { generateAiDietPlan, validateDietPlan } from './services/geminiService';
import { apiService } from './services/apiService';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'auth' | 'app'>('landing');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [role, setRole] = useState<Role>('Doctor');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('nutrivedha-dark-mode') === 'true');
  
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [activePatient, setActivePatient] = useState<Patient>(patients[0]);
  const [foods] = useState<Food[]>(MOCK_FOODS);
  
  const [generatingDiet, setGeneratingDiet] = useState(false);
  const [validatingDiet, setValidatingDiet] = useState(false);
  const [dietPlan, setDietPlan] = useState<DietPlanResponse | null>(activePatient.currentDietPlan || null);
  const [isEditingDiet, setIsEditingDiet] = useState(false);
  const [dietFocus, setDietFocus] = useState<string>('');
  
  const [preferredCuisines, setPreferredCuisines] = useState<string[]>(activePatient.onboarding?.preferences?.preferredCuisines || []);
  const [excludedIngredients, setExcludedIngredients] = useState<string[]>(activePatient.onboarding?.preferences?.excludedIngredients || []);
  const [newCuisine, setNewCuisine] = useState('');
  const [newExclusion, setNewExclusion] = useState('');

  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  const [systemConfig, setSystemConfig] = useState<any>({ logoUrl: null, demoVideoUrl: null });
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initial Data & Config Load
  useEffect(() => {
    const fetchConfig = async () => {
      const cfg = await apiService.getConfig();
      setSystemConfig(cfg);
    };
    fetchConfig();
  }, []);

  // Connection monitoring for sync processing
  useEffect(() => {
    const handleSync = () => {
      if (navigator.onLine) apiService.processSyncQueue();
    };
    window.addEventListener('online', handleSync);
    return () => window.removeEventListener('online', handleSync);
  }, []);

  useEffect(() => {
    const loadFromDb = async () => {
      const dbData = await apiService.getPatientData(activePatient.userId);
      if (dbData) {
        updateActivePatient(dbData, false);
        if (dbData.currentDietPlan) setDietPlan(dbData.currentDietPlan);
      }
    };
    loadFromDb();
  }, []);

  useEffect(() => {
    if (view !== 'app' || role !== 'Patient' || isGuestMode) return;
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    
    setSyncStatus('syncing');
    syncTimeoutRef.current = setTimeout(async () => {
      const success = await apiService.syncPatientData(activePatient);
      setSyncStatus(success ? 'synced' : 'error');
    }, 2500);

    return () => { if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current); };
  }, [activePatient, view, isGuestMode]);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('nutrivedha-dark-mode', isDarkMode.toString());
  }, [isDarkMode]);

  const updateActivePatient = (updated: Patient, shouldMarkSyncing = true) => {
    setActivePatient(updated);
    setPatients(prev => prev.map(p => p.id === updated.id ? updated : p));
    if (shouldMarkSyncing) setSyncStatus('syncing');
  };

  const handleLogin = (selectedRole: Role) => {
    setRole(selectedRole);
    setIsGuestMode(false);
    setView('app');
    if (!localStorage.getItem('nutrivedha_onboarded')) {
      setShowHelp(true);
      localStorage.setItem('nutrivedha_onboarded', 'true');
    }
  };

  const handleGuestMode = () => {
    setRole('Patient');
    setIsGuestMode(true);
    setView('app');
    setActivePatient({ ...MOCK_PATIENTS[0], name: 'Guest Explorer', userId: 'guest_user' });
  };

  const handleOnboardingComplete = (data: OnboardingData) => {
    updateActivePatient({ ...activePatient, onboarding: data });
    setIsEditingProfile(false);
  };

  const handleGenerateDiet = async () => {
    setGeneratingDiet(true);
    try {
      const prefs: UserPreferences = { preferredCuisines, excludedIngredients };
      const plan = await generateAiDietPlan(activePatient, foods, dietFocus, 'en', prefs);
      setDietPlan(plan);
      updateActivePatient({ ...activePatient, currentDietPlan: plan });
    } catch (err) {
      alert('AI formulation failed.');
    } finally {
      setGeneratingDiet(false);
    }
  };

  const handleRevalidate = async () => {
    if (!dietPlan) return;
    setValidatingDiet(true);
    try {
      const updated = await validateDietPlan(activePatient, dietPlan.weeklyPlan);
      setDietPlan(updated);
      updateActivePatient({ ...activePatient, currentDietPlan: updated });
      setIsEditingDiet(false);
    } catch (err) {
      alert('Validation failed.');
    } finally {
      setValidatingDiet(false);
    }
  };

  const refreshConfig = async () => {
    const cfg = await apiService.getConfig();
    setSystemConfig(cfg);
  };

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col">
        {view === 'landing' && (
          <LandingPage 
            onGetStarted={() => setView('auth')} 
            onEnterGuestMode={handleGuestMode} 
            logoUrl={systemConfig.logoUrl} 
            demoVideoUrl={systemConfig.demoVideoUrl} 
          />
        )}
        
        {view === 'auth' && (
          <AuthPage 
            onLogin={handleLogin} 
            onBack={() => setView('landing')} 
            onGuestMode={handleGuestMode} 
            logoUrl={systemConfig.logoUrl} 
          />
        )}

        {view === 'app' && (
          <Layout 
            role={isAdminAuthenticated ? 'Admin' : role} 
            isDarkMode={isDarkMode} 
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            onLogout={() => {
              setView('landing');
              setIsAdminAuthenticated(false);
            }}
            onEditProfile={() => setIsEditingProfile(true)}
            onShowHelp={() => setShowHelp(true)}
            userName={isAdminAuthenticated ? 'System Admin' : (role === 'Doctor' ? 'Dr. Shanti Swaroop' : activePatient.name)}
            syncStatus={syncStatus}
            logoUrl={systemConfig.logoUrl}
          >
            {showHelp && <HelpOverlay onClose={() => setShowHelp(false)} />}

            {isEditingProfile ? (
              <OnboardingFlow 
                userName={activePatient.name} 
                onComplete={handleOnboardingComplete} 
                initialData={activePatient.onboarding}
                onCancel={() => setIsEditingProfile(false)}
              />
            ) : (
              <Routes>
                <Route path="/" element={
                  isAdminAuthenticated ? <AdminDashboard patients={patients} onConfigUpdate={refreshConfig} /> :
                  role === 'Doctor' ? <DoctorDashboard /> : <PatientDashboard patient={activePatient} />
                } />
                
                {/* Admin specific routes to make sidebar buttons work */}
                <Route path="/patients" element={
                  isAdminAuthenticated ? <div className="p-8"><h2 className="text-3xl font-black font-serif mb-6">System Registry</h2><div className="bg-white p-12 rounded-[3rem] border border-slate-100 text-center text-slate-400 font-bold italic">Patient Clinical Database Management is loading...</div></div> : <Navigate to="/" />
                } />
                <Route path="/foods" element={
                  isAdminAuthenticated ? <div className="p-8"><h2 className="text-3xl font-black font-serif mb-6">Pharmacopeia</h2><div className="bg-white p-12 rounded-[3rem] border border-slate-100 text-center text-slate-400 font-bold italic">Ayurvedic Food & Herb Database Management is loading...</div></div> : <Navigate to="/" />
                } />

                <Route path="/telehealth" element={<Telehealth isScheduled={activePatient.id === 'p1'} />} />
                <Route path="/monitoring" element={<HealthMonitoring onSaveLog={(log) => {
                  const updatedLogs = [...activePatient.logs, { ...log, id: Date.now().toString(), date: new Date().toISOString() } as HealthLog];
                  updateActivePatient({ ...activePatient, logs: updatedLogs });
                }} />} />
                <Route path="/reports" element={<HealthReports patient={activePatient} />} />
                <Route path="/diet-generator" element={
                  <div className="space-y-12 pb-24 max-w-7xl mx-auto px-4 sm:px-0">
                    <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-[4rem] shadow-sm border border-slate-100 dark:border-slate-800">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-16">
                        <div>
                          <h2 className="text-4xl font-black font-serif text-[#134e4a] dark:text-[#bf953f] tracking-tight">AI Pathya Matrix</h2>
                          <p className="text-slate-500 font-medium">Auto-synced to your clinical health records</p>
                        </div>
                        <div className="flex gap-4 w-full md:w-auto">
                          {isEditingDiet ? (
                            <button onClick={handleRevalidate} disabled={validatingDiet} className="flex-1 md:flex-none px-12 py-5 bg-[#bf953f] text-white rounded-[2.2rem] font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3">
                              {validatingDiet ? <div className="w-5 h-5 border-2 border-white/30 animate-spin rounded-full" /> : <ShieldCheck size={22} />}
                              RE-VALIDATE
                            </button>
                          ) : (
                            <button onClick={handleGenerateDiet} disabled={generatingDiet} className="flex-1 md:flex-none px-12 py-5 bg-[#134e4a] text-white rounded-[2.2rem] font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50">
                              {generatingDiet ? <div className="w-5 h-5 border-2 border-white/30 animate-spin rounded-full" /> : <Sparkles size={22} className="text-[#bf953f]" />}
                              FORMULATE
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                        <div className="p-8 bg-slate-50/50 dark:bg-slate-800/50 rounded-[3rem] border border-slate-100 dark:border-slate-800">
                           <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-4 flex items-center gap-3">
                              <Target size={16} className="text-[#bf953f]" /> Preferred Cuisines
                           </label>
                           <div className="flex gap-2 mb-4">
                              <input value={newCuisine} onChange={(e) => setNewCuisine(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (setPreferredCuisines([...preferredCuisines, newCuisine]), setNewCuisine(''))} className="flex-1 bg-white dark:bg-slate-900 rounded-xl px-4 py-2 text-sm border border-slate-200 outline-none" placeholder="Add cuisine..." />
                              <button onClick={() => {setPreferredCuisines([...preferredCuisines, newCuisine]); setNewCuisine('')}} className="p-2 bg-[#134e4a] text-white rounded-xl"><Plus size={16} /></button>
                           </div>
                           <div className="flex flex-wrap gap-2">
                              {preferredCuisines.map(c => (
                                <span key={c} className="px-3 py-1 bg-white dark:bg-slate-900 rounded-lg text-[10px] font-bold border border-slate-200 flex items-center gap-2">
                                  {c} <X className="cursor-pointer" size={12} onClick={() => setPreferredCuisines(preferredCuisines.filter(x => x !== c))} />
                                </span>
                              ))}
                           </div>
                        </div>

                        <div className="p-8 bg-slate-50/50 dark:bg-slate-800/50 rounded-[3rem] border border-slate-100 dark:border-slate-800">
                           <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-4 flex items-center gap-3">
                              <Trash2 size={16} className="text-rose-500" /> Exclude Ingredients
                           </label>
                           <div className="flex gap-2 mb-4">
                              <input value={newExclusion} onChange={(e) => setNewExclusion(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (setExcludedIngredients([...excludedIngredients, newExclusion]), setNewExclusion(''))} className="flex-1 bg-white dark:bg-slate-900 rounded-xl px-4 py-2 text-sm border border-slate-200 outline-none" placeholder="Add ingredient..." />
                              <button onClick={() => {setExcludedIngredients([...excludedIngredients, newExclusion]); setNewExclusion('')}} className="p-2 bg-rose-500 text-white rounded-xl"><Plus size={16} /></button>
                           </div>
                           <div className="flex flex-wrap gap-2">
                              {excludedIngredients.map(e => (
                                <span key={e} className="px-3 py-1 bg-white dark:bg-slate-900 rounded-lg text-[10px] font-bold border border-slate-200 flex items-center gap-2">
                                  {e} <X className="cursor-pointer" size={12} onClick={() => setExcludedIngredients(excludedIngredients.filter(x => x !== e))} />
                                </span>
                              ))}
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            )}
          </Layout>
        )}
        
        {/* Global Chatbot availability */}
        <Chatbot patient={activePatient} onAdminAuth={(s) => { 
          if(s) {
            setIsAdminAuthenticated(true);
            setView('app'); // Transition to app view to show the admin dashboard
          } 
        }} />
      </div>
    </HashRouter>
  );
};

export default App;
