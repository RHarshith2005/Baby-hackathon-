import React, { useEffect } from 'react';
import { usePingletStore, dismissNewStampToast } from '../store/pingletStore';
import { PASSPORT_STAMPS } from '../store/pingletStoreRules';
import { Sparkles, X } from 'lucide-react';

export const StampToast: React.FC = React.memo(() => {
  const { newlyAwardedStamp } = usePingletStore();

  useEffect(() => {
    if (!newlyAwardedStamp) return;
    const timer = window.setTimeout(() => {
      dismissNewStampToast();
    }, 4500);
    return () => window.clearTimeout(timer);
  }, [newlyAwardedStamp]);

  if (!newlyAwardedStamp) return null;

  const stamp = PASSPORT_STAMPS.find((s) => s.id === newlyAwardedStamp);
  if (!stamp) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-20 right-4 z-50 max-w-sm bg-[#FFF8EE] text-[#1B1B3A] border-3 border-[#1B1B3A] rounded-2xl p-3.5 shadow-2xl flex items-center gap-3 animate-slide-in pointer-events-auto"
    >
      <div
        className="w-11 h-11 rounded-xl border-2 border-[#1B1B3A] flex items-center justify-center text-2xl shrink-0"
        style={{ backgroundColor: stamp.color }}
      >
        {stamp.icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 text-[10px] font-mono-retro font-bold text-[#E86FA0] uppercase tracking-wider">
          <Sparkles className="w-3 h-3" />
          <span>New Passport Stamp!</span>
        </div>
        <p className="font-rounded font-bold text-sm text-[#1B1B3A] truncate">
          {stamp.name}
        </p>
        <p className="font-rounded text-[11px] text-[#523B8A] truncate">
          {stamp.hint}
        </p>
      </div>

      <button
        type="button"
        onClick={dismissNewStampToast}
        className="min-h-[48px] min-w-[48px] -mr-2 text-[#1B1B3A] hover:bg-[#1B1B3A]/10 rounded-full flex items-center justify-center cursor-pointer"
        aria-label="Dismiss new stamp alert"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
});

StampToast.displayName = 'StampToast';
