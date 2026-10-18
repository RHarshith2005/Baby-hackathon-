/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HeaderNav } from './components/HeaderNav';
import { HeroSection } from './components/HeroSection';
import { CharacterSheet } from './components/CharacterSheet';
import { MoodsSection } from './components/MoodsSection';
import { WorkSection } from './components/WorkSection';
import { StorySection } from './components/StorySection';
import { FooterSection } from './components/FooterSection';
import { EasterEggModal } from './components/EasterEggModal';
import { audioSystem } from './utils/audioSynth';
import type { PingletMood } from './game/packetRules';

export default function App() {
  const [currentMood, setCurrentMood] = useState<PingletMood>('shy');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isEasterEggOpen, setIsEasterEggOpen] = useState<boolean>(false);

  // Initialize audio mute state
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioSystem.setMuted(nextMuted);
  };

  const handleSelectMood = (mood: PingletMood) => {
    setCurrentMood(mood);
  };

  const handleTriggerEasterEgg = () => {
    setCurrentMood('glitchy');
    setIsEasterEggOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#1B1B3A] text-[#FFF8EE] flex flex-col selection:bg-[#9FF3D3] selection:text-[#1B1B3A]">
      {/* Top Header with Marquee, Mute, & Modem Easter Egg trigger */}
      <HeaderNav
        currentMood={currentMood}
        onSelectMood={handleSelectMood}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onTriggerEasterEgg={handleTriggerEasterEgg}
      />

      {/* Main Content Sections */}
      <main className="flex-1 w-full">
        {/* Section 1: Hero */}
        <HeroSection
          currentMood={currentMood}
          onSelectMood={handleSelectMood}
        />

        {/* Section 2: Character Sheet */}
        <CharacterSheet />

        {/* Section 3: Moods */}
        <MoodsSection
          currentMood={currentMood}
          onSelectMood={handleSelectMood}
        />

        {/* Section 4: Work & Games */}
        <WorkSection
          onMoodChange={handleSelectMood}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />

        {/* Section 5: Story */}
        <StorySection />
      </main>

      {/* Section 6: Footer & Webring */}
      <FooterSection onTriggerEasterEgg={handleTriggerEasterEgg} />

      {/* Easter Egg Modal */}
      <EasterEggModal
        isOpen={isEasterEggOpen}
        onClose={() => setIsEasterEggOpen(false)}
      />
    </div>
  );
}
