import React from 'react';
import { usePingletStore } from '../store/pingletStore';
import { PASSPORT_STAMPS } from '../store/pingletStoreRules';
import { audioSystem } from '../utils/audioSynth';

interface PassportFloatingButtonProps {
  onOpen: () => void;
}

export const PassportFloatingButton: React.FC<PassportFloatingButtonProps> = React.memo(({ onOpen }) => {
  const { collectedStamps } = usePingletStore();
  const collectedCount = collectedStamps.length;
  const totalCount = PASSPORT_STAMPS.length;

  const handleClick = () => {
    audioSystem.playTone(659.25, 0.08, 'triangle');
    onOpen();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Open Courier Passport, ${collectedCount} of ${totalCount} stamps unlocked`}
      className="fixed bottom-5 left-4 z-30 min-h-[48px] min-w-[48px] px-3.5 py-2 rounded-full bg-[#1B1B3A] text-[#FFF8EE] border-2 border-white shadow-xl hover:bg-[#282854] active:scale-95 transition-all flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#9FF3D3]"
    >
      <span className="text-xl" aria-hidden="true">
        📖
      </span>
      <span className="font-rounded font-bold text-xs uppercase hidden sm:inline">
        Passport
      </span>
      <span className="px-2 py-0.5 rounded-full bg-[#9FF3D3] text-[#1B1B3A] font-mono-retro font-bold text-[11px]">
        {collectedCount}/{totalCount}
      </span>
    </button>
  );
});

PassportFloatingButton.displayName = 'PassportFloatingButton';
