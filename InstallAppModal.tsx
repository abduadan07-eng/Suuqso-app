import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Smartphone,
  X,
  Copy,
  Check,
  AlertTriangle,
  Download,
  ExternalLink,
  Sparkles,
  QrCode as QrIcon,
  HelpCircle,
  ShieldCheck,
  Laptop,
  Share2,
} from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt?: any;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
}) => {
  const [activeTab, setActiveTab] = useState<'pwa' | 'pwabuilder' | 'flutter'>('pwa');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  // App URL for mobile access and building
  const appUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://ais-pre-74t7s5nixuy6qyzxqwegwg-254364297621.europe-west3.run.app';

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(appUrl, {
        width: 320,
        margin: 1.5,
        color: {
          dark: '#0f766e',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error(err));
    }
  }, [isOpen, appUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleTriggerInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
    } else {
      handleCopyLink();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header with Alert Banner */}
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Xir"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-300 bg-teal-950/80 px-2.5 py-0.5 rounded-full border border-teal-700/50 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Xalka Dhabta ah ee Taleefanka
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Maxaa Sababay in APK-gu Furmi Waayo? & Xalka 100% Shaqeynaya
          </h2>
          <p className="text-xs sm:text-sm text-teal-100/90 mt-1.5 leading-relaxed">
            Haddii faylka aad soo dejisay uu taleefanka kuugu soo qoray <b>"There was a problem parsing the package"</b> ama <b>"Faylka ma furmi karo"</b>, halkan ka dooro xalka degdegga ah.
          </p>
        </div>

        {/* Diagnosis Note */}
        <div className="p-4 bg-amber-50 border-b border-amber-200/80 flex items-start gap-3 text-xs sm:text-sm text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <b>Sababta:</b> Nidaamka Android wuxuu u baahan yahay fayl la compile gareeyay oo binary ah (Signed Dalvik/ARM bytecode). Browser-ka kombiyuutarka ma dhisikaro binary la saxiixay si toos ah. Waxaad haysataa <b>3 xal oo dhab ah</b>:
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex-1 py-3 px-3 text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'pwa'
                ? 'border-teal-700 text-teal-800 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>1. Toos Taleefanka (PWA)</span>
          </button>
          <button
            onClick={() => setActiveTab('pwabuilder')}
            className={`flex-1 py-3 px-3 text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'pwabuilder'
                ? 'border-teal-700 text-teal-800 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>2. Dhis APK Dhab ah</span>
          </button>
          <button
            onClick={() => setActiveTab('flutter')}
            className={`flex-1 py-3 px-3 text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'flutter'
                ? 'border-teal-700 text-teal-800 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>3. Flutter Source</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* TAB 1: PWA (Install Directly on Mobile) */}
          {activeTab === 'pwa' && (
            <div className="space-y-4">
              <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <img
                    src="/app-icon.png"
                    alt="Suuqso Pro App Icon"
                    className="w-16 h-16 rounded-2xl shadow-md object-contain ring-2 ring-teal-600/30"
                  />
                  {qrDataUrl && (
                    <div className="bg-white p-2 rounded-xl border border-teal-200 shadow-xs">
                      <img src={qrDataUrl} alt="App QR Code" className="w-24 h-24 object-contain" />
                      <span className="text-[9.5px] text-teal-800 font-bold block text-center mt-0.5">
                        Kamarada ku sawir
                      </span>
                    </div>
                  )}
                </div>
                <div className="space-y-2 text-center sm:text-left flex-1">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-900 bg-teal-100/70 px-2.5 py-1 rounded-md">
                    <Check className="w-3.5 h-3.5 text-teal-700" />
                    Xalka Ugu Fudud & Ugu Degdegsan (10 Ilbiriqsi)
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Ku shubo Taleefanka sida App Rasmi ah (WebAPK)
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    App-ku wuxuu toos ugu shubmayaa taleefankaaga adigoon u baahnayn APK la soo dejiyo ama file dhib ku ah. Wuxuu yeelanayaa calaamad (Icon) shaashadda taleefankaaga, wuxuuna u furmayaa sidii App dhab ah!
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start">
                    {deferredPrompt ? (
                      <button
                        onClick={handleTriggerInstall}
                        className="py-2 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isInstalled ? 'Waa la shubay!' : 'Shub App-ka Hadda'}</span>
                      </button>
                    ) : null}

                    <button
                      onClick={handleCopyLink}
                      className="py-2 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-medium text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Link-gii waa la koobiyey!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Koobiyeey Link-ga</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Instructions by Device */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Android Steps */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    Android (Chrome / Samsung Internet)
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600 leading-relaxed text-[11.5px]">
                    <li>Ku fur link-ga kor ku xusan browser-kaaga Chrome.</li>
                    <li>
                      Riix 3-da dhibcood (<b>⋮</b>) ee geeska sare ama hoose.
                    </li>
                    <li>
                      Dooro <b>"Install app"</b> ama <b>"Add to Home screen" (Ku dar shaashadda)</b>.
                    </li>
                    <li>
                      Guji <b>"Install"</b> — isla markiiba wuxuu noqonayaa App taleefankaaga ku jira!
                    </li>
                  </ol>
                </div>

                {/* iPhone / Safari Steps */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Share2 className="w-4 h-4 text-sky-600" />
                    iPhone (Safari)
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600 leading-relaxed text-[11.5px]">
                    <li>Ku fur link-ga browser-ka Safari ee iPhone-ka.</li>
                    <li>
                      Guji badhanka Share-ka (<b>📤</b>) ee hoose.
                    </li>
                    <li>
                      Hoos u deg oo taabo <b>"Add to Home Screen" (Ku dar shaashadda guriga)</b>.
                    </li>
                    <li>
                      Riix <b>"Add"</b> — Suuqa App wuxuu toos uga soo muuqanayaa shaashaddaada!
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Real APK via PWABuilder */}
          {activeTab === 'pwabuilder' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-teal-400" />
                  <h3 className="text-base font-bold text-white">
                    Dhis APK Dhab ah (100% Signed Android APK via PWABuilder)
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  PWABuilder waa qalab rasmi ah oo ay taageeraan <b>Google & Microsoft</b>. Wuxuu si toos ah link-ga Suuqa App ugu beddelayaa fayl rasmi ah oo <b>.apk</b> ah oo la saxiixay (Signed Release APK) oo taleefan kasta ku furmaya qalad la'aan ama Google Play Store toos loogu diri karo!
                </p>

                <div className="pt-2">
                  <a
                    href={`https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(appUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 py-2.5 px-5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-lg shadow-teal-500/20"
                  >
                    <span>Ku Dhis APK Rasmiga ah PWABuilder.com</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Steps for PWABuilder */}
              <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50 space-y-2 text-xs">
                <h4 className="font-bold text-slate-900">Sida aad ugu dhisan karto 3 tallaabo:</h4>
                <div className="space-y-1.5 text-slate-600 leading-relaxed">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                      1
                    </span>
                    <span>Guji badhanka kor ku xusan si aad u aado PWABuilder.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                      2
                    </span>
                    <span>
                      Riix <b>"Package for Stores"</b> kadibna dooro <b>"Android"</b>.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                      3
                    </span>
                    <span>
                      Guji <b>"Generate APK"</b> — waxaad isla goobta kala soo degaysaa faylka dhabta ah ee <b>.apk</b> oo la saxiixay!
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Flutter Source Code Compilation */}
          {activeTab === 'flutter' && (
            <div className="space-y-4">
              <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50 space-y-3 text-xs">
                <div className="flex items-center gap-2">
                  <Laptop className="w-5 h-5 text-teal-700" />
                  <h3 className="text-base font-bold text-slate-900">
                    Ku Dhis Kombiyuutarkaaga (Flutter CLI & Android Studio)
                  </h3>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Haddii aad tahay software engineer ama aad rabto inaad gacantaada ku dhisto APK-ga dhabta ah ee 20MB ah adigoo isticmaalaya Flutter SDK:
                </p>

                <div className="bg-slate-950 text-slate-200 p-3 rounded-xl font-mono text-[11px] space-y-1 overflow-x-auto">
                  <div className="text-slate-400"># 1. Fur terminal-ka oo soo saar faylka ZIP:</div>
                  <div className="text-teal-300">unzip suuqa_app_flutter_source.zip</div>
                  <div className="text-teal-300">cd suuqa_app</div>
                  <div className="text-slate-400 mt-2"># 2. Soo deji dependencies:</div>
                  <div className="text-teal-300">flutter pub get</div>
                  <div className="text-slate-400 mt-2"># 3. Dhis Release APK-ga dhabta ah:</div>
                  <div className="text-amber-300">flutter build apk --release</div>
                  <div className="text-slate-400 mt-2"># APK-ga wuxuu kaaga soo baxayaa:</div>
                  <div className="text-emerald-400">build/app/outputs/flutter-apk/app-release.apk</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            <span>Suuqa App — Waxaa loo diyaariyay dhammaan taleefannada Android & iOS</span>
          </div>
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer transition-colors"
          >
            Waayahay, Waan Fahmay
          </button>
        </div>
      </div>
    </div>
  );
};
