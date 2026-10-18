import React from 'react';
import { PingletSvg } from './PingletSvg';
import { Sparkles } from 'lucide-react';
import { KineticTitle } from './KineticTitle';
import { motion } from 'motion/react';

export const CharacterSheet: React.FC = React.memo(() => {
  const fields = [
    {
      label: 'NAME',
      value: 'Pinglet · Series 01 (#0404)',
      pillBg: 'bg-[#9FF3D3]',
    },
    {
      label: 'WHAT THEY ARE',
      value: 'Mint-lavender jelly-resin baby ghost with glitter and gumdrop antennae.',
      pillBg: 'bg-[#B9A7FF]',
    },
    {
      label: 'WHAT THEY DO',
      value: 'Junior Packet Courier hand-delivering lost messages and unsent hellos.',
      pillBg: 'bg-[#FFC9A8]',
    },
    {
      label: 'THEIR STORY',
      value: 'Born at 3 a.m. when an attic dial-up modem sang.',
      pillBg: 'bg-[#FFF0B3]',
    },
    {
      label: 'TAGLINE',
      value: '“I carry little hellos across the wires.”',
      pillBg: 'bg-[#E86FA0] text-white',
    },
  ];

  return (
    <section
      id="meet"
      aria-label="Meet Pinglet Blind-Box Card"
      className="relative w-full bg-[#FFF8EE] text-[#1B1B3A] px-4 sm:px-8 md:px-14 py-12 sm:py-16 border-b-4 border-[#1B1B3A] overflow-hidden scroll-mt-24 sm:scroll-mt-28"
    >
      {/* Pale Oversized Circle Arcs */}
      <div
        className="absolute -top-28 -right-28 w-96 h-96 rounded-full border-[40px] border-[#9FF3D3]/35 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-28 -left-28 w-96 h-96 rounded-full border-[40px] border-[#B9A7FF]/30 pointer-events-none"
        aria-hidden="true"
      />

      {/* Huge Ghosted Word Behind Character */}
      <div
        className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <span className="font-display text-[26vw] leading-none text-[#1B1B3A]/[0.06] tracking-wider font-extrabold">
          UNBOX
        </span>
      </div>

      {/* Tiny Corner Mood Tag with Dash Mark */}
      <div className="relative z-10 max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2 mb-6 text-xs font-mono-retro font-bold uppercase tracking-widest">
        <span className="px-3.5 py-1.5 rounded-full bg-[#1B1B3A] text-[#FFF0B3]">
          &mdash; BLIND BOX : SERIES 01
        </span>

        {/* Retro-Web Touch #2: Under Construction Sticker */}
        <span className="px-3.5 py-1.5 rounded-full bg-[#FFF0B3] text-[#1B1B3A] border-2 border-[#1B1B3A] shadow-sm flex items-center gap-1.5">
          <span>🚧</span>
          <span>UNDER CONSTRUCTION · 3:00 AM</span>
        </span>
      </div>

      {/* Section Heading (2 words) + Fredoka Caption (<15 words) */}
      <div className="relative z-10 max-w-6xl mx-auto text-center lg:text-left mb-8">
        <KineticTitle
          as="h2"
          className="font-display text-6xl sm:text-8xl tracking-tight uppercase leading-none"
        >
          MEET PINGLET
        </KineticTitle>
        <p className="font-rounded font-medium text-lg sm:text-2xl text-[#1B1B3A]/85 mt-2">
          Collectible blind-box figure cast in translucent glitter jelly resin.
        </p>
      </div>

      {/* Collectible Blind-Box Packaging Card */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
        className="relative z-10 max-w-6xl mx-auto bg-gradient-to-br from-[#FFC9A8] via-[#FFF0B3] to-[#9FF3D3] p-4 sm:p-8 rounded-[2.5rem] border-4 border-[#1B1B3A] toy-panel-shadow grid lg:grid-cols-12 gap-6 sm:gap-8 items-center"
      >
        {/* Left: Glossy Blister Window with Pinglet Render */}
        <div className="lg:col-span-5 bg-[#FFF8EE]/90 rounded-[2rem] p-4 sm:p-6 border-3 border-[#1B1B3A] toy-card-gloss flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-xs font-mono-retro font-bold text-[#1B1B3A] mb-2">
            <span className="inline-flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#E86FA0]" /> RARITY: SECRET 1/144
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#9FF3D3] border border-[#1B1B3A]">
              GLITTER EDITION
            </span>
          </div>

          <div className="w-full max-w-[300px]">
            <PingletSvg
              mood="shy"
              size={300}
              className="w-full h-auto"
              alt="Pinglet blind-box collectible figure peeking shyly behind a candy-wrapped envelope"
            />
          </div>
        </div>

        {/* Right: 5-Point Character Sheet (Each field under 12 words) */}
        <div className="lg:col-span-7 grid gap-3 sm:gap-3.5">
          {fields.map((f) => (
            <div
              key={f.label}
              className="bg-[#FFF8EE] rounded-2xl p-3.5 sm:p-4 border-3 border-[#1B1B3A] toy-card-gloss flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <span
                className={`inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full font-mono-retro font-bold text-xs uppercase border-2 border-[#1B1B3A] shrink-0 ${f.pillBg}`}
              >
                <Sparkles className="w-3 h-3" />
                {f.label}
              </span>
              <p className="font-rounded font-bold text-base sm:text-lg text-[#1B1B3A] sm:text-right leading-snug">
                {f.value}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
});

CharacterSheet.displayName = 'CharacterSheet';
