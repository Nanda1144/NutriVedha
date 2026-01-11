
import React, { useState } from 'react';
import { Logo } from './Logo';
import { ArrowRight, Sparkles, ShieldCheck, HeartPulse, Brain, Zap, HelpCircle, Instagram, Twitter, Linkedin, Facebook, Play, X, UserCheck } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onEnterGuestMode: () => void;
  logoUrl?: string | null;
  demoVideoUrl?: string | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onEnterGuestMode, logoUrl = null, demoVideoUrl = null }) => {
  const [showVideo, setShowVideo] = useState(false);

  // Fallback video if admin hasn't provided one
  const activeVideoUrl = demoVideoUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ";

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card h-20 flex items-center justify-between px-6 lg:px-20 border-b border-slate-100 dark:border-slate-800">
        <Logo size={50} logoUrl={logoUrl} />
        <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-slate-500">
          <a href="#about" className="hover:text-[#134e4a] transition-colors">About</a>
          <a href="#uses" className="hover:text-[#134e4a] transition-colors">How it works</a>
          <button onClick={onEnterGuestMode} className="hover:text-[#bf953f] transition-colors flex items-center gap-2">
            <UserCheck size={16} /> Guest Mode
          </button>
        </div>
        <button 
          onClick={onGetStarted}
          className="px-8 py-3 bg-[#134e4a] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-[#134e4a]/10 hover:scale-105 active:scale-95 transition-all"
        >
          SIGN IN
        </button>
      </nav>

      {/* Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-10 animate-in fade-in duration-300">
          <button 
            onClick={() => setShowVideo(false)}
            className="absolute top-6 right-6 sm:top-10 sm:right-10 p-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all z-[110]"
          >
            <X size={28} />
          </button>
          <div className="w-full max-w-6xl aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl relative border-4 border-white/10">
            <iframe 
              src={activeVideoUrl}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="pt-48 pb-20 px-6 lg:px-20 flex flex-col lg:flex-row items-center gap-16 relative">
        <div className="flex-1 space-y-8 max-w-2xl text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 text-[#134e4a] dark:text-emerald-400 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-100/50 dark:border-emerald-800">
            <Sparkles size={14} className="text-[#bf953f]" /> AI-POWERED WELLNESS
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white leading-[1.1]">
            Balance Your <span className="gold-text">Doshas</span> With AI Precision.
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            NutriVedha combines 5,000 years of Ayurvedic wisdom with cutting-edge Artificial Intelligence to create personalized diet plans that evolve with your body.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <button onClick={onGetStarted} className="w-full sm:w-auto px-10 py-5 bg-[#134e4a] text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3">
              START YOUR JOURNEY <ArrowRight size={20} className="text-[#bf953f]" />
            </button>
            <button 
              onClick={() => setShowVideo(true)}
              className="w-full sm:w-auto px-10 py-5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-[2rem] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm flex items-center justify-center gap-3"
            >
              <Play size={20} fill="currentColor" /> WATCH DEMO
            </button>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 dark:text-slate-600">
            Trusted by users and Ayurvedic Practitioners
          </p>
        </div>
        <div className="flex-1 relative">
           <div className="w-full aspect-square bg-[#134e4a]/5 rounded-[4rem] rotate-3 absolute -z-10 animate-pulse opacity-50"></div>
           <div className="w-full aspect-square glass-card rounded-[4rem] border-4 border-white dark:border-slate-800 shadow-2xl overflow-hidden flex items-center justify-center p-12 relative">
              <div className="absolute inset-0 opacity-[0.02] bg-[#bf953f] pointer-events-none"></div>
              <Logo size={220} hideText logoUrl={logoUrl} />
           </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="uses" className="py-24 px-6 lg:px-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white font-serif tracking-tight">Precision Clinical Pillars</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">Digitizing the ancient Nadi Vigyan and Pathya traditions for the modern era.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Brain className="text-indigo-500" />}
              title="Sutra Engine"
              desc="Daily biological focus generated from your unique dosha profile and biometric history."
            />
            <FeatureCard 
              icon={<HeartPulse className="text-rose-500" />}
              title="Nadi Analytics"
              desc="Real-time pulse tracking and biometric monitoring synced directly to your practitioner's desk."
            />
            <FeatureCard 
              icon={<ShieldCheck className="text-emerald-500" />}
              title="Secure Pathya"
              desc="AI-formulated diet plans that respect your clinical conditions and local market availability."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 lg:px-20 border-t border-slate-100 dark:border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
           <Logo size={40} logoUrl={logoUrl} />
           <div className="flex gap-6">
              <Instagram size={20} className="text-slate-400 hover:text-[#134e4a] cursor-pointer" />
              <Twitter size={20} className="text-slate-400 hover:text-[#134e4a] cursor-pointer" />
              <Linkedin size={20} className="text-slate-400 hover:text-[#134e4a] cursor-pointer" />
              <Facebook size={20} className="text-slate-400 hover:text-[#134e4a] cursor-pointer" />
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">© 2025 NutriVedha Systems</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: any) => (
  <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 group">
    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-2xl font-black text-slate-900 dark:text-white font-serif mb-4">{title}</h3>
    <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{desc}</p>
  </div>
);
