import React, { useState } from 'react';
import { Pinglet3D } from './Pinglet3D';
import type { PingletMood } from '../game/packetRules';
import { audioSystem } from '../utils/audioSynth';
import { Sparkles, MessageSquareHeart, Gamepad2, Volume2, ArrowDown } from 'lucide-react';

interface HeroSectionProps {
  currentMood: PingletMood;
  onSelectMood: (mood: PingletMood) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  currentMood,
  onSelectMood,
}) => {
  const [bounceCount, setBounceCount] = useState(0);

  const handlePingletBounce = () => {
    setBounceCount((c) => c + 1);
    audioSystem.playTone(currentMood === 'excited' ? 659.25 : 523.25, 0.18, 'sine');
  };

  return (
    <section
      id="hero"
      className="relative w-full min-h-[90vh] bg-[#9FF3D3] text-[#1B1B3A] p-4 sm:p-8 md:p-12 lg:p-16 flex flex-col justify-between overflow-hidden"
    >
      {/* Big pale circle arcs in the background */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full border-[32px] border-white/25 pointer-events-none" />
      <div className="absolute -bottom-48 -right-48 w-[500px] h-[500px] rounded-full border-[48px] border-white/20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-white/15 blur-2xl pointer-events-none" />

      {/* Giant Ghosted Background Word "HELLO" */}
      <div
        className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <span className="font-display text-[22vw] leading-none text-white/40 tracking-wider font-extrabold translate-y-4">
          HELLO
        </span>
      </div>

      {/* Top Corner Mood & System Tags */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono-retro font-bold uppercase tracking-widest">
        <span className="px-3 py-1 bg-[#1B1B3A] text-[#9FF3D3] rounded-sm">
          [ - STATUS : 3:00 AM ATTIC DISPATCH - ]
        </span>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-[#FFF8EE] text-[#1B1B3A] border border-[#1B1B3A] rounded-sm">
            [ - MOOD : {currentMood.toUpperCase()} - ]
          </span>
          <span className="hidden sm:inline px-3 py-1 bg-[#B9A7FF] text-[#1B1B3A] rounded-sm">
            [ - PACKET ID : #0404-HELLO - ]
          </span>
        </div>
      </div>

      {/* Main Grid: Condensed Stacked Headings & 3D Interactive Pinglet */}
      <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center my-6 sm:my-10">
        {/* Left Column: Headings & First-Person Narrative */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFF8EE] text-[#1B1B3A] border-2 border-[#1B1B3A] shadow-xs text-xs sm:text-sm font-mono-retro font-bold">
            <Sparkles className="w-4 h-4 text-[#FFB088] fill-current" />
            <span>ORIGINAL 3D CLAY CHARACTER PORTFOLIO</span>
          </div>

          <h1 className="font-display text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] tracking-tight text-[#1B1B3A] leading-[0.88] select-none">
            PINGLET
          </h1>

          <div className="bg-[#1B1B3A] text-[#FFF8EE] p-4 sm:p-6 rounded-2xl border-3 border-[#FFF8EE] shadow-xl max-w-xl">
            <span className="text-[10px] sm:text-[11px] font-mono-retro text-[#9FF3D3] uppercase tracking-wider block mb-1">
              [ OFFICIAL TAGLINE ]
            </span>
            <p className="font-display text-xl sm:text-2xl md:text-3xl text-[#9FF3D3] mb-3 tracking-wide">
              &ldquo;I carry little hellos across the wires.&rdquo;
            </p>
            <p className="font-body text-xs sm:text-sm md:text-base text-[#FFF8EE]/90 leading-relaxed">
              Hi! I&apos;m <strong className="text-[#9FF3D3]">Pinglet</strong>, a tiny translucent baby ghost made of static and CRT glow, with two blinking LED antenna tufts. I was born at 3 a.m. when a dial-up handshake echoed through a forgotten attic computer. I hand-deliver lost messages, old unsent drafts, and gentle hellos across the old web.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="#work"
              className="px-6 py-3.5 bg-[#1B1B3A] hover:bg-[#282855] text-[#9FF3D3] font-display text-2xl tracking-wider rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2.5 cursor-pointer"
            >
              <Gamepad2 className="w-5 h-5" /> CATCH PACKETS GAME
            </a>
            <a
              href="#character"
              className="px-6 py-3.5 bg-[#FFF8EE] hover:bg-white text-[#1B1B3A] border-2 border-[#1B1B3A] font-display text-2xl tracking-wider rounded-xl shadow-md transition-transform hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <MessageSquareHeart className="w-5 h-5 text-[#B9A7FF]" /> CHARACTER SHEET
            </a>
          </div>

          {/* Interactive Mood Buttons */}
          <div className="pt-2">
            <span className="text-xs font-mono-retro font-bold uppercase tracking-wider text-[#1B1B3A]/80 block mb-2">
              SWITCH PINGLET&apos;S CURRENT POSE & MOOD:
            </span>
            <div className="flex flex-wrap gap-2">
              {(['shy', 'excited', 'sleepy', 'glitchy'] as PingletMood[]).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    onSelectMood(m);
                    audioSystem.playTone(m === 'glitchy' ? 200 : 440, 0.1, 'sine');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono-retro uppercase tracking-wider border-2 cursor-pointer transition-all ${
                    currentMood === m
                      ? 'bg-[#1B1B3A] text-[#9FF3D3] border-[#1B1B3A] font-bold shadow-md scale-105'
                      : 'bg-white/70 text-[#1B1B3A] border-[#1B1B3A]/40 hover:bg-white'
                  }`}
                >
                  {m === 'shy' && '🙈 SHY & PEEKING'}
                  {m === 'excited' && '✨ EXCITED (ARMS UP)'}
                  {m === 'sleepy' && '💤 SLEEPY (ZZZ)'}
                  {m === 'glitchy' && '⚡ 3AM GLITCH'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Three.js 3D Soft-Clay Model Showcase */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
          <div className="w-full max-w-[420px] h-[400px] sm:h-[460px] bg-[#FFF8EE]/80 rounded-3xl border-4 border-[#1B1B3A] shadow-2xl relative overflow-hidden flex flex-col items-center justify-center">
            {/* Retro title strip inside frame */}
            <div className="absolute top-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono-retro font-bold text-[#1B1B3A] z-20 pointer-events-none">
              <span>● THREE.JS 3D SOFT-CLAY</span>
              <span className="text-xs bg-[#1B1B3A] text-[#9FF3D3] px-2 py-0.5 rounded-xs">
                TAP TO BOUNCE
              </span>
            </div>

            {/* The real 3D Three.js Canvas */}
            <Pinglet3D
              mood={currentMood}
              onBounce={handlePingletBounce}
              className="w-full h-full"
            />

            {/* Bottom floating helper tip */}
            <div className="absolute bottom-3 text-center text-[10px] font-mono-retro text-[#1B1B3A]/70 pointer-events-none bg-white/70 px-3 py-1 rounded-full border border-[#1B1B3A]/20">
              Eyes track cursor / touch • Bounced {bounceCount} {bounceCount === 1 ? 'time' : 'times'}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Scroll Prompt */}
      <div className="relative z-10 flex items-center justify-between pt-4 border-t-2 border-[#1B1B3A]/20 text-xs font-mono-retro font-bold">
        <span>[ 56 KBPS COURIER ROUTE ]</span>
        <a
          href="#character"
          className="flex items-center gap-1.5 hover:underline text-[#1B1B3A]"
        >
          <span>SCROLL FOR CHARACTER SHEET</span>
          <ArrowDown className="w-4 h-4 animate-bounce" />
        </a>
      </div>
    </section>
  );
};
