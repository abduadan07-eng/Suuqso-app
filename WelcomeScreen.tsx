import React from 'react';
import { ShoppingCart, Store, ShieldCheck, Download, ChevronRight, Users, QrCode } from 'lucide-react';
import { ScreenType } from '../../types';

interface WelcomeScreenProps {
  onNavigate: (screen: ScreenType) => void;
  onOpenQrScanner?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onNavigate,
  onOpenQrScanner,
}) => {
  return (
    <div className="min-h-full flex flex-col justify-between p-6 sm:p-8 bg-slate-50 text-slate-900 select-none">
      {/* Top Header */}
      <div className="pt-2 text-center">
        <div className="flex justify-center mb-2">
          <img
            src="/app-icon.png"
            alt="Suuqso Pro"
            className="w-16 h-16 rounded-2xl shadow-md object-contain ring-1 ring-slate-200"
          />
        </div>
        <div className="inline-flex items-center gap-2 text-xs font-medium text-sky-800 bg-sky-50 border border-sky-200/60 rounded-lg px-3 py-1 mb-2">
          <Store className="w-3.5 h-3.5 text-sky-600" />
          <span>Suuqso Pro · Ganacsiga & APK</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
          Ku Soo Dhawoow Suuqso Pro
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-sm mx-auto">
          Ka iibso dukaamada ama maamul dukaankaaga adoo adeegsanaya EVC Plus, Zaad, eDahab iyo Sahal.
        </p>
      </div>

      {/* Role Selection Options */}
      <div className="flex flex-col gap-2.5 my-4 max-w-md mx-auto w-full">
        {/* Option 1: Customer */}
        <button
          onClick={() => onNavigate('customer_home')}
          className="group text-left p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-teal-600 hover:shadow-md transition-all flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:bg-teal-700 group-hover:text-white transition-colors">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                Waxaan ahay Macmiil
              </h3>
              <p className="text-[11px] text-slate-500">
                Ka iibso dukaamada, follow dheh & toos ula hadal
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
        </button>

        {/* Option 2: Store Owner / Admin */}
        <button
          onClick={() => onNavigate('store_login')}
          className="group text-left p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-sky-600 hover:shadow-md transition-all flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center group-hover:bg-sky-700 group-hover:text-white transition-colors">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-800 transition-colors">
                Milkiilaha Dukaanka (Store Admin)
              </h3>
              <p className="text-[11px] text-slate-500">
                Geli dukaankaaga adoo adeegsanaya Aqoonsigaaga (DUK-xxx)
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-1 transition-all" />
        </button>

        {/* Option 3: Staff Login */}
        <button
          onClick={() => onNavigate('staff_login')}
          className="group text-left p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-600 hover:shadow-md transition-all flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                Shaqaalaha Dukaanka (Staff Login)
              </h3>
              <p className="text-[11px] text-slate-500">
                Diraha gaarsiinta, adeegga macmiilka & maamulka kaydka
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
        </button>

        {/* Option 4: Super Admin */}
        <button
          onClick={() => onNavigate('super_admin')}
          className="group text-left p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-slate-800 hover:shadow-md transition-all flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-slate-900 transition-colors">
                Maamulka Sare (Super Admin)
              </h3>
              <p className="text-[11px] text-slate-500">
                Abuur dukaan, xaqiijin & kormeer (Preview)
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-800 group-hover:translate-x-1 transition-all" />
        </button>

        {/* Option 5: QR Code Generator */}
        <button
          onClick={() => onNavigate('qr_generator')}
          className="group text-left p-3 rounded-2xl bg-teal-50/70 border border-teal-200 hover:border-teal-600 hover:bg-teal-50 transition-all flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-teal-950">
                Soo Saaraha QR Code (QR Generator)
              </h3>
              <p className="text-[10px] text-teal-800">
                U samee QR Code dukaankaaga oo soo deji ama daabac
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-teal-600 group-hover:translate-x-1 transition-all" />
        </button>
      </div>

      {/* APK studio direct footer trigger */}
      <div className="pb-2 max-w-md mx-auto w-full">
        <button
          onClick={() => onNavigate('apk_hub')}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-800 to-emerald-800 text-white font-semibold text-xs flex items-center justify-between shadow hover:opacity-95 transition-opacity cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-emerald-200" />
            <span>Dhis & Soo Deji APK-ga (app-release.apk)</span>
          </div>
          <span className="bg-white/20 text-white px-2 py-0.5 rounded text-[10px] font-mono">
            Download
          </span>
        </button>
      </div>
    </div>
  );
};
