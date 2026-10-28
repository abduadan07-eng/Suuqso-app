import React from 'react';
import { WifiOff, Wifi, CheckCircle2 } from 'lucide-react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export const OfflineBanner: React.FC = () => {
  const { isOnline, wasOffline } = useNetworkStatus();

  if (isOnline && !wasOffline) return null;

  return (
    <aside aria-label="Xaaladda Khadka" className="relative z-40">
      {!isOnline && (
        <div className="bg-amber-600 text-white px-3 sm:px-4 py-2 text-xs font-semibold shadow-md flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
            <WifiOff className="w-4 h-4 shrink-0 text-amber-200" />
            <div className="flex-1 flex flex-wrap items-center gap-1.5">
              <span className="font-bold bg-amber-800/80 px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">
                Khad La'aan (Offline Mode)
              </span>
              <span>
                App-ku wuu shaqeynayaa! Waxaad baari kartaa dukaamada, alaabta, iyo dalabaadkaaga oo taleefanka ku kaydsan.
              </span>
            </div>
          </div>
        </div>
      )}

      {isOnline && wasOffline && (
        <div className="bg-emerald-600 text-white px-3 sm:px-4 py-2 text-xs font-semibold shadow-md flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
            <Wifi className="w-4 h-4 shrink-0 text-emerald-200" />
            <div className="flex-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
              <span>
                <b>Khadkii dib ayuu ugu xirmay (Online)</b> — App-ku wuxuu si caadi ah ugu xiran yahay adeegyada internet-ka.
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
