
import React from 'react';

export const Logo: React.FC<{ 
  className?: string; 
  size?: number; 
  hideText?: boolean;
  logoUrl?: string | null;
}> = ({ className = "", size = 400, hideText = false, logoUrl = null }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        {logoUrl ? (
          <img 
            src={logoUrl} 
            alt="Site Logo" 
            className="w-full h-full object-contain rounded-lg"
          />
        ) : (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
            {/* Outer Patterned Ring */}
            <circle cx="50" cy="50" r="48" fill="#134e4a" />
            <circle cx="50" cy="50" r="44" fill="white" stroke="#bf953f" strokeWidth="1" />
            
            {/* Circular inner pattern lines */}
            <circle cx="50" cy="50" r="46" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="1 3" opacity="0.3" />
            
            {/* Book / Mortar Base */}
            <path d="M35 60 L65 60 L60 75 L40 75 Z" fill="#bf953f" />
            <path d="M30 60 Q50 50 70 60" fill="none" stroke="#134e4a" strokeWidth="2" />
            
            {/* Plant Stem & Roots */}
            <path d="M50 60 L50 35" stroke="#134e4a" strokeWidth="3" strokeLinecap="round" />
            <path d="M45 75 Q50 85 55 75" fill="none" stroke="#134e4a" strokeWidth="1" />
            <path d="M48 78 Q50 82 52 78" fill="none" stroke="#134e4a" strokeWidth="0.5" />
            
            {/* Leaves */}
            <path d="M50 35 Q35 25 50 15 Q65 25 50 35" fill="#bf953f" stroke="#134e4a" strokeWidth="1" />
            <path d="M50 45 Q38 40 40 30 Q50 32 50 45" fill="#134e4a" />
            <path d="M50 45 Q62 40 60 30 Q50 32 50 45" fill="#134e4a" />
            
            {/* Book elements flanking the plant */}
            <path d="M38 55 L38 35 Q45 35 45 55" fill="none" stroke="#134e4a" strokeWidth="1.5" />
            <path d="M62 55 L62 35 Q55 35 55 55" fill="none" stroke="#134e4a" strokeWidth="1.5" />
          </svg>
        )}
      </div>
      {!hideText && (
        <div className="flex flex-col leading-none">
          <span className="text-xl font-black tracking-tighter text-[#134e4a] dark:text-[#bf953f] font-serif">Nutri<span className="text-[#bf953f] dark:text-white">Vedha</span></span>
          <span className="text-[7px] font-black uppercase tracking-[0.2em] text-[#134e4a]/60 dark:text-white/40">Ayurveda-Focused Dietetics Software</span>
        </div>
      )}
    </div>
  );
};
