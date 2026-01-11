
import React, { useRef, useEffect, useState } from 'react';
import { Video, VideoOff, Mic, MicOff, PhoneOff, User, Sparkles, Settings, Calendar, AlertCircle, Clock } from 'lucide-react';

interface TelehealthProps {
  isScheduled?: boolean;
  onBookSession?: () => void;
}

export const Telehealth: React.FC<TelehealthProps> = ({ isScheduled = false, onBookSession }) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(true); 
  const [isLive, setIsLive] = useState(false);
  const [callTime, setCallTime] = useState(0);

  // Connection handling
  const handleConnect = async () => {
    if (!isScheduled) return;
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(s);
      if (localVideoRef.current) localVideoRef.current.srcObject = s;
      setIsVideoOff(false);
      setIsLive(true);
    } catch (e) {
      console.error("Camera failed", e);
    }
  };

  useEffect(() => {
    let timer: any;
    if (isLive) timer = setInterval(() => setCallTime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [isLive]);

  useEffect(() => () => stream?.getTracks().forEach(t => t.stop()), [stream]);

  if (!isScheduled) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-8 animate-in fade-in duration-500">
        <div className="w-32 h-32 bg-slate-100 dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-slate-300 mb-4 border-4 border-white dark:border-slate-800 shadow-xl">
           <Calendar size={64} />
        </div>
        <div className="max-w-md space-y-4">
          <h2 className="text-4xl font-black text-[#134e4a] dark:text-white font-serif">No Session Scheduled</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            Live Vaidya consultations are available by appointment only. This ensures the doctor has reviewed your biometric history beforehand.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={onBookSession}
            className="px-10 py-5 bg-[#134e4a] text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all flex items-center gap-3"
          >
            <Clock size={20} /> BOOK CONSULTATION
          </button>
          <div className="px-6 py-5 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 text-slate-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <AlertCircle size={16} /> Estimated Wait: 12h
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#134e4a] dark:text-[#bf953f] font-serif">AyurConnect Live</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Session with Dr. Shanti Swaroop</p>
        </div>
        <div className="flex items-center gap-3">
          {isLive ? (
            <div className="px-5 py-2 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 border border-rose-100 dark:border-rose-900/30">
              <div className="w-2 h-2 bg-rose-600 rounded-full animate-pulse" />
              LIVE: {Math.floor(callTime/60).toString().padStart(2,'0')}:{(callTime%60).toString().padStart(2,'0')}
            </div>
          ) : (
            <button 
              onClick={handleConnect}
              className="px-8 py-3 nutri-gradient text-white rounded-full text-xs font-black uppercase tracking-widest shadow-lg flex items-center gap-2"
            >
              Start Session
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 pb-10">
        <div className="lg:col-span-3 relative bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800">
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#134e4a] via-slate-900 to-emerald-950">
            <div className="text-center">
              <div className="w-40 h-40 bg-white/10 rounded-[3rem] mx-auto flex items-center justify-center text-emerald-400 text-6xl font-black border border-white/10 mb-6">S</div>
              <h3 className="text-white text-2xl font-black">Dr. Shanti Swaroop</h3>
            </div>
          </div>

          <div className="absolute top-6 right-6 w-56 aspect-[3/4] bg-slate-800 rounded-3xl border-2 border-white/20 overflow-hidden">
             <video ref={localVideoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${isVideoOff ? 'opacity-0' : 'opacity-100'}`} />
             {isVideoOff && (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
                 <User size={32} className="text-white/20 mb-2" />
                 <p className="text-[10px] text-white/30 uppercase tracking-widest">Camera Off</p>
               </div>
             )}
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 p-4 bg-black/20 backdrop-blur-2xl rounded-[2.5rem] border border-white/10">
             <button onClick={() => setIsMuted(!isMuted)} className={`w-14 h-14 rounded-full flex items-center justify-center ${isMuted ? 'bg-rose-500 text-white' : 'bg-white/10 text-white'}`}><MicOff size={24} /></button>
             <button onClick={() => setIsLive(false)} className="w-18 h-18 bg-rose-500 text-white rounded-[2rem] flex items-center justify-center p-5"><PhoneOff size={32} /></button>
             <button onClick={() => setIsVideoOff(!isVideoOff)} className={`w-14 h-14 rounded-full flex items-center justify-center ${isVideoOff ? 'bg-rose-500 text-white' : 'bg-white/10 text-white'}`}><VideoOff size={24} /></button>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
             <h3 className="font-black text-xs uppercase tracking-widest text-[#bf953f] mb-6 flex items-center gap-2"><Sparkles size={16} /> LIVE AI INSIGHTS</h3>
             <div className="space-y-4">
               <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-l-4 border-emerald-500">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">OBSERVATION</p>
                  <p className="text-sm font-medium">Elevated Pitta detected in biometric feed.</p>
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};
