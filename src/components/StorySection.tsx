import React, { useRef, useState, useEffect } from 'react';
import { useScroll, useTransform, motion } from 'motion/react';
import { PingletSvg } from './PingletSvg';
import {
  STORY_CHAPTERS,
  getStoryChapter,
  getWirePointParametric,
  isWindowIlluminated,
} from '../game/storyRules';

export const StorySection: React.FC = React.memo(() => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (v) => {
      setCurrentProgress(v);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  // Interpolated Sky Gradient from Dusk to Deep Night
  const skyColor = useTransform(
    scrollYProgress,
    [0, 0.25, 0.5, 0.75, 1],
    ['#2D1B48', '#3C2364', '#261C4C', '#1B1B3A', '#0D0D1F']
  );

  // Chapter crossfades
  const scene1Opacity = useTransform(scrollYProgress, [0, 0.2, 0.26], [1, 1, 0]);
  const scene2Opacity = useTransform(scrollYProgress, [0.22, 0.28, 0.46, 0.52], [0, 1, 1, 0]);
  const scene3Opacity = useTransform(scrollYProgress, [0.48, 0.54, 0.71, 0.77], [0, 1, 1, 0]);
  const scene4Opacity = useTransform(scrollYProgress, [0.73, 0.79, 1], [0, 1, 1]);

  // Chapter 3: Wire Draw Stroke & Pinglet position along wire
  const wireDashOffset = useTransform(scrollYProgress, [0.5, 0.72], [420, 0]);
  const wirePingletT = Math.max(0, Math.min(1, (currentProgress - 0.5) / 0.22));
  const wireCoord = getWirePointParametric(wirePingletT);

  // Chapter 4: Moon Rise and Window Lighting
  const moonY = useTransform(scrollYProgress, [0.75, 0.95], [60, 0]);
  const moonOpacity = useTransform(scrollYProgress, [0.75, 0.88], [0, 1]);
  const townPingletX = useTransform(scrollYProgress, [0.75, 0.98], [40, 360]);
  const townPingletY = useTransform(scrollYProgress, [0.75, 0.98], [140, 90]);

  const activeChapter = getStoryChapter(currentProgress);

  // Fallback for Reduced Motion: 4 stacked static scenes
  if (reducedMotion) {
    return (
      <section
        id="story"
        aria-label="Pinglet Scroll Story"
        className="w-full scroll-mt-24 sm:scroll-mt-28 space-y-0"
      >
        {STORY_CHAPTERS.map((ch) => (
          <div
            key={ch.index}
            className="relative w-full min-h-[70svh] px-4 sm:px-8 py-12 flex flex-col justify-between border-b-4 border-[#1B1B3A] bg-[#1B1B3A] text-[#FFF8EE]"
          >
            <div className="flex items-center justify-between text-xs font-mono-retro font-bold uppercase tracking-widest">
              <span className="px-3.5 py-1.5 rounded-full bg-white/15 text-[#FFF0B3]">
                {ch.tag}
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-[#9FF3D3] text-[#1B1B3A]">
                {ch.stamp}
              </span>
            </div>

            <div className="my-8 flex flex-col items-center text-center space-y-4">
              <div className="w-56 h-56">
                <PingletSvg
                  mood={ch.index === 1 ? 'glitchy' : ch.index === 3 ? 'sleepy' : 'excited'}
                  size={220}
                  showBackdrop={false}
                />
              </div>
              <h3 className="font-display text-5xl sm:text-7xl text-[#9FF3D3] uppercase">
                {ch.title}
              </h3>
              <p className="font-rounded font-semibold text-xl sm:text-2xl text-[#FFC9A8] max-w-md">
                {ch.caption}
              </p>
            </div>
          </div>
        ))}
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      id="story"
      aria-label="Pinglet Scroll-Driven Pinned Story"
      className="relative w-full h-[400svh] scroll-mt-24 sm:scroll-mt-28"
    >
      {/* Pinned Sticky Stage (100svh) */}
      <motion.div
        className="sticky top-0 h-[100svh] w-full overflow-hidden flex flex-col justify-between px-4 sm:px-8 md:px-14 py-6 sm:py-8 border-b-4 border-[#1B1B3A]"
        style={{ backgroundColor: skyColor }}
      >
        {/* Giant Ghosted Word behind stage */}
        <div
          className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden"
          aria-hidden="true"
        >
          <span className="font-display text-[26vw] leading-none text-white/[0.08] tracking-widest font-extrabold uppercase">
            {activeChapter.ghostWord}
          </span>
        </div>

        {/* Top Header Bar: Corner Tag, Title & Chapter Stamp */}
        <div className="relative z-20 max-w-6xl mx-auto w-full flex items-center justify-between text-xs sm:text-sm font-mono-retro font-bold uppercase tracking-wider">
          <span className="px-3.5 py-1.5 rounded-full bg-[#1B1B3A]/80 text-[#FFF0B3] border border-white/20 backdrop-blur-sm">
            {activeChapter.tag}
          </span>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full bg-[#9FF3D3] text-[#1B1B3A] font-extrabold shadow-sm">
              {activeChapter.stamp}
            </span>
          </div>
        </div>

        {/* Center Pinned Story Stage Visuals */}
        <div className="relative z-10 max-w-5xl mx-auto w-full flex-1 flex items-center justify-center my-2">
          {/* SCENE 01 (0–25%): DARK ATTIC WITH BEAMS, MOONLIT WINDOW, DUST MOTES, CRT MONITOR */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={{ opacity: scene1Opacity }}
          >
            <svg
              viewBox="0 0 500 380"
              className="w-full max-w-[480px] h-auto drop-shadow-2xl"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Wooden Attic Rafter Beams */}
              <polygon points="0,0 250,70 500,0 500,30 250,90 0,30" fill="#1B1B3A" />
              <polygon points="40,20 40,380 65,380 65,35" fill="#121226" />
              <polygon points="435,35 435,380 460,380 460,20" fill="#121226" />

              {/* Moonlit Attic Window with Soft Rays */}
              <circle cx="250" cy="110" r="54" fill="#FFF0B3" opacity="0.3" />
              <circle cx="250" cy="110" r="42" fill="#FFF8EE" opacity="0.75" />
              <line x1="250" y1="68" x2="250" y2="152" stroke="#1B1B3A" strokeWidth="4" />
              <line x1="208" y1="110" x2="292" y2="110" stroke="#1B1B3A" strokeWidth="4" />

              {/* Drifting Dust Motes */}
              <circle cx="210" cy="160" r="2.5" fill="#FFF0B3" opacity="0.8" className="animate-ping" />
              <circle cx="290" cy="175" r="2" fill="#FFF0B3" opacity="0.7" />
              <circle cx="240" cy="210" r="2" fill="#9FF3D3" opacity="0.8" />
              <circle cx="270" cy="140" r="1.5" fill="#FFFFFF" opacity="0.9" />

              {/* Vintage CRT Monitor Desk */}
              <rect x="175" y="240" width="150" height="110" rx="16" fill="#1B1B3A" stroke="#B9A7FF" strokeWidth="3" />
              <rect x="190" y="252" width="120" height="78" rx="8" fill="#0C2518" stroke="#9FF3D3" strokeWidth="2.5" />
              {/* Phosphor Glow on CRT Screen */}
              <text x="202" y="280" fill="#9FF3D3" fontFamily="Space Mono, monospace" fontSize="12" fontWeight="bold">
                DIAL-UP: 56K
              </text>
              <text x="202" y="302" fill="#FFF0B3" fontFamily="Space Mono, monospace" fontSize="11">
                ONLINE..._
              </text>

              {/* Baby Pinglet peeking shyly near CRT */}
              <g transform="translate(110, 190) scale(0.48)">
                <PingletSvg mood="shy" size={160} showBackdrop={false} />
              </g>
            </svg>
          </motion.div>

          {/* SCENE 02 (25–50%): MODEM LEDS, WAVEFORM, RGB SPLIT, PINGLET CONDENSES OUT OF STATIC */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={{ opacity: scene2Opacity }}
          >
            <svg
              viewBox="0 0 500 380"
              className="w-full max-w-[480px] h-auto drop-shadow-2xl"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Modem LED Panel */}
              <rect x="70" y="40" width="360" height="64" rx="20" fill="#1B1B3A" stroke="#9FF3D3" strokeWidth="3" />
              {['OH', 'CD', 'RX', 'TX', '56K'].map((label, idx) => (
                <g key={label} transform={`translate(${110 + idx * 64}, 62)`}>
                  <circle cx="0" cy="0" r="8" fill="#9FF3D3" className="animate-ping" />
                  <circle cx="0" cy="0" r="7" fill={idx % 2 === 0 ? '#9FF3D3' : '#FFF0B3'} />
                  <text x="0" y="24" fill="#FFF8EE" textAnchor="middle" fontFamily="Space Mono, monospace" fontSize="11" fontWeight="bold">
                    {label}
                  </text>
                </g>
              ))}

              {/* Pulsing Oscilloscope Dial-Up Waveform */}
              <path
                d="M 40 180 Q 90 120 140 180 T 240 180 T 340 180 T 440 180 T 480 180"
                fill="none"
                stroke="#FF6B9D"
                strokeWidth="5"
                strokeLinecap="round"
                className="animate-pulse"
              />
              <path
                d="M 40 180 Q 90 140 140 180 T 240 180 T 340 180 T 440 180 T 480 180"
                fill="none"
                stroke="#9FF3D3"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Pinglet Condensing Out of Phosphor Static Noise */}
              <g transform="translate(190, 150) scale(0.68)">
                <PingletSvg mood="glitchy" size={190} showBackdrop={false} />
              </g>
            </svg>
          </motion.div>

          {/* SCENE 03 (50–75%): PINGLET GLIDES ALONG DRAWING TELEPHONE WIRE */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={{ opacity: scene3Opacity }}
          >
            <svg
              viewBox="0 0 400 380"
              className="w-full max-w-[480px] h-auto drop-shadow-2xl"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Telephone Poles */}
              <rect x="14" y="180" width="12" height="190" fill="#1B1B3A" />
              <line x1="2" y1="210" x2="38" y2="210" stroke="#1B1B3A" strokeWidth="6" strokeLinecap="round" />
              <rect x="374" y="180" width="12" height="190" fill="#1B1B3A" />
              <line x1="362" y1="210" x2="398" y2="210" stroke="#1B1B3A" strokeWidth="6" strokeLinecap="round" />

              {/* Telephone Wire Path (Catenary curve drawing itself) */}
              <motion.path
                d="M 20 260 C 140 310, 260 310, 380 260"
                fill="none"
                stroke="#FFF0B3"
                strokeWidth="4"
                strokeLinecap="round"
                style={{
                  strokeDasharray: 420,
                  strokeDashoffset: wireDashOffset,
                }}
              />

              {/* Pinglet Carrying Candy Envelope Along The Wire Path */}
              <g
                style={{
                  transform: `translate(${wireCoord.x - 48}px, ${wireCoord.y - 88}px) scale(0.55)`,
                  transition: 'transform 80ms ease-out',
                }}
              >
                <PingletSvg mood="excited" size={170} showBackdrop={false} />
              </g>
            </svg>
          </motion.div>

          {/* SCENE 04 (75–100%): ROOFTOP SKYLINE, LIGHTING WINDOWS, CRESCENT MOON */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={{ opacity: scene4Opacity }}
          >
            <svg
              viewBox="0 0 440 380"
              className="w-full max-w-[480px] h-auto drop-shadow-2xl"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Stars fading in */}
              <circle cx="60" cy="50" r="2.5" fill="#FFF0B3" />
              <circle cx="140" cy="40" r="3" fill="#FFFFFF" />
              <circle cx="240" cy="55" r="2" fill="#9FF3D3" />
              <circle cx="360" cy="65" r="2.5" fill="#FFF0B3" />

              {/* Crescent Moon Rising */}
              <motion.path
                d="M 350 40 A 28 28 0 1 0 384 82 A 22 22 0 1 1 350 40 Z"
                fill="#FFF0B3"
                stroke="#1B1B3A"
                strokeWidth="2.5"
                style={{
                  y: moonY,
                  opacity: moonOpacity,
                }}
              />

              {/* Rooftop Skyline Silhouettes */}
              <polygon points="0,380 0,280 60,220 120,280 120,380" fill="#1B1B3A" />
              <polygon points="120,380 120,260 210,190 300,260 300,380" fill="#121226" />
              <polygon points="300,380 300,280 370,230 440,280 440,380" fill="#1B1B3A" />
              {/* Chimney on Center House */}
              <rect x="250" y="170" width="22" height="42" fill="#121226" />

              {/* Illuminated Windows (Light up sequentially as Pinglet passes) */}
              {[
                { x: 30, y: 290 },
                { x: 70, y: 290 },
                { x: 155, y: 245 },
                { x: 215, y: 245 },
                { x: 185, y: 310 },
                { x: 340, y: 290 },
                { x: 385, y: 290 },
              ].map((win, idx) => {
                const isLit = isWindowIlluminated(idx, 7, (currentProgress - 0.75) / 0.25);
                return (
                  <rect
                    key={idx}
                    x={win.x}
                    y={win.y}
                    width="24"
                    height="32"
                    rx="4"
                    fill={isLit ? '#FFF0B3' : '#1F1A3E'}
                    stroke="#1B1B3A"
                    strokeWidth="2.5"
                    className="transition-colors duration-300"
                  />
                );
              })}

              {/* Pinglet Floating High Over the Town */}
              <motion.g
                style={{
                  x: townPingletX,
                  y: townPingletY,
                }}
              >
                <g transform="scale(0.55)">
                  <PingletSvg mood="sleepy" size={170} showBackdrop={false} />
                </g>
              </motion.g>
            </svg>
          </motion.div>
        </div>

        {/* Bottom Bar: Crossfading Caption (<10 words) & Progress Dots */}
        <div className="relative z-20 max-w-4xl mx-auto w-full text-center space-y-3">
          {/* Caption (<10 words each) */}
          <div className="min-h-[52px] flex items-center justify-center">
            <h2 className="font-rounded font-bold text-2xl sm:text-3xl md:text-4xl text-[#FFF8EE] leading-tight drop-shadow-sm transition-all duration-300">
              {activeChapter.caption}
            </h2>
          </div>

          {/* 4 Interactive Progress Dots */}
          <div className="flex items-center justify-center gap-3 pt-1">
            {STORY_CHAPTERS.map((ch, idx) => {
              const isActive = activeChapter.index === idx;
              return (
                <div
                  key={ch.index}
                  className={`h-3 rounded-full transition-all duration-300 ${
                    isActive ? 'w-10 bg-[#9FF3D3] shadow-md' : 'w-3 bg-white/30'
                  }`}
                  aria-label={`Story Chapter 0${idx + 1}`}
                />
              );
            })}
          </div>
        </div>
      </motion.div>
    </section>
  );
});

StorySection.displayName = 'StorySection';
