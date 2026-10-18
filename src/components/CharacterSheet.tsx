import React from 'react';
import { PingletSvg } from './PingletSvg';
import { ShieldCheck, Cpu, Radio, Sparkles, Feather, FileText, Bookmark } from 'lucide-react';

export const CharacterSheet: React.FC = () => {
  return (
    <section
      id="character"
      className="relative w-full bg-[#FFF8EE] text-[#1B1B3A] p-4 sm:p-8 md:p-12 lg:p-16 border-t-4 border-b-4 border-[#1B1B3A] overflow-hidden"
    >
      {/* Ghosted background word */}
      <div
        className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <span className="font-display text-[20vw] leading-none text-[#1B1B3A]/5 tracking-wider font-extrabold">
          DOSSIER
        </span>
      </div>

      {/* Pale circle arc background accent */}
      <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full border-[36px] border-[#9FF3D3]/30 pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full border-[28px] border-[#B9A7FF]/25 pointer-events-none" />

      {/* Top Corner Mood Tag */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono-retro font-bold uppercase tracking-widest mb-6">
        <span className="px-3 py-1 bg-[#1B1B3A] text-[#FFF8EE] rounded-sm">
          [ - ARCHIVE RECORD : 0404.DAT - ]
        </span>
        <span className="px-3 py-1 bg-[#FFB088] text-[#1B1B3A] border border-[#1B1B3A] rounded-sm">
          [ - CLEARANCE : COURIER LEVEL 1 - ]
        </span>
      </div>

      {/* Giant Heading */}
      <div className="relative z-10 mb-8 sm:mb-12">
        <span className="font-mono-retro text-xs sm:text-sm font-bold text-[#FFB088] tracking-widest uppercase block mb-1">
          // FIELD MANUAL & REGISTRY
        </span>
        <h2 className="font-display text-6xl sm:text-7xl md:text-8xl tracking-tight text-[#1B1B3A] leading-none">
          CHARACTER SHEET
        </h2>
      </div>

      {/* Main Profile Card Layout */}
      <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Card: Visual ID & Retro Seal */}
        <div className="lg:col-span-5 bg-[#1B1B3A] text-[#FFF8EE] rounded-3xl p-6 sm:p-8 border-4 border-[#1B1B3A] shadow-2xl flex flex-col justify-between relative overflow-hidden">
          {/* Top card header */}
          <div>
            <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-6">
              <span className="font-mono-retro text-xs text-[#9FF3D3] font-bold">
                ATTIC PACKET POST // ID BADGE
              </span>
              <span className="px-2 py-0.5 bg-[#9FF3D3] text-[#1B1B3A] text-[10px] font-mono-retro font-bold rounded-xs">
                OFFICIAL
              </span>
            </div>

            {/* Visual Portrait */}
            <div className="bg-[#26264d] rounded-2xl p-6 border-2 border-white/10 flex flex-col items-center justify-center relative mb-6">
              {/* Retro photo corner clips */}
              <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#9FF3D3]" />
              <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#9FF3D3]" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#9FF3D3]" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#9FF3D3]" />

              <div className="w-48 h-48 sm:w-56 sm:h-56">
                <PingletSvg mood="shy" size={224} />
              </div>

              <span className="font-mono-retro text-xs text-[#9FF3D3] mt-2 font-bold tracking-wider">
                SUBJECT: PINGLET (LIVE SPECIMEN)
              </span>
            </div>
          </div>

          {/* Under construction sticker */}
          <div className="bg-[#FFB088] text-[#1B1B3A] p-3 rounded-xl border-2 border-[#1B1B3A] font-mono-retro text-xs font-bold flex items-center gap-3 shadow-md">
            <div className="w-8 h-8 rounded-full bg-[#1B1B3A] text-[#FFB088] flex items-center justify-center shrink-0">
              🚧
            </div>
            <div>
              <span className="block uppercase tracking-wider text-[10px]">COURIER NOTICE</span>
              <span>UNDER GENTLE RECONSTRUCTION SINCE 1999</span>
            </div>
          </div>
        </div>

        {/* Right Card: The 5 Requested Fields */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 md:p-10 border-4 border-[#1B1B3A] shadow-xl flex flex-col justify-between">
          <div className="space-y-6">
            {/* Field 1: Name */}
            <div className="border-b-2 border-[#1B1B3A]/10 pb-4">
              <span className="text-xs font-mono-retro font-bold text-[#B9A7FF] uppercase tracking-wider block mb-1">
                01. NAME & CALLSIGN
              </span>
              <div className="flex flex-wrap items-baseline gap-3">
                <h3 className="font-display text-4xl sm:text-5xl text-[#1B1B3A]">
                  PINGLET
                </h3>
                <span className="font-mono-retro text-xs font-bold px-2.5 py-1 bg-[#B9A7FF]/20 text-[#1B1B3A] rounded border border-[#B9A7FF]">
                  PACKET ID: #0404-HELLO
                </span>
              </div>
            </div>

            {/* Field 2: What They Are */}
            <div className="border-b-2 border-[#1B1B3A]/10 pb-4">
              <span className="text-xs font-mono-retro font-bold text-[#9FF3D3] uppercase tracking-wider block mb-1">
                02. WHAT THEY ARE
              </span>
              <p className="font-display text-2xl sm:text-3xl text-[#1B1B3A] tracking-wide mb-1">
                BABY STATIC GHOST & CRT PHOSPHOR WISP
              </p>
              <p className="font-body text-sm text-[#1B1B3A]/80 leading-relaxed">
                Translucent mint-to-lavender body cast in soft vinyl gloss, endowed with two tiny blinking LED antenna tufts that tune into old telephone line frequencies.
              </p>
            </div>

            {/* Field 3: What They Do */}
            <div className="border-b-2 border-[#1B1B3A]/10 pb-4">
              <span className="text-xs font-mono-retro font-bold text-[#FFB088] uppercase tracking-wider block mb-1">
                03. WHAT THEY DO
              </span>
              <p className="font-display text-2xl sm:text-3xl text-[#1B1B3A] tracking-wide mb-1">
                JUNIOR PACKET COURIER OF THE OLD WEB
              </p>
              <p className="font-body text-sm text-[#1B1B3A]/80 leading-relaxed">
                Hand-delivers lost messages, unsent draft emails, forgotten AIM status whispers, and little hellos stranded inside copper wires and sleeping modems.
              </p>
            </div>

            {/* Field 4: Their Story */}
            <div className="border-b-2 border-[#1B1B3A]/10 pb-4">
              <span className="text-xs font-mono-retro font-bold text-[#1B1B3A] uppercase tracking-wider block mb-1">
                04. THEIR STORY (FIRST-PERSON ORIGIN)
              </span>
              <blockquote className="bg-[#FFF8EE] p-4 rounded-xl border-l-4 border-[#1B1B3A] font-body text-sm sm:text-base text-[#1B1B3A]/90 italic leading-relaxed">
                &ldquo;I woke up at exactly 3:00 a.m. when a dial-up handshake echoed through a forgotten computer in a dusty attic. The sound was like a lullaby made of static. When I rubbed my eyes, two tiny antenna LEDs blinked on my head, and a pouch full of unsent drafts was waiting for me.&rdquo;
              </blockquote>
            </div>

            {/* Field 5: Tagline */}
            <div>
              <span className="text-xs font-mono-retro font-bold text-[#FFB088] uppercase tracking-wider block mb-1">
                05. OFFICIAL COURIER TAGLINE
              </span>
              <div className="p-4 bg-[#9FF3D3]/30 rounded-xl border-2 border-[#1B1B3A]">
                <p className="font-display text-3xl sm:text-4xl text-[#1B1B3A] tracking-wide">
                  &ldquo;I carry little hellos across the wires.&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Quick Specifications Grid */}
          <div className="mt-6 pt-4 border-t-2 border-[#1B1B3A]/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono-retro">
            <div className="bg-[#FFF8EE] p-2.5 rounded-lg border border-[#1B1B3A]/20">
              <span className="text-[10px] text-[#1B1B3A]/60 block uppercase">Weight</span>
              <span className="font-bold">0.002 Kilobytes</span>
            </div>
            <div className="bg-[#FFF8EE] p-2.5 rounded-lg border border-[#1B1B3A]/20">
              <span className="text-[10px] text-[#1B1B3A]/60 block uppercase">Antennae</span>
              <span className="font-bold">Dual 520nm LEDs</span>
            </div>
            <div className="bg-[#FFF8EE] p-2.5 rounded-lg border border-[#1B1B3A]/20">
              <span className="text-[10px] text-[#1B1B3A]/60 block uppercase">Top Speed</span>
              <span className="font-bold">56,000 bps</span>
            </div>
            <div className="bg-[#FFF8EE] p-2.5 rounded-lg border border-[#1B1B3A]/20">
              <span className="text-[10px] text-[#1B1B3A]/60 block uppercase">Temperament</span>
              <span className="font-bold">Never Scary</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
