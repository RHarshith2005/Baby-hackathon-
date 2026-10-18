import React from 'react';
import { PingletSvg, type StorySceneVariant } from './PingletSvg';
import type { PingletMood } from '../game/packetRules';

export const StorySection: React.FC = () => {
  const scenes: Array<{
    id: string;
    heading: string;
    caption: string;
    cornerTag: string;
    ghostWord: string;
    mood: PingletMood;
    variant: StorySceneVariant;
    skyGradient: string;
  }> = [
    {
      id: 'scene-attic',
      heading: 'DARK ATTIC',
      caption: 'Three a.m. inside a dusty forgotten attic.',
      cornerTag: '— SCENE 01 : DUSK',
      ghostWord: '3AM',
      mood: 'shy',
      variant: 'attic',
      skyGradient: 'from-[#E86FA0] via-[#B464A3] to-[#6B468C]',
    },
    {
      id: 'scene-glitch',
      heading: 'HANDSHAKE GLITCH',
      caption: 'A dial-up modem sparked through the static.',
      cornerTag: '— SCENE 02 : TWILIGHT',
      ghostWord: 'SPARK',
      mood: 'glitchy',
      variant: 'glitch',
      skyGradient: 'from-[#6B468C] via-[#432F70] to-[#281E52]',
    },
    {
      id: 'scene-delivery',
      heading: 'FIRST DELIVERY',
      caption: 'One candy-wrapped hello floated into the wires.',
      cornerTag: '— SCENE 03 : MIDNIGHT',
      ghostWord: 'FLY',
      mood: 'excited',
      variant: 'delivery',
      skyGradient: 'from-[#281E52] via-[#1F1A45] to-[#1B1B3A]',
    },
    {
      id: 'scene-neighborhood',
      heading: 'GLOWING NEIGHBORHOOD',
      caption: 'Every sleeping bedroom window began to glow.',
      cornerTag: '— SCENE 04 : DEEP NIGHT',
      ghostWord: 'GLOW',
      mood: 'sleepy',
      variant: 'neighborhood',
      skyGradient: 'from-[#1B1B3A] via-[#151530] to-[#0E0E24]',
    },
  ];

  return (
    <section id="story" aria-label="Pinglet Scroll-Driven Story" className="w-full">
      {scenes.map((sc, idx) => (
        <div
          key={sc.id}
          className={`relative w-full min-h-[82vh] bg-gradient-to-b ${sc.skyGradient} text-[#FFF8EE] px-4 sm:px-8 md:px-14 py-12 sm:py-16 border-b-4 border-[#1B1B3A] flex flex-col justify-between overflow-hidden`}
        >
          {/* Pale Oversized Circle Arc */}
          <div
            className={`absolute w-[420px] h-[420px] rounded-full border-[40px] border-white/10 pointer-events-none ${
              idx % 2 === 0 ? '-top-28 -right-28' : '-bottom-28 -left-28'
            }`}
            aria-hidden="true"
          />

          {/* Huge Ghosted Word Behind Character */}
          <div
            className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden"
            aria-hidden="true"
          >
            <span className="font-display text-[28vw] leading-none text-white/10 tracking-widest font-extrabold">
              {sc.ghostWord}
            </span>
          </div>

          {/* Tiny Corner Tag with Dash Mark */}
          <div className="relative z-10 max-w-6xl mx-auto w-full flex items-center justify-between text-xs font-mono-retro font-bold uppercase tracking-widest">
            <span className="px-3.5 py-1.5 rounded-full bg-[#1B1B3A]/80 text-[#FFF0B3] border border-white/20">
              {sc.cornerTag}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/15 text-[#9FF3D3]">
              0{idx + 1} / 04
            </span>
          </div>

          {/* Center Image-Led Story Scene (Under 10 Words Caption) */}
          <div className="relative z-10 max-w-5xl mx-auto w-full flex flex-col items-center text-center my-6 space-y-5 transition-transform duration-500">
            <div className="w-full max-w-[320px] sm:max-w-[360px] animate-toy-float">
              <PingletSvg
                mood={sc.mood}
                sceneVariant={sc.variant}
                size={360}
                className="w-full h-auto"
                alt={`Story scene ${idx + 1} (${sc.heading}): ${sc.caption}`}
              />
            </div>

            <h2 className="font-display text-6xl sm:text-8xl tracking-tight leading-none uppercase text-[#FFF0B3]">
              {sc.heading}
            </h2>

            <p className="font-rounded font-semibold text-xl sm:text-2xl md:text-3xl text-[#FFF8EE] max-w-lg leading-snug">
              {sc.caption}
            </p>
          </div>

          <div className="h-2" aria-hidden="true" />
        </div>
      ))}
    </section>
  );
};
