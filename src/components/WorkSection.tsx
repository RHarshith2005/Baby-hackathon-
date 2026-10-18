import React from 'react';
import { DialUpLullaby } from './DialUpLullaby';
import { CatchThePackets } from './CatchThePackets';
import { WishWall } from './WishWall';
import type { PingletMood } from '../game/packetRules';

interface WorkSectionProps {
  onMoodChange: (mood: PingletMood) => void;
  onIncrementHellos: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const WorkSection: React.FC<WorkSectionProps> = ({
  onMoodChange,
  onIncrementHellos,
  isMuted,
  onToggleMute,
}) => {
  return (
    <section id="work" aria-label="Pinglet Interactive Work Panels" className="w-full">
      {/* Work Panel 1: Dial-Up Lullaby */}
      <DialUpLullaby isMuted={isMuted} onToggleMute={onToggleMute} />

      {/* Work Panel 2: Catch the Packets (20s Tap Game) */}
      <CatchThePackets
        onMoodChange={onMoodChange}
        onIncrementHellos={onIncrementHellos}
        isMuted={isMuted}
      />

      {/* Work Panel 3: The Wish Wall (Sticker Wall) */}
      <WishWall onIncrementHellos={onIncrementHellos} />
    </section>
  );
};
