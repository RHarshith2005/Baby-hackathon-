import React, { useState } from 'react';
import { usePingletStore, applyCare, resetPinglet, trackEvent } from '../store/pingletStore';
import { Sparkles, RotateCcw } from 'lucide-react';
import { audioSystem } from '../utils/audioSynth';

interface PocketPetCareMetersProps {
  onFeedClick?: () => void;
  onPetClick?: () => void;
}

export const PocketPetCareMeters: React.FC<PocketPetCareMetersProps> = React.memo(({
  onFeedClick,
  onPetClick,
}) => {
  const { careStats, greeting } = usePingletStore();
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const isAllHigh = careStats.tummy >= 75 && careStats.cozy >= 75 && careStats.joy >= 75;
  const isHungry = careStats.tummy < 30;
  const isSleepy = careStats.cozy < 30;

  const handleQuickFeed = () => {
    audioSystem.playMunch();
    applyCare('feed');
    trackEvent('fed');
    onFeedClick?.();
  };

  const handleQuickPet = () => {
    audioSystem.playPurr();
    applyCare('pet');
    trackEvent('petted');
    onPetClick?.();
  };

  const handleReset = () => {
    resetPinglet();
    setShowConfirmReset(false);
    audioSystem.playTone(440, 0.1, 'sine');
  };

  return (
    <div className="w-full max-w-md mx-auto lg:mx-0 bg-white/90 backdrop-blur-md rounded-[2rem] p-4 sm:p-5 border-3 border-[#1B1B3A] shadow-md relative overflow-hidden">
      {/* Sparkle aura header when all meters are happy */}
      {isAllHigh && (
        <div className="absolute top-0 right-0 bg-[#FFF0B3] text-[#1B1B3A] text-[10px] font-mono-retro font-bold px-3 py-1 rounded-bl-xl border-l-2 border-b-2 border-[#1B1B3A] flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#E86FA0]" />
          <span>SPARKLE AURA ACTIVE</span>
        </div>
      )}

      {/* Greeting Speech Bubble */}
      <div className="mb-4 bg-[#FFF8EE] rounded-2xl p-3 border-2 border-[#1B1B3A] relative">
        <div className="absolute -bottom-2 left-6 w-3 h-3 bg-[#FFF8EE] border-b-2 border-r-2 border-[#1B1B3A] transform rotate-45" />
        <p className="font-rounded font-bold text-xs text-[#E86FA0] uppercase tracking-wider">
          {greeting.title}
        </p>
        <p className="font-rounded text-xs sm:text-sm text-[#1B1B3A] mt-0.5 leading-snug">
          &ldquo;{isHungry ? 'My tummy is rumbling for a candy star!' : isSleepy ? 'Yawn... the wires are so quiet today.' : greeting.subtitle}&rdquo;
        </p>
      </div>

      {/* 3 Chunky Candy-Colored Care Meters */}
      <div className="space-y-2.5">
        {/* 1. Tummy Meter */}
        <div>
          <div className="flex justify-between items-center text-xs font-mono-retro font-bold text-[#1B1B3A] mb-1">
            <span className="flex items-center gap-1.5">
              <span>🍬</span> TUMMY {isHungry && <span className="text-[#E86FA0]">(RUMBLING!)</span>}
            </span>
            <span>{careStats.tummy}%</span>
          </div>
          <div className="w-full h-4 bg-[#1B1B3A]/10 rounded-full border-2 border-[#1B1B3A] overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-[#FF9EC7] transition-all duration-500 ease-out"
              style={{ width: `${careStats.tummy}%` }}
            />
          </div>
        </div>

        {/* 2. Cozy Meter */}
        <div>
          <div className="flex justify-between items-center text-xs font-mono-retro font-bold text-[#1B1B3A] mb-1">
            <span className="flex items-center gap-1.5">
              <span>☁️</span> COZY {isSleepy && <span className="text-[#B9A7FF]">(YAWNING)</span>}
            </span>
            <span>{careStats.cozy}%</span>
          </div>
          <div className="w-full h-4 bg-[#1B1B3A]/10 rounded-full border-2 border-[#1B1B3A] overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-[#B9A7FF] transition-all duration-500 ease-out"
              style={{ width: `${careStats.cozy}%` }}
            />
          </div>
        </div>

        {/* 3. Joy Meter */}
        <div>
          <div className="flex justify-between items-center text-xs font-mono-retro font-bold text-[#1B1B3A] mb-1">
            <span className="flex items-center gap-1.5">
              <span>✨</span> JOY
            </span>
            <span>{careStats.joy}%</span>
          </div>
          <div className="w-full h-4 bg-[#1B1B3A]/10 rounded-full border-2 border-[#1B1B3A] overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-[#FFF0B3] transition-all duration-500 ease-out"
              style={{ width: `${careStats.joy}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Care Actions & Reset Link */}
      <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t-2 border-[#1B1B3A]/15 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleQuickFeed}
            className="min-h-[48px] px-3 py-1.5 rounded-full bg-[#FF9EC7] hover:bg-[#ff8cb8] text-[#1B1B3A] font-rounded font-bold border-2 border-[#1B1B3A] cursor-pointer active:scale-95 transition-transform flex items-center gap-1"
            title="Feed Pinglet a candy"
          >
            <span>🍬</span> Feed
          </button>
          <button
            type="button"
            onClick={handleQuickPet}
            className="min-h-[48px] px-3 py-1.5 rounded-full bg-[#B9A7FF] hover:bg-[#aa95ff] text-[#1B1B3A] font-rounded font-bold border-2 border-[#1B1B3A] cursor-pointer active:scale-95 transition-transform flex items-center gap-1"
            title="Pet Pinglet"
          >
            <span>🐾</span> Pet
          </button>
        </div>

        {/* Reset Pinglet Link */}
        <div>
          {showConfirmReset ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleReset}
                className="min-h-[48px] px-2 py-1 text-red-600 font-bold hover:underline cursor-pointer"
              >
                Yes, Reset
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmReset(false)}
                className="min-h-[48px] px-2 py-1 text-gray-500 hover:underline cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowConfirmReset(true)}
              className="min-h-[48px] text-[11px] font-mono-retro text-[#523B8A] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Pinglet
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

PocketPetCareMeters.displayName = 'PocketPetCareMeters';
