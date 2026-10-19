import React from 'react';
import { PingletSvg } from './PingletSvg';
import type { PingletMood } from '../game/packetRules';
import { audioSystem } from '../utils/audioSynth';
import { ArrowDown } from 'lucide-react';
import { PocketPetCareMeters } from './PocketPetCareMeters';
import { KineticTitle } from './KineticTitle';
import { motion } from 'motion/react';

interface HeroSectionProps {
  currentMood: PingletMood;
  onSelectMood: (mood: PingletMood) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = React.memo(({
  currentMood,
  onSelectMood,
}) => {
  const isNight = currentMood === 'sleepy' || currentMood === 'glitchy';

  return (
    <section
      id="hero"
      aria-label="Pinglet Hero Showcase"
      className={`relative w-full min-h-[90svh] px-4 sm:px-8 md:px-14 py-8 sm:py-12 flex flex-col justify-between overflow-hidden transition-colors duration-500 border-b-4 border-[#1B1B3A] ${
        isNight
          ? 'bg-gradient-to-b from-[#1B1B3A] via-[#2F245C] to-[#523B8A] text-[#FFF8EE]'
          : 'bg-dreamy-sunset text-[#1B1B3A]'
      }`}
    >
      {/* Pale Oversized Circle Arcs */}
      <div
        className="absolute -top-36 -left-36 w-[420px] h-[420px] rounded-full border-[44px] border-white/30 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-44 -right-36 w-[520px] h-[520px] rounded-full border-[52px] border-white/25 pointer-events-none"
        aria-hidden="true"
      />

      {/* Giant Ghosted Word Behind Character */}
      <div
        className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <span
          className={`font-display text-[28vw] leading-none tracking-wider font-extrabold ${
            isNight ? 'text-white/10' : 'text-white/45'
          }`}
        >
          HELLO
        </span>
      </div>

      {/* Tiny Corner Mood Tag with Dash Mark */}
      <div className="relative z-10 flex items-center justify-between gap-2 text-xs font-mono-retro font-bold uppercase tracking-widest">
        <span className="px-3.5 py-2 rounded-full bg-[#1B1B3A] text-[#9FF3D3] shadow-sm">
          &mdash; MOOD : {currentMood.toUpperCase()}
        </span>
        <span className="px-3.5 py-2 rounded-full bg-white/85 text-[#1B1B3A] border-2 border-[#1B1B3A]">
          &mdash; SERIES 01 · #0404
        </span>
      </div>

      {/* Center Designer-Toy Showcase */}
      <div className="relative z-10 max-w-6xl mx-auto w-full grid lg:grid-cols-12 gap-6 sm:gap-8 items-center my-4 sm:my-6">
        {/* Left: Giant Stacked Uppercase Heading + Caption + PocketPet Care Meters */}
        <motion.div
          initial={{ opacity: 0, x: -25 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-6 text-center lg:text-left space-y-4"
        >
          <KineticTitle
            as="h1"
            className="font-display text-7xl sm:text-9xl lg:text-[9.5rem] leading-[0.86] tracking-tight uppercase drop-shadow-sm"
          >
            PINGLET
          </KineticTitle>

          {/* One Caption Under 15 Words in Rounded Font (Fredoka) */}
          <p
            className={`font-rounded font-semibold text-xl sm:text-2xl md:text-3xl max-w-md mx-auto lg:mx-0 leading-snug ${
              isNight ? 'text-[#9FF3D3]' : 'text-[#1B1B3A]'
            }`}
          >
            &ldquo;I carry little hellos across the wires.&rdquo;
          </p>

          {/* 48px Accessible Mood Switcher Buttons */}
          <div
            className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1"
            role="group"
            aria-label="Choose Pinglet pose"
          >
            {(['excited', 'shy', 'sleepy', 'glitchy'] as PingletMood[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  onSelectMood(m);
                  audioSystem.playTone(m === 'excited' ? 587.33 : 440, 0.14, 'triangle');
                }}
                className={`min-h-[48px] px-4 py-2 rounded-full font-rounded font-bold text-xs sm:text-sm uppercase tracking-wider border-2 border-[#1B1B3A] cursor-pointer transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#1B1B3A] ${
                  currentMood === m
                    ? 'bg-[#1B1B3A] text-[#9FF3D3] scale-105 shadow-md'
                    : 'bg-white/90 text-[#1B1B3A] hover:bg-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Feature 2: Pocket-Pet Care Meters */}
          <div className="pt-2">
            <PocketPetCareMeters />
          </div>
        </motion.div>

        {/* Right: Big Floating Designer-Toy Render */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-6 flex items-center justify-center transition-transform duration-500"
        >
          <div className="w-full max-w-[360px] sm:max-w-[420px] animate-toy-float">
            <PingletSvg
              mood={currentMood}
              size={420}
              className="w-full h-auto"
              alt={`Pinglet designer-toy 3D render floating in ${currentMood} pose with glitter resin and candy envelope`}
            />
          </div>
        </motion.div>
      </div>

      {/* Bottom Scroll Hint (≥48px touch target) */}
      <div className="relative z-10 flex items-center justify-center pt-2">
        <a
          href="#meet"
          className="min-h-[48px] px-6 py-2.5 rounded-full bg-[#1B1B3A] text-[#FFF0B3] font-rounded font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center gap-2 shadow-md hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-[#FFF0B3]"
        >
          <span>SCROLL TO UNBOX</span>
          <ArrowDown className="w-4 h-4 animate-bounce" />
        </a>
      </div>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';
