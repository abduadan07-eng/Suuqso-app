import React, { useState, useEffect } from 'react';
import {
  Download,
  Terminal,
  FileCode,
  Check,
  Copy,
  FolderArchive,
  ArrowRight,
  Sparkles,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  QrCode as QrIcon,
  Laptop,
  CheckCircle2,
  Share2,
  Layers,
  Cpu,
  Zap,
  Package,
  HardDrive,
  FolderTree,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import QRCode from 'qrcode';
import {
  FLUTTER_PROJECT_FILES,
  generateFlutterProjectZip,
  downloadFile,
  FlutterSourceFile,
} from '../../data/flutterCodeBundle';
import { InstallAppModal } from '../common/InstallAppModal';

export const ApkExportHub: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<FlutterSourceFile>(
    FLUTTER_PROJECT_FILES[0]
  );
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [showTroubleshootModal, setShowTroubleshootModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'zip_download' | 'native_apk' | 'pwa_install' | 'source_files'>('zip_download');

  const appUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://ais-pre-74t7s5nixuy6qyzxqwegwg-254364297621.europe-west3.run.app';

  useEffect(() => {
    QRCode.toDataURL(appUrl, {
      width: 280,
      margin: 1.5,
      color: {
        dark: '#0f766e',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error(err));
  }, [appUrl]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2200);
  };

  const handleDirectZipDownload = () => {
    const link = document.createElement('a');
    link.href = '/suuqa_app_production.zip';
    link.download = 'suuqa_app_production.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {
      // safe
    }
  };

  const handleDownloadFlutterZip = async () => {
    setIsZipping(true);
    try {
      const zipBlob = await generateFlutterProjectZip();
      downloadFile(zipBlob, 'suuqa_app_flutter_source.zip');
      try {
        confetti({
          particleCount: 110,
          spread: 75,
          origin: { y: 0.6 },
        });
      } catch {
        // safe
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsZipping(false);
    }
  };

  const capacitorConfigSnippet = `{
  "appId": "com.suuqa.app",
  "appName": "Suuqa App",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "server": {
    "androidScheme": "https"
  },
  "android": {
    "allowMixedContent": true,
    "captureInput": true,
    "webContentsDebuggingEnabled": false
  }
}`;

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto px-4 sm:px-6 select-none animate-in fade-in">
      {/* Top Banner: Explains Android Parsing and Immediate Production Solutions */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 border border-teal-700/60 p-5 sm:p-6 shadow-xl text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-lg">
              <Package className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-600/60">
                  Folder & ZIP Dhameystiran
                </span>
                <span className="text-xs text-teal-200">Production Ready · 3.28 MB</span>
              </div>
              <h2 className="text-base sm:text-xl font-black text-white mt-1">
                Faylka Mashruuca oo Buuxa & Xarunta Dhisidda APK
              </h2>
              <p className="text-xs text-teal-100/90 mt-1 max-w-2xl leading-relaxed">
                Waxaad halkan toos ugala degi kartaa dhammaan folder-ka mashruuca oo ZIP ah, koodhka TypeScript, habeynta Capacitor Android APK, iyo habka tooska ah ee taleefanka loogu shubto bilaa cilad.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
            <button
              onClick={handleDirectZipDownload}
              className="w-full md:w-auto py-3 px-5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Degso ZIP Buuxa (3.28 MB)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero Showcase with Phone Preview & Direct Installation */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-white p-6 sm:p-10 shadow-2xl border border-teal-800/40 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Details */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-teal-300 bg-teal-950/80 px-3 py-1 rounded-full border border-teal-700/60 shadow-inner">
                Android APK & Web Production Studio
              </span>
              <span className="text-xs text-emerald-300 font-semibold bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-700/40 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Diyaar u ah Shaqo Dhab ah
              </span>
              <span className="text-xs text-sky-300 font-semibold bg-sky-950/60 px-2.5 py-0.5 rounded-full border border-sky-700/40 flex items-center gap-1">
                <Zap className="w-3 h-3 text-sky-400" />
                100% Offline (Khad La'aan)
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Suuqso Pro - Xirmooyinka APK & Mashruuca
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
              Nidaam buuxa oo suuq Soomaaliyeed ah oo leh lacag-bixinta mobaylada (EVC Plus, Zaad, eDahab, Sahal), hubinta TxID ee khasnajiga, iyo shaqo buuxda oo khad la'aan ah (Offline PWA & Native APK).
            </p>

            {/* Quick Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <span className="text-teal-400 font-bold block text-sm">v1.2.0</span>
                <span className="text-[11px] text-slate-400">Release Version</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <span className="text-amber-400 font-bold block text-sm">Capacitor 6</span>
                <span className="text-[11px] text-slate-400">Android 14+ Ready</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <span className="text-sky-400 font-bold block text-sm">Offline PWA</span>
                <span className="text-[11px] text-slate-400">Shaqo Bilaa Khad</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <span className="text-emerald-400 font-bold block text-sm">4.81 MB ZIP</span>
                <span className="text-[11px] text-slate-400">Dhammaan Faylasha</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleDirectZipDownload}
                className="py-3 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-amber-500/25 transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Degso ZIP Buuxa (.zip)</span>
              </button>

              <button
                onClick={() => setShowTroubleshootModal(true)}
                className="py-3 px-5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>Toos Taleefanka Ugu Shub</span>
              </button>

              <a
                href={`https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(appUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium text-xs sm:text-sm flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>PWABuilder Signed APK</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>
            </div>
          </div>

          {/* Right Column: Visual Smartphone Mockup with Live QR */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-64 sm:w-72 rounded-[2.5rem] bg-slate-900 p-3 shadow-2xl border-4 border-slate-700/80 shadow-teal-950/60 ring-1 ring-white/20">
              {/* Camera Notch */}
              <div className="w-24 h-4 bg-black rounded-full mx-auto mb-2 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-slate-800 mr-2" />
                <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              </div>

              {/* Phone Screen Mockup Content */}
              <div className="bg-gradient-to-b from-slate-900 via-sky-950 to-black rounded-[2rem] p-4 text-white overflow-hidden text-center space-y-3">
                <img
                  src="/app-icon.png"
                  alt="Suuqso Pro Icon"
                  className="w-14 h-14 rounded-2xl mx-auto shadow-lg object-contain ring-1 ring-white/20"
                />

                <div>
                  <h4 className="text-sm font-extrabold text-white">Suuqso Pro APK</h4>
                  <p className="text-[10px] text-sky-300">Ku sawir kamarada taleefankaaga</p>
                </div>

                {/* QR Code inside phone */}
                <div className="bg-white p-2.5 rounded-2xl shadow-lg border border-teal-500/30 inline-block mx-auto">
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="Live QR" className="w-36 h-36 object-contain" />
                  ) : (
                    <div className="w-36 h-36 flex items-center justify-center text-slate-400 text-xs">
                      Loading QR...
                    </div>
                  )}
                </div>

                <div className="text-[10.5px] text-slate-300 leading-snug px-2">
                  Kamarada ku aadi si aad taleefankaaga ugu furto oo aad ugu shubato!
                </div>

                <button
                  onClick={handleCopyLink}
                  className="w-full py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-teal-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {linkCopied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Link-gii waa la qaatay!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Nuqul Link-ga</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Production Navigation Tabs */}
      <div className="flex border-b border-slate-200 text-xs sm:text-sm font-bold gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('zip_download')}
          className={`py-3 px-4 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'zip_download'
              ? 'border-teal-700 text-teal-900 bg-teal-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FolderArchive className="w-4 h-4 text-amber-500" />
          <span>Faylka ZIP ee Mashruuca (Full Source)</span>
        </button>

        <button
          onClick={() => setActiveTab('native_apk')}
          className={`py-3 px-4 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'native_apk'
              ? 'border-teal-700 text-teal-900 bg-teal-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Terminal className="w-4 h-4 text-teal-700" />
          <span>Dhisidda Native Android APK (Capacitor)</span>
        </button>

        <button
          onClick={() => setActiveTab('pwa_install')}
          className={`py-3 px-4 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'pwa_install'
              ? 'border-teal-700 text-teal-900 bg-teal-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Smartphone className="w-4 h-4 text-emerald-600" />
          <span>Toos Taleefanka Ugu Shub (PWA / WebAPK)</span>
        </button>

        <button
          onClick={() => setActiveTab('source_files')}
          className={`py-3 px-4 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'source_files'
              ? 'border-teal-700 text-teal-900 bg-teal-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileCode className="w-4 h-4 text-slate-600" />
          <span>Koodhadhka Flutter & Configs</span>
        </button>
      </div>

      {/* TAB 1: Complete Project ZIP Download & Inspection */}
      {activeTab === 'zip_download' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  Fayl Diyaarsan oo Dhameystiran
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-2">
                  Soo Deji Folder-ka iyo Xirmada ZIP ee Mashruuca
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
                  Faylkan ZIP wuxuu xambaarsan yahay dhammaan faylasha mashruuca, koodhka React 19, TypeScript, qaabeynta Android APK (Capacitor), buugga daabacaadda (README), iyo astaamaha mobilka.
                </p>
              </div>

              <button
                onClick={handleDirectZipDownload}
                className="py-3 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer shrink-0"
              >
                <Download className="w-5 h-5 stroke-[2.5]" />
                <span>Degso Faylka (suuqa_app_production.zip)</span>
              </button>
            </div>

            {/* Folder Structure Breakdown */}
            <div className="bg-slate-900 text-slate-200 rounded-2xl p-5 font-mono text-xs space-y-3">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                <span className="font-sans font-bold text-white flex items-center gap-2">
                  <FolderTree className="w-4 h-4 text-teal-400" />
                  Qaab-dhismeedka Folder-ka Gudaha ZIP-ka:
                </span>
                <span className="text-[11px] text-teal-300">3.28 MB · Deflated</span>
              </div>

              <div className="space-y-1.5 text-[11px] text-slate-300 leading-relaxed overflow-x-auto">
                <p className="text-amber-300 font-bold">📦 suuqa-app-production/</p>
                <p className="pl-4">├── 📁 <b>src/</b> <span className="text-slate-500">(Koodhka React, Components, Shaashadaha, Xisaabaadka)</span></p>
                <p className="pl-4">│   ├── 📁 <b>components/screens/</b> <span className="text-slate-500">(Customer, Store Admin, Cashier Desk, Super Admin)</span></p>
                <p className="pl-4">│   ├── 📁 <b>components/apk/</b> <span className="text-slate-500">(Xarunta APK & Daabacaadda)</span></p>
                <p className="pl-4">│   ├── 📁 <b>data/</b> <span className="text-slate-500">(Dukaamada, Lacagaha, Flutter bundle)</span></p>
                <p className="pl-4">│   └── 📁 <b>types/</b> <span className="text-slate-500">(Nidaamka TypeScript, TxID, StorePaymentConfig)</span></p>
                <p className="pl-4">├── 📁 <b>public/</b> <span className="text-slate-500">(Astaamaha mobilka, pwa-192x192, pwa-512x512, favicon)</span></p>
                <p className="pl-4">├── 📄 <b>capacitor.config.json</b> <span className="text-teal-300 font-bold">(Xiraha tooska ah ee Android APK)</span></p>
                <p className="pl-4">├── 📄 <b>README_ANDROID_BUILD.md</b> <span className="text-teal-300 font-bold">(Hagaha dhisidda APK ee Android Studio)</span></p>
                <p className="pl-4">├── 📄 <b>package.json</b> <span className="text-slate-500">(Xirmooyinka iyo amarrada: dev, build, package:zip)</span></p>
                <p className="pl-4">├── 📄 <b>vite.config.ts</b> <span className="text-slate-500">(Qaabeynta Vite iyo PWA Service Worker)</span></p>
                <p className="pl-4">└── 📄 <b>index.html</b> <span className="text-slate-500">(Bogga hore ee mobilka iyo meta tags-ka)</span></p>
              </div>
            </div>

            {/* Quick How to Use */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="w-6 h-6 rounded-full bg-teal-800 text-white font-bold text-xs flex items-center justify-center">1</span>
                <h4 className="font-bold text-xs text-slate-900">Kala Bixi ZIP-ka</h4>
                <p className="text-[11px] text-slate-600">Guji midigta faylka <b>suuqa_app_production.zip</b> oo dooro <i>"Extract All"</i> kombiyuutarkaaga.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="w-6 h-6 rounded-full bg-teal-800 text-white font-bold text-xs flex items-center justify-center">2</span>
                <h4 className="font-bold text-xs text-slate-900">Ku Kici Kombiyuutarka</h4>
                <p className="text-[11px] text-slate-600">Fur terminal-ka folder-ka dhexdiisa oo qor <code className="bg-slate-200 px-1 rounded text-teal-800">npm install</code> kaddibna <code className="bg-slate-200 px-1 rounded text-teal-800">npm run dev</code>.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="w-6 h-6 rounded-full bg-teal-800 text-white font-bold text-xs flex items-center justify-center">3</span>
                <h4 className="font-bold text-xs text-slate-900">U Beddel APK</h4>
                <p className="text-[11px] text-slate-600">Raac amarrada tab-ka <b>"Dhisidda Native Android APK"</b> si aad uga hesho faylka <b>.apk</b>.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Native Android APK Build (Capacitor & Android Studio) */}
      {activeTab === 'native_apk' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
              <Terminal className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Amarrada Dhabta ah ee Dhisidda Native Android APK
              </h3>
              <p className="text-xs text-slate-500">
                Adeegso Capacitor iyo Android Studio si aad u hesho faylka rasmiga ah ee <b>.apk</b> ama <b>.aab</b>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="bg-slate-950 text-slate-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-teal-400">Tallaabada 1: Dhis Koodhka Web-ka (Build dist/)</span>
                <button
                  onClick={() => handleCopy('npm run build', 'cmd-1')}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded text-slate-300 font-mono text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  {copiedCmd === 'cmd-1' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCmd === 'cmd-1' ? 'Waa la koobiyey' : 'Koobiyeey'}</span>
                </button>
              </div>
              <pre className="font-mono text-xs text-slate-300 overflow-x-auto">npm run build</pre>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-950 text-slate-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-teal-400">Tallaabada 2: Ku Dar Xirmooyinka Capacitor & Madasha Android</span>
                <button
                  onClick={() => handleCopy('npm install @capacitor/core @capacitor/cli @capacitor/android && npx cap add android', 'cmd-2')}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded text-slate-300 font-mono text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  {copiedCmd === 'cmd-2' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCmd === 'cmd-2' ? 'Waa la koobiyey' : 'Koobiyeey'}</span>
                </button>
              </div>
              <pre className="font-mono text-xs text-slate-300 overflow-x-auto">npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap add android</pre>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-950 text-slate-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-teal-400">Tallaabada 3: Waafaji Faylasha (Sync)</span>
                <button
                  onClick={() => handleCopy('npx cap sync', 'cmd-3')}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded text-slate-300 font-mono text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  {copiedCmd === 'cmd-3' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCmd === 'cmd-3' ? 'Waa la koobiyey' : 'Koobiyeey'}</span>
                </button>
              </div>
              <pre className="font-mono text-xs text-slate-300 overflow-x-auto">npx cap sync</pre>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-950 text-slate-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-teal-400">Tallaabada 4: Ku Fur Android Studio & Soo Saaro .APK</span>
                <button
                  onClick={() => handleCopy('npx cap open android', 'cmd-4')}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded text-slate-300 font-mono text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  {copiedCmd === 'cmd-4' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCmd === 'cmd-4' ? 'Waa la koobiyey' : 'Koobiyeey'}</span>
                </button>
              </div>
              <pre className="font-mono text-xs text-slate-300 overflow-x-auto">npx cap open android</pre>
            </div>

            {/* Android Studio Visual Instructions */}
            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-teal-950 space-y-2">
              <div className="font-bold flex items-center gap-2 text-teal-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Gudaha Android Studio markuu furmo:
              </div>
              <ol className="list-decimal pl-5 space-y-1 text-slate-700">
                <li>Guji menu-ga sare: <b>Build</b> ➔ <b>Build Bundle(s) / APK(s)</b> ➔ <b>Build APK(s)</b>.</li>
                <li>Sug inta Gradle uu dhameystirayo dhisidda (qiyaastii 60 ilbiriqsi).</li>
                <li>Marka uu dhameeyo wuxuu soo bandhigayaa fariin: <i>APK(s) generated successfully</i>.</li>
                <li>Guji <b>locate</b> si aad u hesho faylka <b>app-debug.apk</b> ama <b>app-release.apk</b>.</li>
                <li>U dir taleefankaaga, wuuna furmayaa bilaa wax qalad ah!</li>
              </ol>
            </div>

            {/* Capacitor Config preview */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Faylka Diyaarsan ee <code>capacitor.config.json</code>:</span>
                <button
                  onClick={() => handleCopy(capacitorConfigSnippet, 'cmd-cap')}
                  className="px-2 py-1 bg-white border border-slate-300 rounded text-slate-700 text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  {copiedCmd === 'cmd-cap' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>Koobiyeey</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-900 text-teal-300 font-mono text-[11px] rounded-xl overflow-x-auto">
                {capacitorConfigSnippet}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PWA / WebAPK Instant Install */}
      {activeTab === 'pwa_install' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Toos Taleefanka Ugu Shub (PWA / WebAPK - 0 Parse Error)
              </h3>
              <p className="text-xs text-slate-500">
                Xalka ugu degdegsan uguna kalsoonida badan ee macaamiisha iyo dukaamada
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="font-bold text-teal-800 flex items-center gap-2 text-sm">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                1. Taleefannada Android (Google Chrome)
              </div>
              <ol className="list-decimal pl-5 space-y-2 text-slate-600 leading-relaxed">
                <li>Ka fur link-ga app-ka taleefankaaga Chrome: <br /><b className="text-teal-800 font-mono">{appUrl}</b></li>
                <li>Riix 3-da dhibcood ee geeska sare (<b>⋮</b>).</li>
                <li>Dooro <b>«Install app»</b> ama <b>«Ku dar Shaashadda Guriga (Add to Home screen)»</b>.</li>
                <li>App-ku wuxuu isla markiiba kaga soo baxayaa shaashadda taleefankaaga oo leh astaanta Suuqa App!</li>
              </ol>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="font-bold text-teal-800 flex items-center gap-2 text-sm">
                <Laptop className="w-4 h-4 text-teal-600" />
                2. Taleefannada Apple iPhone (Safari)
              </div>
              <ol className="list-decimal pl-5 space-y-2 text-slate-600 leading-relaxed">
                <li>Ka fur Safari link-ga app-ka.</li>
                <li>Riix badhanka wadaagga ee hoose (<b>Share / Qori fallaar leh</b>).</li>
                <li>Hoos u deg oo dooro <b>«Add to Home Screen»</b>.</li>
                <li>Riix <b>«Add»</b>. App-ku wuxuu ku shubmayaa iPhone-kaaga sida app caadi ah.</li>
              </ol>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0" />
              <p className="text-teal-950 font-medium">
                Ma doonaysaa in aad taleefankaaga hadda toos ugu shubato? Fur daaqadda hagaha oo raac tallaabooyinka.
              </p>
            </div>
            <button
              onClick={() => setShowTroubleshootModal(true)}
              className="py-2.5 px-5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold cursor-pointer shrink-0"
            >
              Fur Daaqadda Shubashada
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: Source Files Inspector & Flutter */}
      {activeTab === 'source_files' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-teal-700" />
                  Koodhadhkii Mashruuca (Flutter Dart, Capacitor & Android XML)
                </h3>
                <p className="text-xs text-slate-500">
                  Dhammaan faylasha diyaar u ah daabacaadda iyo dhisidda
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadFlutterZip}
                  disabled={isZipping}
                  className="py-1.5 px-3 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-teal-200"
                >
                  <FolderArchive className="w-3.5 h-3.5" />
                  <span>{isZipping ? 'Diyaarinta...' : 'Degso Flutter ZIP'}</span>
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedFile.content);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Waa la koobiyey!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Koobiyeey Koodhka</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
              {FLUTTER_PROJECT_FILES.map((file) => (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`px-3 py-1.5 rounded-xl font-mono whitespace-nowrap transition-colors cursor-pointer ${
                    selectedFile.path === file.path
                      ? 'bg-slate-900 text-white font-medium shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {file.path.split('/').pop()}
                </button>
              ))}
            </div>
          </div>

          <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span>
              <b>Faylka:</b> <code className="font-mono text-teal-800">{selectedFile.path}</code>
            </span>
            <span className="text-slate-400 text-[11px]">{selectedFile.description}</span>
          </div>

          <div className="p-4 bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto max-h-[380px]">
            <pre>{selectedFile.content}</pre>
          </div>
        </div>
      )}

      {/* Troubleshooting Modal */}
      <InstallAppModal
        isOpen={showTroubleshootModal}
        onClose={() => setShowTroubleshootModal(false)}
      />
    </div>
  );
};
