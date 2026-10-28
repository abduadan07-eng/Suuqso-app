import React from 'react';
import { Smartphone, Monitor, Wifi, Battery, Signal, ChevronLeft } from 'lucide-react';
import { ScreenType } from '../../types';

interface MobileFrameProps {
  children: React.ReactNode;
  isMobileView: boolean;
  onToggleMobileView: () => void;
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({
  children,
  isMobileView,
  onToggleMobileView,
  currentScreen,
  onNavigate,
}) => {
  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-65px)] bg-slate-100/90 py-6 px-3 sm:px-6">
      {/* Workspace Control Strip (Below Navbar, as per Top Bar Contract) */}
      <div className="w-full max-w-5xl mb-6 flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm">
        {/* Screen Selector Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-xs">
          <span className="text-[11px] font-semibold text-slate-500 mr-1.5 shrink-0">
            Shaashadaha:
          </span>
          <button
            onClick={() => onNavigate('splash')}
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              currentScreen === 'splash'
                ? 'bg-slate-900 text-white font-medium shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            1. Splash
          </button>
          <button
            onClick={() => onNavigate('welcome')}
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              currentScreen === 'welcome'
                ? 'bg-slate-900 text-white font-medium shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            2. Welcome
          </button>
          <button
            onClick={() => onNavigate('customer_home')}
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              currentScreen === 'customer_home'
                ? 'bg-slate-900 text-white font-medium shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            3. Macmiil (Suuqa)
          </button>
          <button
            onClick={() => onNavigate('store_login')}
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              currentScreen === 'store_login'
                ? 'bg-slate-900 text-white font-medium shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            4. Store Login
          </button>
          <button
            onClick={() => onNavigate('store_dashboard')}
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              currentScreen === 'store_dashboard'
                ? 'bg-slate-900 text-white font-medium shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            5. Store Dashboard
          </button>
          <button
            onClick={() => onNavigate('staff_login')}
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              currentScreen === 'staff_login' || currentScreen === 'staff_dashboard'
                ? 'bg-slate-900 text-white font-medium shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            6. Staff (Shaqaale)
          </button>
          <button
            onClick={() => onNavigate('super_admin')}
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              currentScreen === 'super_admin'
                ? 'bg-slate-900 text-white font-medium shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            7. Super Admin
          </button>
          <button
            onClick={() => onNavigate('qr_generator')}
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              currentScreen === 'qr_generator'
                ? 'bg-slate-900 text-white font-medium shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            8. QR Generator
          </button>
          <button
            onClick={() => onNavigate('apk_hub')}
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              currentScreen === 'apk_hub'
                ? 'bg-teal-700 text-white font-medium shadow-sm'
                : 'text-teal-700 hover:bg-teal-50'
            }`}
          >
            APK Build & Export
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 text-xs">
          <button
            onClick={onToggleMobileView}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              isMobileView
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Taleefan (Mobile View)</span>
          </button>
          <button
            onClick={onToggleMobileView}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              !isMobileView
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Kombiyuutar (Full Canvas)</span>
          </button>
        </div>
      </div>

      {/* Frame Rendering */}
      {isMobileView ? (
        <div className="relative w-full max-w-[412px] h-[780px] bg-slate-900 rounded-[44px] p-3 shadow-2xl ring-1 ring-slate-800/80 flex flex-col justify-between">
          {/* Mobile Bezel Header / Status Bar */}
          <div className="relative z-30 pt-1 pb-2 px-6 flex items-center justify-between text-white text-[12px] font-mono select-none">
            <span>09:41</span>
            {/* Dynamic camera notch */}
            <div className="w-20 h-4 bg-black rounded-full" />
            <div className="flex items-center gap-1.5 text-white/90">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4" />
            </div>
          </div>

          {/* Screen Content Container with inner radius */}
          <div className="relative flex-1 bg-white rounded-[32px] overflow-y-auto overflow-x-hidden">
            {children}
          </div>

          {/* Android / iOS Home Indicator Bar */}
          <div className="py-2 flex items-center justify-center">
            <div className="w-32 h-1 bg-white/40 rounded-full" />
          </div>
        </div>
      ) : (
        <div className="w-full max-w-5xl bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[700px]">
          {children}
        </div>
      )}
    </div>
  );
};
