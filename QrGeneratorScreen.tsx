import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Download,
  Copy,
  Check,
  ArrowLeft,
  Store as StoreIcon,
  Sparkles,
  ExternalLink,
  Printer,
  RefreshCw,
} from 'lucide-react';
import { Store, ScreenType } from '../../types';

interface QrGeneratorScreenProps {
  stores: Store[];
  onOpenStoreProfile: (store: Store) => void;
  onNavigate: (screen: ScreenType) => void;
}

export const QrGeneratorScreen: React.FC<QrGeneratorScreenProps> = ({
  stores,
  onOpenStoreProfile,
  onNavigate,
}) => {
  const [selectedStoreId, setSelectedStoreId] = useState<string>(
    stores[0]?.id || ''
  );
  const [customCode, setCustomCode] = useState<string>('');
  const [useCustomCode, setUseCustomCode] = useState<boolean>(false);
  const [qrColor, setQrColor] = useState<string>('#042F2E'); // Deep Teal
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const activeStore = stores.find((s) => s.id === selectedStoreId) || stores[0];

  const currentStoreCode = useCustomCode
    ? customCode.trim().toUpperCase() || 'DUK-101'
    : activeStore?.storeCode || 'DUK-101';

  const liveBaseUrl =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://ais-pre-74t7s5nixuy6qyzxqwegwg-254364297621.europe-west3.run.app';

  const fullStoreUrl = `${liveBaseUrl}/?store=${encodeURIComponent(activeStore?.id || 'store-1')}&code=${encodeURIComponent(currentStoreCode)}`;

  useEffect(() => {
    if (!currentStoreCode) return;
    QRCode.toDataURL(fullStoreUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: qrColor,
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR generation error:', err));
  }, [fullStoreUrl, qrColor, currentStoreCode]);

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${currentStoreCode}_QR_Code.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullStoreUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const colorOptions = [
    { name: 'Teal (Asalka)', hex: '#042F2E' },
    { name: 'Madow (Classic)', hex: '#0F172A' },
    { name: 'Cagaar (Emerald)', hex: '#065F46' },
    { name: 'Buluug (Royal)', hex: '#1E3A8A' },
  ];

  return (
    <div className="min-h-full pb-20 bg-slate-50 text-slate-900 select-none">
      {/* Top Header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('customer_home')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-teal-700" />
              Soo Saaraha QR Code (QR Generator)
            </h2>
            <span className="text-[11px] text-slate-500">
              U samee dukaan kasta QR Code uu macmiilku ku soo galo
            </span>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
          title="Daabac Kaarka Dukaanka"
        >
          <Printer className="w-3.5 h-3.5 text-teal-700" />
          <span className="hidden sm:inline">Daabac Flyer</span>
        </button>
      </div>

      <div className="p-4 max-w-xl mx-auto space-y-5">
        {/* Selection Control Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-800">
              Doorashada Dukaanka ama Aqoonsiga
            </span>
            <div className="flex items-center gap-2 text-xs">
              <label className="flex items-center gap-1 text-[11px] text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCustomCode}
                  onChange={(e) => setUseCustomCode(e.target.checked)}
                  className="accent-teal-700 rounded"
                />
                <span>Geli ID Custom ah</span>
              </label>
            </div>
          </div>

          {!useCustomCode ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dooro Dukaanka:
              </label>
              <select
                value={selectedStoreId}
                onChange={(e) => setSelectedStoreId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-teal-600 focus:outline-none bg-white font-medium"
              >
                {stores.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.storeCode}) - {st.adminName}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Geli Aqoonsiga Dukaanka (Store Code):
              </label>
              <input
                type="text"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                placeholder="Tusaale: DUK-245 ama DUK-888"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-teal-600 focus:outline-none bg-white font-mono uppercase"
              />
            </div>
          )}

          {/* Color Chooser */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Dooro Midabka QR Code-ka:
            </label>
            <div className="flex items-center gap-2">
              {colorOptions.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setQrColor(c.hex)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                    qrColor === c.hex
                      ? 'border-teal-600 bg-teal-50 text-teal-950 font-bold shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/10"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Big Preview Stand Card (Printable Store Plaque) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md text-center space-y-4">
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-teal-800 text-white flex items-center justify-center font-bold text-lg mb-2 shadow-sm">
              {activeStore?.avatar || currentStoreCode.substring(0, 3)}
            </div>
            <h3 className="text-base font-extrabold text-slate-900">
              {useCustomCode ? `Dukaanka ${currentStoreCode}` : activeStore?.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ku sawir kaamirada taleefankaaga si aad u gasho dukaanka
            </p>
            <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-0.5 rounded-full mt-2">
              Aqoonsiga: {currentStoreCode}
            </span>
          </div>

          {/* Rendered QR Code */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block shadow-inner mx-auto">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`${currentStoreCode} QR`}
                className="w-56 h-56 sm:w-64 sm:h-64 rounded-xl bg-white p-2 shadow-sm"
              />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs">
                Diyaarinta QR Code...
              </div>
            )}
            <span className="text-[11px] text-slate-400 font-mono mt-2 block">
              {fullStoreUrl}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            {!useCustomCode && activeStore && (
              <button
                onClick={() => onOpenStoreProfile(activeStore)}
                className="w-full py-2.5 px-4 rounded-xl bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Toos u Gal Dukaankan Hadda (Macmiil ahaan)</span>
              </button>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleDownloadQr}
                className="py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-teal-700" />
                <span>Soo Deji Sawirka (PNG)</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-600">Waa la qaatay!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-teal-700" />
                    <span>Nuqul Link-ga</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Helpful Explanation */}
        <div className="p-4 bg-teal-50 border border-teal-200/80 rounded-2xl text-xs text-teal-950 space-y-1">
          <span className="font-bold block">Sida Loogu Isticmaalo Dukaankaaga:</span>
          <p className="text-teal-900 leading-relaxed text-[11px]">
            QR code-kan waxaad ku dhejin kartaa albaabka dukaankaaga, miiska lacag-qabashada (cashier counter), ama baakada alaabtaada. Macmiil kasta oo sawira wuxuu toos ugu soo dhacayaa bogga dukaankaaga isagoo dalban kara isla markaana follow dhihi kara.
          </p>
        </div>
      </div>
    </div>
  );
};
