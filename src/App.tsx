/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import { HeaderNav } from './components/HeaderNav';
import { HeroSection } from './components/HeroSection';
import { CharacterSheet } from './components/CharacterSheet';
import { MoodsSection } from './components/MoodsSection';
import { WorkSection } from './components/WorkSection';
import { StorySection } from './components/StorySection';
import { FooterSection } from './components/FooterSection';
import { EasterEggModal } from './components/EasterEggModal';
import { SparkleCursorTrail } from './components/SparkleCursorTrail';
import { CandyStarField } from './components/CandyStarField';
import { PlayfulDivider } from './components/PlayfulDivider';
import { CourierPassportModal } from './components/CourierPassportModal';
import { PassportFloatingButton } from './components/PassportFloatingButton';
import { StampToast } from './components/StampToast';
import { HelloCardModal } from './components/HelloCardModal';
import { DialUpBootScreen } from './components/DialUpBootScreen';
import { audioSystem } from './utils/audioSynth';
import { nightSoundsService } from './utils/nightSounds';
import { incrementHellos } from './utils/hellosStore';
import { trackEvent } from './store/pingletStore';
import type { PingletMood } from './game/packetRules';

export default function App() {
  const [currentMood, setCurrentMood] = useState<PingletMood>('excited');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isEasterEggOpen, setIsEasterEggOpen] = useState<boolean>(false);
  const [isPassportOpen, setIsPassportOpen] = useState<boolean>(false);
  const [isHelloCardOpen, setIsHelloCardOpen] = useState<boolean>(false);
  const [nightSoundsEnabled, setNightSoundsEnabled] = useState<boolean>(false);

  const isNight = currentMood === 'sleepy' || currentMood === 'glitchy';

  // Sync night sounds state with mood and mute settings
  useEffect(() => {
    nightSoundsService.setEnabled(nightSoundsEnabled, isNight, isMuted);
  }, [nightSoundsEnabled, isNight, isMuted]);

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const nextMuted = !prev;
      audioSystem.setMuted(nextMuted);
      nightSoundsService.setMuted(nextMuted, isNight);
      return nextMuted;
    });
  }, [isNight]);

  const handleSelectMood = useCallback((mood: PingletMood) => {
    setCurrentMood(mood);
    if (mood === 'sleepy' || mood === 'glitchy') {
      trackEvent('switchedNight');
    }
  }, []);

  const handleIncrementHellos = useCallback(() => {
    incrementHellos(1);
    trackEvent('talked');
  }, []);

  const handleTriggerEasterEgg = useCallback(() => {
    setCurrentMood('glitchy');
    incrementHellos(1);
    setIsEasterEggOpen(true);
    trackEvent('foundEgg');
  }, []);

  const handleCloseEasterEgg = useCallback(() => {
    setIsEasterEggOpen(false);
  }, []);

  const handleToggleNightSounds = useCallback(() => {
    setNightSoundsEnabled((prev) => !prev);
    audioSystem.playTone(659.25, 0.1, 'sine');
  }, []);

  return (
    <div className="min-h-screen bg-dreamy-sunset text-[#1B1B3A] flex flex-col selection:bg-[#9FF3D3] selection:text-[#1B1B3A] relative">
      {/* Feature 5: Dial-Up Boot Screen (First visit only) */}
      <DialUpBootScreen />

      {/* Non-Blocking New Stamp Toast Notification */}
      <StampToast />

      {/* Floating Courier Passport Button */}
      <PassportFloatingButton onOpen={() => setIsPassportOpen(true)} />

      {/* Courier Passport Modal */}
      <CourierPassportModal
        isOpen={isPassportOpen}
        onClose={() => setIsPassportOpen(false)}
      />

      {/* Hello Card Postcard Modal */}
      <HelloCardModal
        isOpen={isHelloCardOpen}
        onClose={() => setIsHelloCardOpen(false)}
      />

      {/* Skip to Content Accessible Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-[#1B1B3A] focus:text-[#9FF3D3] focus:rounded-full focus:font-bold focus:shadow-xl focus:border-2 focus:border-white"
      >
        Skip to content
      </a>

      {/* Sparkle-Star Cursor Trail (Desktop only, disabled on touch & reduced motion) */}
      <SparkleCursorTrail />

      {/* Fixed 3-Layer Parallax Candy-Star Field */}
      <CandyStarField />

      {/* Sticky Top Header with Marquee Strip, 3-Tap Modem LED, Hello Card, Night Sounds, Day/Night Toggle & Mute */}
      <HeaderNav
        currentMood={currentMood}
        onSelectMood={handleSelectMood}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onTriggerEasterEgg={handleTriggerEasterEgg}
        nightSoundsEnabled={nightSoundsEnabled}
        onToggleNightSounds={handleToggleNightSounds}
        onOpenHelloCard={() => setIsHelloCardOpen(true)}
      />

      {/* Main Scroll-Driven Designer-Toy Showcase */}
      <main id="main-content" className="flex-1 w-full relative z-20">
        {/* 1. HERO + POCKET-PET CARE METERS */}
        <HeroSection
          currentMood={currentMood}
          onSelectMood={handleSelectMood}
        />

        {/* Playful Divider 1: Cloud Wave into Meet Pinglet */}
        <PlayfulDivider variant="cloud" fillColor="#FFF8EE" borderColor="#1B1B3A" />

        {/* 2. MEET PINGLET (Blind-Box Card) */}
        <CharacterSheet />

        {/* Playful Divider 2: Scalloped Border into Moods */}
        <PlayfulDivider variant="scallop" fillColor="#9FF3D3" borderColor="#1B1B3A" />

        {/* 3. MOODS (4 Alternating Panels) */}
        <MoodsSection
          currentMood={currentMood}
          onSelectMood={handleSelectMood}
        />

        {/* Playful Divider 3: Ticket Perforation into Toy Box Work */}
        <PlayfulDivider variant="ticket" fillColor="#B9A7FF" borderColor="#1B1B3A" />

        {/* 4. WORK (Dial-Up Lullaby + Composer, Catch the Packets 20s Game, The Wish Wall) */}
        <WorkSection
          onMoodChange={handleSelectMood}
          onIncrementHellos={handleIncrementHellos}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />

        {/* Playful Divider 4: Scallop into Story Night Sky */}
        <PlayfulDivider variant="scallop" fillColor="#2D1B48" borderColor="#1B1B3A" />

        {/* 5. STORY (4 Scroll-Driven Dusk-to-Night Scenes) */}
        <StorySection />

        {/* Playful Divider 5: Ticket Perforation into Footer */}
        <PlayfulDivider variant="ticket" fillColor="#1B1B3A" borderColor="#1B1B3A" />
      </main>

      {/* 6. FOOTER (Odometer, Giant PINGLET, Gemini Art Credits) */}
      <FooterSection />

      {/* Hidden Easter Egg Modal */}
      <EasterEggModal
        isOpen={isEasterEggOpen}
        onClose={handleCloseEasterEgg}
      />
    </div>
  );
}
