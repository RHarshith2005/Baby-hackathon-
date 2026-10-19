import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { audioSystem } from '../utils/audioSynth';

const BOOT_SHOWN_KEY = 'pinglet_boot_screen_shown_v1';

export const DialUpBootScreen: React.FC = React.memo(() => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if already shown this session or if reduced motion is preferred
    const alreadyShown = sessionStorage.getItem(BOOT_SHOWN_KEY);
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (alreadyShown || mq.matches) {
      return;
    }

    setIsVisible(true);
    sessionStorage.setItem(BOOT_SHOWN_KEY, 'true');

    // Fast 1.2s handshake progress simulation
    let current = 0;
    const interval = window.setTimeout(() => {
      const step = () => {
        current += 12;
        if (current >= 100) {
          setProgress(100);
          window.setTimeout(() => setIsVisible(false), 250);
        } else {
          setProgress(current);
          window.setTimeout(step, 110);
        }
      };
      step();
    }, 150);

    return () => {
      window.clearTimeout(interval);
    };
  }, []);

  const handleSkip = () => {
    audioSystem.playTone(523.25, 0.08, 'sine');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-label="Dial-Up Connection Boot Screen"
      className="fixed inset-0 z-50 bg-[#1B1B3A] text-[#9FF3D3] flex flex-col items-center justify-center p-6 select-none transition-opacity duration-500 overflow-hidden"
    >
      {/* Scanline CRT overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-40" />

      <div className="relative z-10 max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[#282854] border-3 border-[#9FF3D3] shadow-2xl animate-bounce">
          <span className="text-4xl">👻</span>
        </div>

        <div>
          <div className="font-mono-retro text-xs text-[#FFF0B3] font-bold tracking-widest uppercase mb-2">
            — 3:00 A.M. ATTIC DIAL-UP HANDSHAKE —
          </div>
          <h1 className="font-display text-4xl sm:text-5xl text-[#FFF8EE] tracking-wider uppercase">
            CONNECTING AT 56K...
          </h1>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#282854] rounded-full p-1.5 border-2 border-[#9FF3D3]/60 shadow-inner">
          <div
            className="h-4 rounded-full bg-[#9FF3D3] transition-all duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="font-mono-retro text-xs text-[#FFF8EE]/70">
          Handshaking across the old web wires... ({progress}%)
        </p>

        <div>
          <button
            type="button"
            onClick={handleSkip}
            className="min-h-[48px] px-6 py-2.5 rounded-full bg-[#FFF0B3] text-[#1B1B3A] font-rounded font-bold text-xs uppercase tracking-wider border-2 border-[#1B1B3A] shadow-md hover:bg-white cursor-pointer active:scale-95 transition-transform"
          >
            Skip Boot Screen
          </button>
        </div>
      </div>
    </div>
  );
});

DialUpBootScreen.displayName = 'DialUpBootScreen';
