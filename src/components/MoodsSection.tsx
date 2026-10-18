import React from 'react';
import { PingletSvg } from './PingletSvg';
import type { PingletMood } from '../game/packetRules';
import { audioSystem } from '../utils/audioSynth';
import { Sparkles, Eye, Zap, Moon, Check } from 'lucide-react';

interface MoodsSectionProps {
  currentMood: PingletMood;
  onSelectMood: (mood: PingletMood) => void;
}

export const MoodsSection: React.FC<MoodsSectionProps> = ({
  currentMood,
  onSelectMood,
}) => {
  const moodPanels: Array<{
    id: PingletMood;
    title: string;
    bgClass: string;
    textClass: string;
    ghostWord: string;
    tag: string;
    tagColor: string;
    narrative: string;
    quote: string;
    stats: string;
    isRightAligned: boolean;
  }> = [
    {
      id: 'shy',
      title: 'SHY & PEEKING',
      bgClass: 'bg-[#B9A7FF]',
      textClass: 'text-[#1B1B3A]',
      ghostWord: 'PEEK',
      tag: '[ - MOOD 01 : SHY & PEEKING - ]',
      tagColor: 'bg-[#1B1B3A] text-[#9FF3D3]',
      narrative:
        'When meeting a new monitor for the first time, I tuck my stubby clay arms close and peek around the corner of the browser window. My cheeks flush warm peach, and my LED antennae glow with a gentle, steady pulse. I am always listening, never scary.',
      quote: '“I promise I’m friendly... just let me check if the packet is safe first.”',
      stats: 'ANTENNAE: 3.2 Hz PULSE • BLUSH: 100% PEACH',
      isRightAligned: false,
    },
    {
      id: 'excited',
      title: 'EXCITED WITH ARMS UP',
      bgClass: 'bg-[#9FF3D3]',
      textClass: 'text-[#1B1B3A]',
      ghostWord: 'CHEER',
      tag: '[ - MOOD 02 : EXCITED & CHEERING - ]',
      tagColor: 'bg-[#1B1B3A] text-[#FFB088]',
      narrative:
        'A packet has arrived! When a lost hello successfully crosses the copper wires, both of my LED antenna tufts light up at full power. My arms shoot up in celebration, static stars sparkle around my wavy tail, and I do little 56k victory spins across the desktop.',
      quote: '“WE DID IT! The message didn’t get lost in the bit-rot!”',
      stats: 'ANTENNAE: 10 Hz STROBE • JOY: OVERFLOW',
      isRightAligned: true,
    },
    {
      id: 'sleepy',
      title: 'SLEEPY WITH CLOSED EYES',
      bgClass: 'bg-[#1B1B3A]',
      textClass: 'text-[#FFF8EE]',
      ghostWord: 'DREAM',
      tag: '[ - MOOD 03 : SLEEPY 3:00 AM - ]',
      tagColor: 'bg-[#B9A7FF] text-[#1B1B3A]',
      narrative:
        'Late at night, when the attic computer monitor slips into sleep mode, my eyes close into soft curved arcs. I hover just millimeters above the mousepad, breathing gentle static whispers. Two tiny antenna LEDs remain on as nightlights for anyone still awake.',
      quote: '“Even packet couriers need to recharge their phosphor glow...”',
      stats: 'ANTENNAE: 0.8 Hz NIGHTLIGHT • STATE: DOWNTIME',
      isRightAligned: false,
    },
    {
      id: 'glitchy',
      title: 'GLITCHY 3AM HANDSHAKE',
      bgClass: 'bg-[#2A1B4E]',
      textClass: 'text-[#9FF3D3]',
      ghostWord: 'SIGNAL',
      tag: '[ - MOOD 04 : 3AM ATTIC HANDSHAKE - ]',
      tagColor: 'bg-[#FFB088] text-[#1B1B3A]',
      narrative:
        'KSHHHH-BZZT! At 3:00 AM on the dot, or whenever someone picks up the landline phone downstairs, my translucent body vibrates with chromatic RGB split! Cyan and lavender static flares illuminate the attic. It tickles, and it means the handshake protocol has begun.',
      quote: '“Bzzzt! Carrier detected at 56,000 baud! Hold on to your packets!”',
      stats: 'RGB OFFSET: ±4px • SCANLINES: 100% CRT',
      isRightAligned: true,
    },
  ];

  const handleActivateMood = (m: PingletMood) => {
    onSelectMood(m);
    audioSystem.playTone(m === 'glitchy' ? 240 : m === 'excited' ? 659.25 : 440, 0.2, 'triangle');
  };

  return (
    <section id="moods" className="w-full">
      {/* Mood Section Intro Header */}
      <div className="bg-[#1B1B3A] text-[#FFF8EE] p-6 sm:p-10 border-b-4 border-black text-center">
        <span className="font-mono-retro text-xs sm:text-sm font-bold text-[#9FF3D3] tracking-widest uppercase block mb-1">
          // EXPRESSION MATRIX
        </span>
        <h2 className="font-display text-6xl sm:text-7xl md:text-8xl tracking-tight text-[#FFF8EE]">
          THE 4 MOODS OF PINGLET
        </h2>
        <p className="font-body text-sm sm:text-base text-[#FFF8EE]/80 max-w-xl mx-auto mt-2">
          Click any mood panel to transform Pinglet&apos;s expression, antenna pulse, and 3D pose in real time.
        </p>
      </div>

      {/* 4 Alternating Left / Right Color-Blocked Panels */}
      {moodPanels.map((p, idx) => {
        const isCurrent = currentMood === p.id;
        return (
          <div
            key={p.id}
            className={`relative w-full ${p.bgClass} ${p.textClass} p-6 sm:p-10 md:p-16 border-b-4 border-[#1B1B3A] overflow-hidden transition-colors duration-300`}
          >
            {/* Big Pale Circle Arc Background */}
            <div
              className={`absolute w-[450px] h-[450px] rounded-full border-[36px] border-white/20 pointer-events-none ${
                p.isRightAligned ? '-top-32 -left-32' : '-bottom-32 -right-32'
              }`}
            />

            {/* Giant Ghosted Background Word */}
            <div
              className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden"
              aria-hidden="true"
            >
              <span className="font-display text-[24vw] leading-none text-black/10 tracking-widest font-extrabold translate-y-6">
                {p.ghostWord}
              </span>
            </div>

            {/* Content Container */}
            <div className="relative z-10 max-w-6xl mx-auto">
              {/* Corner Mood Tag */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono-retro font-bold uppercase tracking-widest mb-6 sm:mb-8">
                <span className={`px-3 py-1 rounded-sm ${p.tagColor}`}>
                  {p.tag}
                </span>
                <span className="px-3 py-1 bg-black/20 rounded-sm font-mono-retro text-[11px]">
                  {p.stats}
                </span>
              </div>

              {/* Grid: 2 Columns Alternating */}
              <div className="grid md:grid-cols-12 gap-8 sm:gap-12 items-center">
                {/* Character Pose SVG (reorders on alternating panels) */}
                <div
                  className={`md:col-span-5 flex flex-col items-center justify-center ${
                    p.isRightAligned ? 'md:order-2' : 'md:order-1'
                  }`}
                >
                  <div
                    onClick={() => handleActivateMood(p.id)}
                    className="w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 cursor-pointer transform hover:scale-105 active:scale-95 transition-transform"
                    title={`Click to set Pinglet to ${p.title}`}
                  >
                    <PingletSvg mood={p.id} size={280} />
                  </div>
                </div>

                {/* Text & Narrative (under 150 words) */}
                <div
                  className={`md:col-span-7 space-y-4 ${
                    p.isRightAligned ? 'md:order-1' : 'md:order-2'
                  }`}
                >
                  <h3 className="font-display text-5xl sm:text-6xl md:text-7xl tracking-tight leading-none">
                    {p.title}
                  </h3>

                  <blockquote className="text-base sm:text-lg italic font-body opacity-90 pl-3 border-l-4 border-current">
                    {p.quote}
                  </blockquote>

                  <p className="font-body text-sm sm:text-base leading-relaxed opacity-95">
                    {p.narrative}
                  </p>

                  <div className="pt-2">
                    <button
                      onClick={() => handleActivateMood(p.id)}
                      className={`px-5 py-3 rounded-xl font-display text-2xl tracking-wider transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer shadow-lg border-2 border-black ${
                        isCurrent
                          ? 'bg-[#1B1B3A] text-[#9FF3D3] ring-4 ring-white'
                          : 'bg-white text-[#1B1B3A] hover:bg-[#FFF8EE]'
                      }`}
                    >
                      {isCurrent ? (
                        <>
                          <Check className="w-5 h-5" /> CURRENT 3D POSE
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 fill-current" /> ACTIVATE THIS POSE
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
};
