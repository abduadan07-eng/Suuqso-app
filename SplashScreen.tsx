import React, { useEffect, useState } from 'react';
import { ShoppingBag, Sparkles, ArrowRight } from 'lucide-react';

interface SplashScreenProps {
  onProceed: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onProceed }) => {
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 15;
      });
    }, 250);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-full flex flex-col items-center justify-between p-8 bg-slate-900 text-white overflow-hidden select-none">
      {/* Background ambient accents */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -right-20 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top subtle badge */}
      <div className="pt-8 text-center">
        <span className="text-xs uppercase tracking-widest text-sky-400 font-mono">
          Suuqso Pro APK v1.2.0
        </span>
      </div>

      {/* Center Branding */}
      <div className="flex flex-col items-center text-center my-auto">
        <div className="relative mb-5">
          <img
            src="/app-icon.png"
            alt="Suuqso Pro App Icon"
            className="w-28 h-28 rounded-3xl shadow-2xl shadow-sky-500/30 object-contain ring-2 ring-white/10"
          />
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-amber-400 shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
          Suuqso Pro
        </h1>
        <p className="text-sm font-semibold text-sky-200 max-w-xs">
          Suuqa Ganacsiga & Xarunta APK Store
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Dukaamada Hargeysa, Muqdisho, Garoowe & Boosaaso
        </p>

        {/* Progress loader */}
        <div className="w-56 mt-10">
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-400 transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2 font-mono">
            <span>Diyaarinta...</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>

      {/* Bottom action trigger */}
      <div className="pb-6 w-full max-w-xs flex flex-col items-center gap-3">
        <button
          onClick={onProceed}
          className="w-full py-3.5 px-6 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-900/40 cursor-pointer"
        >
          <span>Gudaha u Gal App-ka</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <span className="text-[11px] text-slate-400">
          Guji si aad u gasho shaashadda xigta
        </span>
      </div>
    </div>
  );
};
