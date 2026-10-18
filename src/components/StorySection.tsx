import React from 'react';
import { PingletSvg } from './PingletSvg';
import { Moon, Cable, Inbox, Home, Sparkles, Clock, Compass } from 'lucide-react';

export const StorySection: React.FC = () => {
  const chapters = [
    {
      num: 'CHAPTER 01',
      title: 'THE 3:00 AM WHISTLE',
      location: 'Dusty Attic PC // 1999',
      icon: Moon,
      mood: 'shy' as const,
      bg: 'from-[#12122b] to-[#1a1a38]',
      accent: '#9FF3D3',
      text: 'The house was fast asleep when the beige tower fan hummed to life. High pitch squeals, static rushing like sea waves, and a tiny spark leapt from the monitor’s glass face. I opened my eyes in the dark attic. Two warm LED tufts sprouted on my head, and an empty courier pouch was placed around my shoulder.',
      detail: '“The dial-up sound wasn’t noise to me. It sounded like someone calling my name.”',
    },
    {
      num: 'CHAPTER 02',
      title: 'COPPER WIRE HIGHWAYS',
      location: 'Underground Telephone Cables',
      icon: Cable,
      mood: 'excited' as const,
      bg: 'from-[#1a1a38] to-[#25254d]',
      accent: '#B9A7FF',
      text: 'Down into the wall jacks I slid! Copper cables curled like rollercoasters through neighborhood soil. Packets zipped by like glowing fireflies. I learned how to dodge heavy static spikes and bit-rot puddles by tucking my tail and surfing on the 56k carrier wave.',
      detail: '“The wires are warm and smell faintly of ozone and old conversations.”',
    },
    {
      num: 'CHAPTER 03',
      title: 'THE UNSENT MAILBOX',
      location: 'Sub-Routing Hub #0404',
      icon: Inbox,
      mood: 'glitchy' as const,
      bg: 'from-[#25254d] to-[#1c1c3f]',
      accent: '#FFB088',
      text: 'Deep in the junction box, I discovered a mountain of forgotten letters: drafts people were too nervous to send, apologize notes written at 2 a.m., and simple hellos left unclicked. I took each one, folded it into a glowing phosphor packet, and stamped it with attic care.',
      detail: '“No hello is too small to be delivered. That’s courier rule number one.”',
    },
    {
      num: 'CHAPTER 04',
      title: 'GENTLE DELIVERY',
      location: 'A Glowing Bedroom Window',
      icon: Home,
      mood: 'sleepy' as const,
      bg: 'from-[#1c1c3f] to-[#12122b]',
      accent: '#9FF3D3',
      text: 'I tapped lightly against the cold glass of a sleeping laptop screen. A tiny phosphor green blip flashed in the corner, leaving behind a soft warm glow. The message was safely delivered. With my little courier task finished, I curled into a sleepy ball as the sunrise kissed the wires.',
      detail: '“You’ve got mail: a hug from across the wires.”',
    },
  ];

  return (
    <section
      id="story"
      className="relative w-full bg-[#1B1B3A] text-[#FFF8EE] p-6 sm:p-10 md:p-16 border-b-4 border-black overflow-hidden"
    >
      {/* Ghosted Background Word */}
      <div
        className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <span className="font-display text-[22vw] leading-none text-white/5 tracking-wider font-extrabold">
          JOURNEY
        </span>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#9FF3D3] text-[#1B1B3A] text-xs font-mono-retro font-bold uppercase tracking-widest mb-3">
            <Compass className="w-3.5 h-3.5" /> [ - CHRONICLES OF A 56K BABY GHOST - ]
          </div>
          <h2 className="font-display text-6xl sm:text-7xl md:text-8xl tracking-tight text-[#9FF3D3]">
            PINGLET&apos;S STORY
          </h2>
          <p className="font-body text-sm sm:text-base text-[#FFF8EE]/80 max-w-xl mx-auto mt-2">
            Scroll from the dark dusty attic down through copper wire highways to a glowing morning window.
          </p>
        </div>

        {/* Timeline Path */}
        <div className="relative border-l-4 border-dashed border-[#B9A7FF]/40 ml-4 sm:ml-8 md:ml-12 pl-6 sm:pl-10 space-y-12 sm:space-y-16">
          {chapters.map((ch, idx) => {
            const Icon = ch.icon;
            return (
              <div
                key={ch.num}
                className="relative bg-gradient-to-br bg-[#212145] rounded-3xl p-6 sm:p-8 border-3 border-white/10 shadow-2xl transition-all duration-300 hover:border-[#9FF3D3]/60 group"
              >
                {/* Timeline node circle */}
                <div
                  className="absolute -left-[35px] sm:-left-[51px] top-8 w-8 h-8 sm:w-10 sm:h-10 rounded-full border-4 border-[#1B1B3A] flex items-center justify-center shadow-md"
                  style={{ backgroundColor: ch.accent }}
                >
                  <Icon className="w-4 h-4 text-[#1B1B3A]" />
                </div>

                <div className="grid md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-8 space-y-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono-retro">
                      <span
                        className="px-2.5 py-0.5 rounded font-bold text-[#1B1B3A]"
                        style={{ backgroundColor: ch.accent }}
                      >
                        {ch.num}
                      </span>
                      <span className="text-white/60">• {ch.location}</span>
                    </div>

                    <h3 className="font-display text-4xl sm:text-5xl text-[#FFF8EE] tracking-wide">
                      {ch.title}
                    </h3>

                    <p className="font-body text-sm sm:text-base text-[#FFF8EE]/90 leading-relaxed">
                      {ch.text}
                    </p>

                    <blockquote
                      className="p-3 bg-[#12122b] rounded-xl border-l-4 font-mono-retro text-xs sm:text-sm italic text-[#FFF8EE]/80"
                      style={{ borderColor: ch.accent }}
                    >
                      {ch.detail}
                    </blockquote>
                  </div>

                  {/* Character Illustration Thumbnail */}
                  <div className="md:col-span-4 flex flex-col items-center justify-center">
                    <div className="w-36 h-36 sm:w-44 sm:h-44 bg-[#12122b] rounded-2xl p-3 border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <PingletSvg mood={ch.mood} size={150} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
