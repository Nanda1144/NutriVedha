
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Loader2, Volume2, ShieldCheck, Mic, MicOff } from 'lucide-react';
import { getVaidyaChatResponse, generateSpeech } from '../services/geminiService';
import { Patient } from '../types';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

interface ChatbotProps {
  patient: Patient;
  onAdminAuth?: (status: boolean) => void;
}

export const Chatbot: React.FC<ChatbotProps> = ({ patient, onAdminAuth }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initial greeting based on context
    const greeting = patient.userId === 'guest_user' 
      ? `Namaste! I am Vaidya AI. How can I help you explore the world of Ayurvedic Precision today?`
      : `Namaste ${patient.name}. I am Vaidya AI from NutriVedha. How can I assist you with your ${patient.dosha.join('/')} balance today?`;
    
    setMessages([{ role: 'bot', text: greeting }]);
  }, [patient.userId, patient.name]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-IN';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        handleSend(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setInput('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const userMsg = textToSend || input.trim();
    if (!userMsg || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);

    // Secret Admin Access Code
    if (userMsg === '@cC1411441') {
      setLoading(true);
      setTimeout(() => {
        const botText = "ROOT ACCESS GRANTED. Welcome back, Administrator. NutriVedha Admin Panel is now accessible.";
        setMessages(prev => [...prev, { role: 'bot', text: botText }]);
        if (isVoiceEnabled) handleSpeak(botText);
        onAdminAuth?.(true);
        setLoading(false);
      }, 1000);
      return;
    }

    setLoading(true);
    try {
      const botResponse = await getVaidyaChatResponse(messages, userMsg, patient);
      const botText = botResponse || "I apologize, I'm having trouble connecting to NutriVedha's Ayurvedic intelligence.";
      setMessages(prev => [...prev, { role: 'bot', text: botText }]);
      if (isVoiceEnabled) handleSpeak(botText);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = async (text: string) => {
    try {
      const base64 = await generateSpeech(text);
      if (base64) {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
        const dataInt16 = new Int16Array(bytes.buffer);
        const frameCount = dataInt16.length;
        const buffer = audioContext.createBuffer(1, frameCount, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < frameCount; i++) {
          channelData[i] = dataInt16[i] / 32768.0;
        }

        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start();
      }
    } catch (e) {
      console.error("Speech generation failed", e);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 chatbot-trigger">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-[#134e4a] text-white rounded-full shadow-[0_10px_40px_rgba(19,78,74,0.4)] flex items-center justify-center hover:scale-110 transition-all border-4 border-white group"
        >
          <MessageSquare size={28} className="group-hover:rotate-12 transition-transform" />
        </button>
      ) : (
        <div className="w-[90vw] sm:w-96 h-[550px] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col border border-slate-100 dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom-4">
          <div className="p-5 bg-[#134e4a] text-white flex justify-between items-center border-b-4 border-b-[#bf953f]">
            <div className="flex items-center gap-3">
              <Bot size={24} className="text-[#bf953f]" />
              <div>
                <p className="font-bold text-sm">NutriVedha Vaidya</p>
                <p className="text-[9px] opacity-80 uppercase tracking-widest font-black">AI Voice Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                className={`p-2 rounded-full transition-colors ${isVoiceEnabled ? 'bg-white/20' : 'bg-transparent text-white/50'}`}
                title={isVoiceEnabled ? "Voice response ON" : "Voice response OFF"}
              >
                <Volume2 size={18} />
              </button>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-[#134e4a] text-white rounded-tr-none shadow-lg shadow-[#134e4a]/10' 
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none shadow-sm border border-slate-100 dark:border-slate-700'
                }`}>
                  <p>{m.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl rounded-tl-none border border-slate-100 dark:border-slate-700 flex gap-1.5 shadow-sm">
                  <div className="w-2 h-2 bg-[#bf953f] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#bf953f] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-[#bf953f] rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-2 items-center">
            <button 
              onClick={toggleListening}
              className={`p-3 rounded-2xl transition-all shadow-md ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-[#bf953f]'}`}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isListening ? "Listening..." : "Speak to NutriVedha..."}
              className="flex-1 px-5 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#134e4a] dark:text-white transition-all font-medium"
            />
            <button 
              onClick={() => handleSend()}
              className="p-3 bg-[#134e4a] text-white rounded-2xl shadow-lg hover:bg-emerald-800 active:scale-95 transition-all"
            >
              <Send size={18} className="text-[#bf953f]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
