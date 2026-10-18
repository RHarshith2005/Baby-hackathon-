import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { PingletSvg } from './PingletSvg';
import { audioSystem } from '../utils/audioSynth';

interface StickerWish {
  id: string;
  text: string;
  color: string;
  tilt: number;
}

const STICKER_COLORS = ['#FFF0B3', '#9FF3D3', '#B9A7FF', '#FFD1E6', '#FFF8EE'];

const DEFAULT_STICKERS: StickerWish[] = [
  { id: 's-1', text: 'Hello from 3:00 a.m.!', color: '#FFF0B3', tilt: -3 },
  { id: 's-2', text: 'Sending you a candy-wrapped hug!', color: '#9FF3D3', tilt: 2 },
  { id: 's-3', text: 'Still awake under the CRT glow ✨', color: '#B9A7FF', tilt: -2 },
  { id: 's-4', text: 'Don’t pick up the phone, Mom!', color: '#FFD1E6', tilt: 3 },
];

interface WishWallProps {
  onIncrementHellos?: () => void;
}

export const WishWall: React.FC<WishWallProps> = React.memo(({ onIncrementHellos }) => {
  const [stickers, setStickers] = useState<StickerWish[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('pinglet_sticker_wishes');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    } catch {
      // Fallback to default stickers if localStorage is unavailable
    }
    return DEFAULT_STICKERS;
  });

  const [helloInput, setHelloInput] = useState('');

  const handleAddSticker = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = helloInput.trim();
    if (!trimmed) return;

    const nextSticker: StickerWish = {
      id: `st-${Date.now()}`,
      text: trimmed,
      color: STICKER_COLORS[stickers.length % STICKER_COLORS.length],
      tilt: ((stickers.length % 5) - 2) * 2,
    };

    const updated = [nextSticker, ...stickers].slice(0, 24);
    setStickers(updated);

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('pinglet_sticker_wishes', JSON.stringify(updated));
      }
    } catch {
      // Safely ignore quota/privacy errors
    }

    setHelloInput('');
    if (onIncrementHellos) {
      onIncrementHellos();
    }
    audioSystem.playTone(523.25, 0.16, 'triangle');
    window.setTimeout(() => audioSystem.playTone(659.25, 0.24, 'sine'), 90);
  };

  return (
    <div id="wish-wall" className="relative w-full bg-[#FFC9A8] text-[#1B1B3A] px-4 sm:px-8 md:px-14 py-12 sm:py-16 border-b-4 border-[#1B1B3A] overflow-hidden scroll-mt-24 sm:scroll-mt-28">
      {/* Pale Oversized Circle Arc */}
      <div
        className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full border-[42px] border-white/30 pointer-events-none"
        aria-hidden="true"
      />

      {/* Huge Ghosted Word Behind Character */}
      <div
        className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <span className="font-display text-[26vw] leading-none text-white/40 tracking-widest font-extrabold">
          WISHES
        </span>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Tiny Corner Mood Tag with Dash Mark */}
        <div className="flex items-center justify-between gap-2 mb-6 text-xs font-mono-retro font-bold uppercase tracking-widest">
          <span className="px-3.5 py-1.5 rounded-full bg-[#1B1B3A] text-[#FFC9A8]">
            &mdash; WORK 03 : STICKER WALL
          </span>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Left: Heading (3 words), Caption (<15 words), Input + Pinglet Render */}
          <div className="lg:col-span-5 text-center lg:text-left space-y-5">
            <h2 className="font-display text-6xl sm:text-8xl tracking-tight leading-[0.88] uppercase">
              THE WISH WALL
            </h2>

            <p className="font-rounded font-semibold text-xl sm:text-2xl leading-snug">
              Type a tiny hello to pin a glossy candy sticker on the wall.
            </p>

            <form onSubmit={handleAddSticker} className="flex flex-col sm:flex-row gap-2.5">
              <label htmlFor="wish-sticker-input" className="sr-only">
                Type a tiny hello for the sticker wall
              </label>
              <input
                id="wish-sticker-input"
                type="text"
                value={helloInput}
                onChange={(e) => setHelloInput(e.target.value)}
                placeholder="Write a tiny hello..."
                maxLength={70}
                required
                className="flex-1 min-h-[48px] px-4 py-2.5 rounded-full bg-[#FFF8EE] text-[#1B1B3A] font-rounded font-semibold text-base border-3 border-[#1B1B3A] focus:outline-none focus:ring-4 focus:ring-[#9FF3D3]"
              />
              <button
                type="submit"
                className="min-h-[48px] px-6 py-2.5 rounded-full bg-[#1B1B3A] text-[#FFF0B3] font-rounded font-bold text-sm sm:text-base uppercase tracking-wider border-3 border-[#1B1B3A] toy-button-gloss flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" /> PIN STICKER
              </button>
            </form>

            <div className="w-44 h-44 mx-auto lg:mx-0 animate-toy-float">
              <PingletSvg
                mood="excited"
                size={176}
                showBackdrop={false}
                className="w-full h-auto"
                alt="Pinglet holding a candy-wrapped envelope next to the wish sticker wall"
              />
            </div>
          </div>

          {/* Right: Glossy Die-Cut Sticker Wall */}
          <div className="lg:col-span-7 bg-[#1B1B3A] p-5 sm:p-7 rounded-[2.5rem] border-4 border-[#1B1B3A] toy-panel-shadow">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[380px] overflow-y-auto p-2">
              {stickers.map((st) => (
                <div
                  key={st.id}
                  style={{
                    backgroundColor: st.color,
                    transform: `rotate(${st.tilt}deg)`,
                  }}
                  className="p-4 rounded-3xl border-4 border-white shadow-[0_10px_20px_rgba(0,0,0,0.35)] text-[#1B1B3A] flex items-start gap-2.5 transition-transform hover:scale-105"
                >
                  <span className="text-xl shrink-0" aria-hidden="true">
                    💌
                  </span>
                  <p className="font-rounded font-bold text-base sm:text-lg leading-snug break-words">
                    {st.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

WishWall.displayName = 'WishWall';
