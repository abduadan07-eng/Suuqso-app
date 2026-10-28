import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import {
  Camera,
  X,
  Flashlight,
  RefreshCw,
  Search,
  Store as StoreIcon,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Store } from '../../types';

interface CameraQrScannerModalProps {
  isOpen: boolean;
  stores: Store[];
  onClose: () => void;
  onStoreSelected: (store: Store) => void;
}

export const CameraQrScannerModal: React.FC<CameraQrScannerModalProps> = ({
  isOpen,
  stores,
  onClose,
  onStoreSelected,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCamera, setHasCamera] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');
  const [manualCode, setManualCode] = useState<string>('');
  const [detectedStore, setDetectedStore] = useState<Store | null>(null);

  // Initialize camera stream
  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationFrameId: number;

    if (!isOpen || activeTab !== 'camera') {
      return;
    }

    const startCamera = async () => {
      try {
        setCameraError('');
        setHasCamera(true);

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Kamarada lama heli karo biraawsarkan.');
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // rear camera on mobile
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true'); // Required for iOS Safari
          await videoRef.current.play();
          scanFrame();
        }
      } catch (err: any) {
        console.warn('Camera access issue:', err);
        setHasCamera(false);
        setCameraError(
          err.name === 'NotAllowedError'
            ? 'Oggolaanshaha kamarada waa la diiday. Fadlan oggolow kamarada ama isticmaal tab-ka qorista lambarka.'
            : 'Kamarada lama heli karo. Waxaad isticmaali kartaa qorista lambarka dukaanka.'
        );
        setActiveTab('manual');
      }
    };

    const scanFrame = () => {
      if (!isScanning) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data) {
            handleDecodedString(code.data);
            return;
          }
        }
      }

      animationFrameId = requestAnimationFrame(scanFrame);
    };

    startCamera();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, activeTab, isScanning]);

  // Decode QR string to find matched store
  const handleDecodedString = (scannedText: string) => {
    setIsScanning(false);

    let matched: Store | undefined;

    // Check if it's a URL with store or code params
    try {
      if (scannedText.includes('?')) {
        const url = new URL(
          scannedText.startsWith('http')
            ? scannedText
            : `https://dummy.com/${scannedText}`
        );
        const storeId = url.searchParams.get('store');
        const code = url.searchParams.get('code');

        matched = stores.find(
          (s) =>
            (storeId && s.id === storeId) ||
            (code && s.storeCode.toLowerCase() === code.toLowerCase())
        );
      }
    } catch {
      // not a url
    }

    // Direct code match (e.g. DUK-101)
    if (!matched) {
      const cleanText = scannedText.trim().toLowerCase();
      matched = stores.find(
        (s) =>
          s.storeCode.toLowerCase() === cleanText ||
          s.id.toLowerCase() === cleanText ||
          s.name.toLowerCase().includes(cleanText)
      );
    }

    if (matched) {
      setDetectedStore(matched);
      try {
        if (navigator.vibrate) navigator.vibrate(100);
      } catch {}
      setTimeout(() => {
        onStoreSelected(matched!);
        onClose();
      }, 1000);
    } else {
      alert(`QR Code waa la helay: "${scannedText}", laakiin ma jiro dukaan u diiwaangashan.`);
      setIsScanning(true);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    const clean = manualCode.trim().toLowerCase();
    const found = stores.find(
      (s) =>
        s.storeCode.toLowerCase() === clean ||
        s.id.toLowerCase() === clean ||
        s.name.toLowerCase().includes(clean)
    );

    if (found) {
      onStoreSelected(found);
      onClose();
    } else {
      alert(`Ma jiro dukaan lambarkiisu yahay "${manualCode.trim()}".`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in select-none">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Sawir QR Code-ka Dukaanka</h3>
              <p className="text-[11px] text-slate-400">Ku aadi kamarada QR code kasta</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab('camera');
              setIsScanning(true);
            }}
            className={`flex-1 py-2.5 px-3 text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'camera'
                ? 'border-teal-700 text-teal-800 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Kamarada Taleefanka</span>
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2.5 px-3 text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'manual'
                ? 'border-teal-700 text-teal-800 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Qor Aqoonsiga (Code)</span>
          </button>
        </div>

        {/* Camera View Area */}
        {activeTab === 'camera' && (
          <div className="relative bg-black flex-1 min-h-[340px] flex items-center justify-center overflow-hidden">
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              muted
              playsInline
              onError={(e) => {
                e.preventDefault();
              }}
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Target Reticle Frame */}
            <div className="relative z-10 w-64 h-64 border-2 border-teal-400/80 rounded-3xl flex items-center justify-center shadow-2xl">
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-teal-400 rounded-tl-2xl -mt-1 -ml-1" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-teal-400 rounded-tr-2xl -mt-1 -mr-1" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-teal-400 rounded-bl-2xl -mb-1 -ml-1" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-teal-400 rounded-br-2xl -mb-1 -mr-1" />

              {/* Animated Scan Line */}
              <div className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-teal-400 via-amber-400 to-teal-400 shadow-lg shadow-teal-400/50 animate-pulse" />

              <span className="text-[11px] text-white/90 bg-black/60 px-3 py-1 rounded-full font-medium">
                Ku beeg QR Code-ka gudaha
              </span>
            </div>

            {/* Success Overlay */}
            {detectedStore && (
              <div className="absolute inset-0 z-20 bg-teal-900/90 flex flex-col items-center justify-center p-6 text-white text-center animate-in fade-in">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-3" />
                <h4 className="text-lg font-black">{detectedStore.name}</h4>
                <p className="text-xs text-teal-200 mt-1 font-mono">
                  Aqoonsiga: {detectedStore.storeCode}
                </p>
                <span className="text-xs text-emerald-300 mt-2 font-bold">
                  Waa la helay! Waa lagu wareejinayaa...
                </span>
              </div>
            )}
          </div>
        )}

        {/* Manual Code Input Tab */}
        {activeTab === 'manual' && (
          <div className="p-5 space-y-4">
            {cameraError && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{cameraError}</span>
              </div>
            )}

            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Geli Aqoonsiga Dukaanka (Tusaale: DUK-101):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="DUK-101"
                    className="flex-1 py-2.5 px-3.5 rounded-xl border border-slate-300 focus:outline-teal-700 text-sm font-mono uppercase"
                  />
                  <button
                    type="submit"
                    className="py-2.5 px-4 bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Gal Dukaanka
                  </button>
                </div>
              </div>
            </form>

            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Ama dooro dukaamada diiwaangashan:
              </span>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {stores.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      onStoreSelected(s);
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 flex items-center justify-between text-left transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 font-bold flex items-center justify-center text-xs">
                        {s.avatar || s.name.substring(0, 2)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{s.name}</div>
                        <div className="text-[10px] text-slate-500">{s.city}</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded">
                      {s.storeCode}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500">
          Suuqa App QR Scanner — Si toos ah ugu wareeg dukaanka adigoo kamarada isticmaalaya
        </div>
      </div>
    </div>
  );
};
