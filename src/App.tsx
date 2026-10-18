/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HeaderNav } from './components/HeaderNav';
import { HeroSection } from './components/HeroSection';
import { CharacterSheet } from './components/CharacterSheet';
import { MoodsSection } from './components/MoodsSection';
import { WorkSection } from './components/WorkSection';
import { StorySection } from './components/StorySection';
import { FooterSection } from './components/FooterSection';
import { EasterEggModal } from './components/EasterEggModal';
import { SparkleCursorTrail } from './components/SparkleCursorTrail';
import { audioSystem } from './utils/audioSynth';
import type { PingletMood } from './game/packetRules';

export default function App() {
  const [currentMood, setCurrentMood] = useState<PingletMood>('excited');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isEasterEggOpen, setIsEasterEggOpen] = useState<boolean>(false);
  const [hellosDelivered, setHellosDelivered] = useState<number>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('pinglet_hellos_count');
        if (saved) return Number(saved) || 4042;
      }
    } catch {
      // Fallback if storage unavailable
    }
    return 4042;
  });

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioSystem.setMuted(nextMuted);
  };

  const handleSelectMood = (mood: PingletMood) => {
    setCurrentMood(mood);
  };

  const handleIncrementHellos = () => {
    setHellosDelivered((prev) => {
      const next = prev + 1;
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('pinglet_hellos_count', String(next));
        }
      } catch {
        // Ignore storage error
      }
      return next;
    });
  };

  const handleTriggerEasterEgg = () => {
    setCurrentMood('glitchy');
    handleIncrementHellos();
    setIsEasterEggOpen(true);
  };

  return (
    <div className="min-h-screen bg-dreamy-sunset text-[#1B1B3A] flex flex-col selection:bg-[#9FF3D3] selection:text-[#1B1B3A]">
      {/* Sparkle-Star Cursor Trail (Desktop only, disabled on touch & reduced motion) */}
      <SparkleCursorTrail />

      {/* Sticky Top Header with Marquee Strip, 3-Tap Modem LED, Day/Night Toggle & Mute */}
      <HeaderNav
        currentMood={currentMood}
        onSelectMood={handleSelectMood}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onTriggerEasterEgg={handleTriggerEasterEgg}
      />

      {/* Main Scroll-Driven Designer-Toy Showcase */}
      <main className="flex-1 w-full">
        {/* 1. HERO */}
        <HeroSection
          currentMood={currentMood}
          onSelectMood={handleSelectMood}
        />

        {/* 2. MEET PINGLET (Blind-Box Card) */}
        <CharacterSheet />

        {/* 3. MOODS (4 Alternating Panels) */}
        <MoodsSection
          currentMood={currentMood}
          onSelectMood={handleSelectMood}
        />

        {/* 4. WORK (Dial-Up Lullaby, Catch the Packets 20s Game, The Wish Wall) */}
        <WorkSection
          onMoodChange={handleSelectMood}
          onIncrementHellos={handleIncrementHellos}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />

        {/* 5. STORY (4 Scroll-Driven Dusk-to-Night Scenes) */}
        <StorySection />
      </main>

      {/* 6. FOOTER (Odometer, Giant PINGLET, Gemini Art Credits) */}
      <FooterSection
        hellosDelivered={hellosDelivered}
        onTriggerEasterEgg={handleTriggerEasterEgg}
      />

      {/* Hidden Easter Egg Modal */}
      <EasterEggModal
        isOpen={isEasterEggOpen}
        onClose={() => setIsEasterEggOpen(false)}
      />
    </div>
  );
}
