import React from 'react';
import { PingletSvg } from './PingletSvg';
import type { PingletMood } from '../game/packetRules';
import { audioSystem } from '../utils/audioSynth';
import { Sparkles, Check } from 'lucide-react';

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
    heading: string;
    caption: string;
    ghostWord: string;
    cornerTag: string;
    bgClass: string;
    textClass: string;
    tagClass: string;
    isRightAligned: boolean;
  }> = [
    {
      id: 'shy',
      heading: 'SHY PEEK',
      caption: 'Peeking from behind a candy envelope with glowing pixel-heart cheeks.',
      ghostWord: 'SHY',
      cornerTag: '— MOOD 01 : SHY',
      bgClass: 'bg-[#9FF3D3]',
      textClass: 'text-[#1B1B3A]',
      tagClass: 'bg-[#1B1B3A] text-[#9FF3D3]',
      isRightAligned: false,
    },
    {
      id: 'excited',
      heading: 'SO EXCITED',
      caption: 'Arms up and gumdrop antennae sparkling when a hello arrives!',
      ghostWord: 'YAY',
      cornerTag: '— MOOD 02 : EXCITED',
      bgClass: 'bg-[#FFC9A8]',
      textClass: 'text-[#1B1B3A]',
      tagClass: 'bg-[#1B1B3A] text-[#FFF0B3]',
      isRightAligned: true,
    },
    {
      id: 'sleepy',
      heading: 'SLEEPY CLOUD',
      caption: 'Resting closed eyes on a butter-soft cloud between late-night deliveries.',
      ghostWord: 'ZZZ',
      cornerTag: '— MOOD 03 : SLEEPY',
      bgClass: 'bg-[#B9A7FF]',
      textClass: 'text-[#1B1B3A]',
      tagClass: 'bg-[#1B1B3A] text-[#B9A7FF]',
      isRightAligned: false,
    },
    {
      id: 'glitchy',
      heading: '3AM GLITCH',
      caption: 'Fizzing with rainbow RGB static when the midnight modem sings.',
      ghostWord: '56K',
      cornerTag: '— MOOD 04 : GLITCHY',
      bgClass: 'bg-[#1B1B3A]',
      textClass: 'text-[#FFF8EE]',
      tagClass: 'bg-[#E86FA0] text-[#1B1B3A]',
      isRightAligned: true,
    },
  ];

  return (
    <section id="moods" aria-label="Pinglet Moods Showcase" className="w-full">
      {moodPanels.map((p) => {
        const isCurrent = currentMood === p.id;
        return (
          <div
            key={p.id}
            className={`relative w-full ${p.bgClass} ${p.textClass} px-4 sm:px-8 md:px-14 py-12 sm:py-16 border-b-4 border-[#1B1B3A] overflow-hidden`}
          >
            {/* Pale Oversized Circle Arc */}
            <div
              className={`absolute w-[440px] h-[440px] rounded-full border-[44px] border-white/25 pointer-events-none ${
                p.isRightAligned ? '-top-32 -left-32' : '-bottom-32 -right-32'
              }`}
              aria-hidden="true"
            />

            {/* Huge Ghosted Word Behind Character */}
            <div
              className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden"
              aria-hidden="true"
            >
              <span
                className={`font-display text-[28vw] leading-none tracking-widest font-extrabold ${
                  p.id === 'glitchy' ? 'text-white/10' : 'text-white/40'
                }`}
              >
                {p.ghostWord}
              </span>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto">
              {/* Tiny Corner Mood Tag with Dash Mark */}
              <div className="flex items-center justify-between gap-2 mb-6 text-xs font-mono-retro font-bold uppercase tracking-widest">
                <span className={`px-3.5 py-1.5 rounded-full ${p.tagClass}`}>
                  {p.cornerTag}
                </span>
              </div>

              {/* Alternating Left / Right Grid */}
              <div className="grid md:grid-cols-12 gap-6 sm:gap-10 items-center">
                {/* Big Pinglet Render */}
                <div
                  className={`md:col-span-6 flex items-center justify-center ${
                    p.isRightAligned ? 'md:order-2' : 'md:order-1'
                  }`}
                >
                  <div className="w-full max-w-[340px] sm:max-w-[380px] animate-toy-float">
                    <PingletSvg
                      mood={p.id}
                      size={380}
                      className="w-full h-auto"
                      alt={`Pinglet 3D jelly-resin designer toy in ${p.id} mood: ${p.caption}`}
                    />
                  </div>
                </div>

                {/* Stacked Heading (2 words) + Caption (<15 words in Fredoka) */}
                <div
                  className={`md:col-span-6 text-center md:text-left space-y-4 ${
                    p.isRightAligned ? 'md:order-1' : 'md:order-2'
                  }`}
                >
                  <h2 className="font-display text-6xl sm:text-8xl md:text-9xl tracking-tight leading-[0.88] uppercase">
                    {p.heading}
                  </h2>

                  <p className="font-rounded font-semibold text-xl sm:text-2xl max-w-md mx-auto md:mx-0 leading-snug opacity-95">
                    {p.caption}
                  </p>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectMood(p.id);
                        audioSystem.playTone(
                          p.id === 'glitchy' ? 240 : p.id === 'excited' ? 659.25 : 440,
                          0.18,
                          'triangle'
                        );
                      }}
                      className={`min-h-[48px] px-6 py-2.5 rounded-full font-rounded font-bold text-sm sm:text-base uppercase tracking-wider border-3 border-[#1B1B3A] toy-button-gloss inline-flex items-center gap-2 cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-[#FFF0B3] text-[#1B1B3A]'
                          : 'bg-white text-[#1B1B3A] hover:bg-[#FFF8EE]'
                      }`}
                    >
                      {isCurrent ? (
                        <>
                          <Check className="w-4 h-4" /> ACTIVE POSE
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" /> SET {p.id.toUpperCase()} POSE
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
