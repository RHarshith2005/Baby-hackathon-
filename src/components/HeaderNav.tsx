import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, Radio, Heart } from 'lucide-react';
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
    audioSystem.playTone(800 + next * 200, 0.08, 'sine');
    if (next >= 3) {
      setModemTaps(0);
      onTriggerEasterEgg();
    } else {
      setModemTaps(next);
    }
  };

  const moods: PingletMood[] = ['shy', 'excited', 'sleepy', 'glitchy'];

  return (
    <header className="sticky top-0 z-50 bg-[#1B1B3A]/95 backdrop-blur-md border-b-2 border-[#9FF3D3]/30">
      {/* 90s Marquee Strip */}
      <div className="bg-[#9FF3D3] text-[#1B1B3A] overflow-hidden whitespace-nowrap py-1.5 border-b border-[#1B1B3A] text-xs font-mono-retro font-bold">
        <div className="animate-marquee flex items-center gap-6">
          <span className="flex items-center gap-1.5">✦ PINGLET JUNIOR PACKET COURIER #0404</span>
          <span className="flex items-center gap-1.5">✦ HAND-DELIVERING LOST MESSAGES SINCE 3:00 AM</span>
          <span className="flex items-center gap-1.5">✦ 56K DIAL-UP HANDSHAKE PROTOCOL OK</span>
          <span className="flex items-center gap-1.5">✦ &ldquo;I CARRY LITTLE HELLOS ACROSS THE WIRES&rdquo;</span>
          <span className="flex items-center gap-1.5">✦ ATTIC TELEPHONE NETWORK ONLINE</span>
          <span className="flex items-center gap-1.5">✦ ALL UNSENT DRAFTS WELCOME</span>
          {/* Loop repeat */}
          <span className="flex items-center gap-1.5">✦ PINGLET JUNIOR PACKET COURIER #0404</span>
          <span className="flex items-center gap-1.5">✦ HAND-DELIVERING LOST MESSAGES SINCE 3:00 AM</span>
          <span className="flex items-center gap-1.5">✦ 56K DIAL-UP HANDSHAKE PROTOCOL OK</span>
          <span className="flex items-center gap-1.5">✦ &ldquo;I CARRY LITTLE HELLOS ACROSS THE WIRES&rdquo;</span>
          <span className="flex items-center gap-1.5">✦ ATTIC TELEPHONE NETWORK ONLINE</span>
          <span className="flex items-center gap-1.5">✦ ALL UNSENT DRAFTS WELCOME</span>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Brand & Blinking Modem Light (Easter Egg) */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleModemTap}
            className="group relative flex items-center gap-2 px-2.5 py-1 rounded bg-[#26264d] border border-white/10 hover:border-[#9FF3D3] cursor-pointer transition-all text-left"
            title="Blinking modem light: Tap 3 times for a secret dial-up surprise!"
            aria-label="Modem status indicator. Tap 3 times for easter egg."
          >
            {/* Blinking modem LED */}
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9FF3D3] opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#9FF3D3]" />
            </span>
            <span className="font-mono-retro text-[11px] text-[#9FF3D3] font-bold">
              56K MODEM {modemTaps > 0 ? `(${modemTaps}/3)` : ''}
            </span>
          </button>

          <a href="#hero" className="font-display text-2xl sm:text-3xl text-[#FFF8EE] tracking-wider hover:text-[#9FF3D3] transition-colors">
            PINGLET
          </a>
        </div>

        {/* Desktop Anchor Navigation */}
        <nav className="hidden md:flex items-center gap-6 font-mono-retro text-xs tracking-wider uppercase text-[#FFF8EE]/80">
          <a href="#character" className="hover:text-[#9FF3D3] transition-colors">
            [ PROFILE ]
          </a>
          <a href="#moods" className="hover:text-[#B9A7FF] transition-colors">
            [ MOODS ]
          </a>
          <a href="#work" className="hover:text-[#FFB088] transition-colors">
            [ WORK & GAMES ]
          </a>
          <a href="#story" className="hover:text-[#9FF3D3] transition-colors">
            [ STORY ]
          </a>
        </nav>

        {/* Mood Switcher & Global Mute Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mood Selector Buttons */}
          <div className="hidden sm:flex items-center bg-[#232347] p-1 rounded-lg border border-white/10">
            {moods.map((m) => (
              <button
                key={m}
                onClick={() => onSelectMood(m)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono-retro uppercase tracking-wider transition-all cursor-pointer ${
                  currentMood === m
                    ? 'bg-[#9FF3D3] text-[#1B1B3A] font-bold shadow-xs'
                    : 'text-[#FFF8EE]/70 hover:text-white'
                }`}
                aria-label={`Switch Pinglet mood to ${m}`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Accessible Global Mute Toggle */}
          <button
            onClick={onToggleMute}
            className={`p-2 rounded-lg font-mono-retro text-xs border cursor-pointer transition-all flex items-center gap-1.5 ${
              isMuted
                ? 'bg-red-500/20 text-red-300 border-red-400/40'
                : 'bg-[#232347] text-[#9FF3D3] border-white/10 hover:border-[#9FF3D3]'
            }`}
            aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
            title={isMuted ? 'Unmute sound' : 'Mute sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden sm:inline text-[11px] font-bold">
              {isMuted ? 'MUTE' : 'AUDIO'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
