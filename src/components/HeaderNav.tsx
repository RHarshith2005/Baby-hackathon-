import React, { useState } from 'react';
import { Volume2, VolumeX, Sun, Moon } from 'lucide-react';
import type { PingletMood } from '../game/packetRules';
import { audioSystem } from '../utils/audioSynth';

interface HeaderNavProps {
  currentMood: PingletMood;
  onSelectMood: (mood: PingletMood) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onTriggerEasterEgg: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentMood,
  onSelectMood,
  isMuted,
  onToggleMute,
  onTriggerEasterEgg,
}) => {
  const [modemTaps, setModemTaps] = useState(0);

  const handleModemTap = () => {
    const next = modemTaps + 1;
    audioSystem.playTone(740 + next * 180, 0.09, 'sine');
    if (next >= 3) {
      setModemTaps(0);
      onTriggerEasterEgg();
    } else {
      setModemTaps(next);
    }
  };

  const isNightMode = currentMood === 'sleepy' || currentMood === 'glitchy';

  const handleDayNightToggle = () => {
    const nextMood: PingletMood = isNightMode ? 'excited' : 'sleepy';
    onSelectMood(nextMood);
    audioSystem.playTone(nextMood === 'excited' ? 587.33 : 329.63, 0.16, 'triangle');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#1B1B3A]/95 border-b-3 border-[#1B1B3A] shadow-lg">
      {/* Retro-Web Touch #1: Marquee Strip */}
      <div className="bg-[#FFF0B3] text-[#1B1B3A] overflow-hidden whitespace-nowrap py-1 border-b-2 border-[#1B1B3A] text-xs font-mono-retro font-bold">
        <div className="animate-marquee flex items-center gap-8">
          <span>• PINGLET · SERIES 01 JELLY RESIN DESIGNER TOY</span>
          <span>• &ldquo;I CARRY LITTLE HELLOS ACROSS THE WIRES&rdquo;</span>
          <span>• BORN AT 3:00 A.M. IN A DIAL-UP HANDSHAKE</span>
          <span>• JUNIOR PACKET COURIER OF THE OLD WEB</span>
          <span>• PINGLET · SERIES 01 JELLY RESIN DESIGNER TOY</span>
          <span>• &ldquo;I CARRY LITTLE HELLOS ACROSS THE WIRES&rdquo;</span>
          <span>• BORN AT 3:00 A.M. IN A DIAL-UP HANDSHAKE</span>
          <span>• JUNIOR PACKET COURIER OF THE OLD WEB</span>
        </div>
      </div>

      {/* Main Sticky Control Bar (Minimum 44px touch targets) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-between gap-2">
        {/* Left: Blinking Modem Light (3-Tap Easter Egg) + Brand */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleModemTap}
            className="min-h-[44px] px-3 py-1.5 rounded-full bg-[#282854] hover:bg-[#34346b] border-2 border-[#9FF3D3]/60 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            title="Tiny blinking modem light — tap 3 times!"
            aria-label={`Tiny blinking modem light. Tap 3 times for secret message. Current taps: ${modemTaps}`}
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9FF3D3] opacity-80" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#9FF3D3]" />
            </span>
            <span className="font-mono-retro text-[11px] text-[#9FF3D3] font-bold tracking-wider">
              56K {modemTaps > 0 ? `${modemTaps}/3` : 'LED'}
            </span>
          </button>

          <a
            href="#hero"
            className="font-display text-2xl sm:text-3xl text-[#FFF8EE] tracking-wider hover:text-[#9FF3D3] transition-colors py-1"
          >
            PINGLET
          </a>
        </div>

        {/* Center Quick Section Links (Tablet/Desktop) */}
        <nav
          aria-label="Primary sections"
          className="hidden lg:flex items-center gap-5 font-rounded font-semibold text-sm text-[#FFF8EE]/90"
        >
          <a href="#meet" className="hover:text-[#9FF3D3] transition-colors py-2">
            Blind Box
          </a>
          <a href="#moods" className="hover:text-[#FFC9A8] transition-colors py-2">
            Moods
          </a>
          <a href="#work" className="hover:text-[#B9A7FF] transition-colors py-2">
            Toy Box
          </a>
          <a href="#story" className="hover:text-[#FFF0B3] transition-colors py-2">
            Story
          </a>
        </nav>

        {/* Right: Day/Night Mood Toggle + Fixed Visible Mute Toggle */}
        <div className="flex items-center gap-2">
          {/* Day = Excited / Night = Sleepy Mood Toggle */}
          <button
            type="button"
            onClick={handleDayNightToggle}
            className={`min-h-[44px] px-3.5 py-1.5 rounded-full font-rounded font-bold text-xs sm:text-sm border-2 border-[#1B1B3A] shadow-md flex items-center gap-1.5 cursor-pointer transition-all ${
              isNightMode
                ? 'bg-[#B9A7FF] text-[#1B1B3A]'
                : 'bg-[#FFF0B3] text-[#1B1B3A]'
            }`}
            aria-label={
              isNightMode
                ? 'Switch mood toggle to Day (Excited)'
                : 'Switch mood toggle to Night (Sleepy)'
            }
          >
            {isNightMode ? (
              <>
                <Moon className="w-4 h-4 fill-current" />
                <span>NIGHT · SLEEPY</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 fill-current" />
                <span>DAY · EXCITED</span>
              </>
            )}
          </button>

          {/* Fixed Visible Global Audio Mute Toggle */}
          <button
            type="button"
            onClick={onToggleMute}
            className={`min-h-[44px] min-w-[44px] px-3.5 py-1.5 rounded-full font-rounded font-bold text-xs sm:text-sm border-2 cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
              isMuted
                ? 'bg-[#E86FA0] text-[#1B1B3A] border-[#1B1B3A]'
                : 'bg-[#9FF3D3] text-[#1B1B3A] border-[#1B1B3A]'
            }`}
            aria-label={isMuted ? 'Unmute all audio' : 'Mute all audio'}
            aria-pressed={isMuted}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isMuted ? 'MUTED' : 'SOUND ON'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
