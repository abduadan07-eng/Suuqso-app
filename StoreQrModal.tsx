import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Download,
  Copy,
  Check,
  X,
  Store as StoreIcon,
  ExternalLink,
  Smartphone,
  ShieldCheck,
  LogIn,
  Camera,
} from 'lucide-react';
import { Store } from '../../types';

interface StoreQrModalProps {
  store: Store;
  onClose: () => void;
  onEnterStore?: (store: Store) => void;
  onLoginAsOwner?: (store: Store) => void;
  onOpenCameraScanner?: () => void;
}

export const StoreQrModal: React.FC<StoreQrModalProps> = ({
  store,
  onClose,
  onEnterStore,
  onLoginAsOwner,
  onOpenCameraScanner,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Dynamic real working live URL that opens this exact store when scanned by ANY phone camera
  const liveBaseUrl =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://ais-pre-74t7s5nixuy6qyzxqwegwg-254364297621.europe-west3.run.app';

  const realStoreUrl = `${liveBaseUrl}/?store=${encodeURIComponent(store.id)}&code=${encodeURIComponent(store.storeCode)}`;

  useEffect(() => {
    // Generate high-density crisp QR code that encodes the real working URL
    QRCode.toDataURL(realStoreUrl, {
      width: 360,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#042F2E', // Deep teal
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generating QR code:', err));
  }, [realStoreUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(realStoreUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${store.storeCode}_${store.name.replace(/\s+/g, '_')}_QR.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in select-none">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl text-slate-900 border border-slate-200 text-center relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Store Title & Badge */}
        <div className="flex flex-col items-center relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 border-2 border-teal-200 text-teal-800 flex items-center justify-center font-black text-lg mb-2 shadow-sm">
            {store.avatar || store.name.substring(0, 2).toUpperCase()}
          </div>
          <h3 className="font-extrabold text-lg text-slate-900">
            {store.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              Aqoonsiga: {store.storeCode}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">
              · {store.city}
            </span>
          </div>

          <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 leading-snug flex items-center gap-2 text-left">
            <Smartphone className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              <b>Kamarada ku aadi:</b> Marka kamarada lagu aadiyo wuxuu toos u furayaa akoonka iyo alaabta dukaankan!
            </span>
          </div>
        </div>

        {/* QR Code Container with Frame */}
        <div className="my-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center shadow-inner relative">
          {qrDataUrl ? (
            <div className="relative group">
              <img
                src={qrDataUrl}
                alt={`${store.name} QR Code`}
                className="w-52 h-52 rounded-xl shadow-md bg-white p-2.5 border border-slate-200"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-10 h-10 rounded-xl bg-teal-800 text-white font-bold text-xs flex items-center justify-center shadow-lg border-2 border-white">
                  {store.storeCode.substring(0, 4)}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-52 h-52 flex items-center justify-center text-slate-400 text-xs">
              Diyaarinta QR code-ka dhabta ah...
            </div>
          )}

          <div className="w-full mt-2.5 px-2 py-1 bg-white rounded-lg border border-slate-200/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span className="truncate max-w-[200px]">{realStoreUrl}</span>
            <button
              onClick={handleCopyLink}
              className="text-teal-700 font-bold hover:underline ml-1 cursor-pointer shrink-0"
            >
              {copied ? 'Nuqul!' : 'Koobi'}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {onEnterStore && (
            <button
              onClick={() => {
                onClose();
                onEnterStore(store);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Toos u Gal Dukaanka (Enter via QR)</span>
            </button>
          )}

          {onLoginAsOwner && (
            <button
              onClick={() => {
                onClose();
                onLoginAsOwner(store);
              }}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-teal-400" />
              <span>Ma adigaa iska leh? Gal Akoonka Dukaanka</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleDownloadQr}
              className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-teal-700" />
              <span>Soo Deji PNG</span>
            </button>

            {onOpenCameraScanner ? (
              <button
                onClick={() => {
                  onClose();
                  onOpenCameraScanner();
                }}
                className="py-2 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-teal-200"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Kamarada Fur</span>
              </button>
            ) : (
              <button
                onClick={handleCopyLink}
                className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Waa la qaatay!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-teal-700" />
                    <span>Nuqul Link-ga</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
