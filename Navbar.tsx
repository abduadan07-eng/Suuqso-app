import React from 'react';
import { ScreenType } from '../types';
import { Smartphone, Download, QrCode, Camera, Film } from 'lucide-react';

interface NavbarProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  onOpenInstallModal?: () => void;
  onOpenCameraScanner?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onNavigate,
  onOpenInstallModal,
  onOpenCameraScanner,
}) => {
  return (
    <header className="flex items-center justify-between gap-4 sm:gap-8 px-4 sm:px-6 py-3 bg-white border-b border-slate-200">
      {/* Zone 1: Wordmark */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onNavigate('customer_home');
        }}
        className="text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-sky-700 transition-colors flex items-center gap-2"
      >
        <img
          src="/app-icon.png"
          alt="Suuqso Pro Icon"
          className="w-7 h-7 rounded-lg object-contain shadow-xs"
        />
        <span className="font-black text-slate-900">Suuqso <span className="text-sky-600">Pro</span></span>
      </a>

      {/* Zone 2: Clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
        <button
          onClick={() => onNavigate('customer_home')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentScreen === 'customer_home' ? 'text-teal-800 font-bold' : ''
          }`}
        >
          Suuqa Macmiilka
        </button>
        <button
          onClick={() => onNavigate('ads_feed')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
            currentScreen === 'ads_feed' ? 'text-teal-800 font-bold' : ''
          }`}
        >
          <Film className="w-3.5 h-3.5 text-amber-500" />
          <span>Xayeysiisyo</span>
          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full">Feed</span>
        </button>
        <button
          onClick={() => onNavigate('store_dashboard')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentScreen === 'store_dashboard' || currentScreen === 'store_login'
              ? 'text-teal-800 font-bold'
              : ''
          }`}
        >
          Dukaanka Ganacsadaha
        </button>
        <button
          onClick={() => onNavigate('super_admin')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentScreen === 'super_admin' ? 'text-teal-800 font-bold' : ''
          }`}
        >
          Maamulka Sare
        </button>
        <button
          onClick={() => onNavigate('qr_generator')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentScreen === 'qr_generator' ? 'text-teal-800 font-bold' : ''
          }`}
        >
          QR Generator
        </button>
        <button
          onClick={() => onNavigate('apk_hub')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentScreen === 'apk_hub' ? 'text-teal-800 font-bold' : ''
          }`}
        >
          Dhisidda APK
        </button>
      </nav>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {onOpenCameraScanner && (
          <button
            onClick={onOpenCameraScanner}
            className="p-2 sm:px-3 sm:py-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 border border-slate-200"
            title="Sawir QR Code Kamarada Taleefanka"
          >
            <Camera className="w-3.5 h-3.5 text-teal-800" />
            <span className="hidden sm:inline">Sawir QR</span>
          </button>
        )}

        <button
          onClick={onOpenInstallModal || (() => onNavigate('apk_hub'))}
          className="px-3 py-1.5 text-xs font-bold text-teal-900 bg-teal-100/80 hover:bg-teal-200/80 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 border border-teal-200"
          title="Toos Taleefankaaga Ugu Shub (PWA / WebAPK)"
        >
          <Smartphone className="w-3.5 h-3.5 text-teal-800" />
          <span className="hidden sm:inline">U Shub Taleefanka</span>
          <span className="sm:hidden">Install</span>
        </button>

        <button
          onClick={() => onNavigate('apk_hub')}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-800 rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>APK & ZIP</span>
        </button>
      </div>
    </header>
  );
};
