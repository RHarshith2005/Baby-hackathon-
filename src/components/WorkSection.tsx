import React, { useRef } from 'react';
import { DialUpLullaby } from './DialUpLullaby';
import { CatchThePackets } from './CatchThePackets';
import { WishWall } from './WishWall';
import { DataPacketParticleCanvas, type DataPacketCanvasHandle } from './DataPacketParticleCanvas';
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
  const particleCanvasRef = useRef<DataPacketCanvasHandle>(null);
  const containerRef = useRef<HTMLElement>(null);

  const handleRoundComplete = (_finalScore: number, clientX?: number, clientY?: number) => {
    if (!particleCanvasRef.current) return;

    if (clientX !== undefined && clientY !== undefined && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const originX = clientX - rect.left;
      const originY = clientY - rect.top;
      particleCanvasRef.current.triggerBurst(originX, originY, 44);
    } else {
      particleCanvasRef.current.triggerBurst(undefined, undefined, 44);
    }
  };

  return (
    <section
      id="work"
      ref={containerRef}
      aria-label="Pinglet Interactive Work Panels"
      className="relative w-full overflow-hidden"
    >
      {/* Canvas-based particle system for data-packet bursts upon completing Catch the Packets round */}
      <DataPacketParticleCanvas ref={particleCanvasRef} isMuted={isMuted} />

      {/* Work Panel 1: Dial-Up Lullaby */}
      <DialUpLullaby isMuted={isMuted} onToggleMute={onToggleMute} />

      {/* Work Panel 2: Catch the Packets (20s Tap Game) */}
      <CatchThePackets
        onMoodChange={onMoodChange}
        onIncrementHellos={onIncrementHellos}
        isMuted={isMuted}
        onRoundComplete={handleRoundComplete}
      />

      {/* Work Panel 3: The Wish Wall (Sticker Wall) */}
      <WishWall onIncrementHellos={onIncrementHellos} />
    </section>
  );
};
