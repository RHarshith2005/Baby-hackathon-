import React from 'react';
import { DialUpLullaby } from './DialUpLullaby';
import { CatchThePackets } from './CatchThePackets';
import { WishWall } from './WishWall';
import type { PingletMood } from '../game/packetRules';
import { Briefcase, Music, Gamepad2, Mail } from 'lucide-react';

interface WorkSectionProps {
  onMoodChange: (mood: PingletMood) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const WorkSection: React.FC<WorkSectionProps> = ({
  onMoodChange,
  isMuted,
  onToggleMute,
}) => {
  return (
    <section id="work" className="w-full bg-[#171733] text-[#FFF8EE] p-4 sm:p-8 md:p-12 lg:p-16 border-b-4 border-black relative overflow-hidden">
      {/* Ghosted Background Word */}
      <div
        className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <span className="font-display text-[22vw] leading-none text-white/5 tracking-wider font-extrabold">
          DISPATCH
        </span>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFB088] text-[#1B1B3A] text-xs font-mono-retro font-bold uppercase rounded-sm tracking-widest">
            <Briefcase className="w-3.5 h-3.5" /> [ - SECTION 04 : COURIER WORK & TRANSMISSIONS - ]
          </div>
          <h2 className="font-display text-6xl sm:text-7xl md:text-8xl tracking-tight text-[#FFF8EE]">
            PINGLET&apos;S COURIER WORK
          </h2>
          <p className="font-body text-sm sm:text-base text-[#FFF8EE]/80 max-w-2xl mx-auto leading-relaxed">
            Three interactive courier projects: listen to the procedural dial-up pentatonic lullaby, steer Pinglet to catch incoming packets, and hand-deliver an unsent hello into the live wire stream.
          </p>
        </div>

        {/* 3 Work Panels */}
        <div className="space-y-12 sm:space-y-16">
          {/* Panel 1: Dial-Up Lullaby */}
          <div id="lullaby">
            <DialUpLullaby isMuted={isMuted} onToggleMute={onToggleMute} />
          </div>

          {/* Panel 2: Catch the Packets Mini-Game */}
          <div id="game">
            <CatchThePackets onMoodChange={onMoodChange} isMuted={isMuted} />
          </div>

          {/* Panel 3: The Wish Wall */}
          <div id="wishwall">
            <WishWall />
          </div>
        </div>
      </div>
    </section>
  );
};
