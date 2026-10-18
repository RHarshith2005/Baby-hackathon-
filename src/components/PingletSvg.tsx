import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { PingletMood } from '../game/packetRules';
import { audioSystem } from '../utils/audioSynth';

export type StorySceneVariant = 'attic' | 'glitch' | 'delivery' | 'neighborhood' | 'musicbox';

interface PingletSvgProps {
  mood?: PingletMood;
  sceneVariant?: StorySceneVariant;
  className?: string;
  size?: number;
  alt?: string;
  interactiveTilt?: boolean;
  showBackdrop?: boolean;
}

export const PingletSvg: React.FC<PingletSvgProps> = React.memo(({
  mood = 'excited',
  sceneVariant,
  className = 'w-full h-auto max-w-[360px]',
  alt,
  interactiveTilt = true,
  showBackdrop = true,
}) => {
  const uniqueId = React.useId().replace(/:/g, '');
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isSquished, setIsSquished] = useState(false);
  const [showPuff, setShowPuff] = useState(false);
  const [idleAction, setIdleAction] = useState<'none' | 'look-left' | 'look-right' | 'wave'>('none');

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Natural Blinking: Blink every 3-5 seconds (unless sleepy or reduced motion)
  useEffect(() => {
    if (mood === 'sleepy' || reducedMotion) return;
    let timer: number;
    let cancel = false;

    const scheduleBlink = () => {
      const wait = 3000 + Math.random() * 2000;
      timer = window.setTimeout(() => {
        if (cancel) return;
        setIsBlinking(true);
        window.setTimeout(() => {
          if (cancel) return;
          setIsBlinking(false);
          scheduleBlink();
        }, 120);
      }, wait);
    };

    scheduleBlink();
    return () => {
      cancel = true;
      window.clearTimeout(timer);
    };
  }, [mood, reducedMotion]);

  // Idle >8s: Look around and wave
  useEffect(() => {
    if (reducedMotion) return;
    let idleTimer: number;
    let animTimer1: number;
    let animTimer2: number;
    let animTimer3: number;
    let cancel = false;

    const resetIdle = () => {
      if (cancel) return;
      setIdleAction('none');
      window.clearTimeout(idleTimer);
      window.clearTimeout(animTimer1);
      window.clearTimeout(animTimer2);
      window.clearTimeout(animTimer3);

      idleTimer = window.setTimeout(() => {
        if (cancel) return;
        setIdleAction('look-left');
        animTimer1 = window.setTimeout(() => {
          if (cancel) return;
          setIdleAction('look-right');
          animTimer2 = window.setTimeout(() => {
            if (cancel) return;
            setIdleAction('wave');
            animTimer3 = window.setTimeout(() => {
              if (cancel) return;
              setIdleAction('none');
              resetIdle();
            }, 2200);
          }, 1000);
        }, 1000);
      }, 8000);
    };

    resetIdle();
    const handleActivity = () => resetIdle();
    window.addEventListener('pointermove', handleActivity, { passive: true });
    window.addEventListener('pointerdown', handleActivity, { passive: true });

    return () => {
      cancel = true;
      window.clearTimeout(idleTimer);
      window.clearTimeout(animTimer1);
      window.clearTimeout(animTimer2);
      window.clearTimeout(animTimer3);
      window.removeEventListener('pointermove', handleActivity);
      window.removeEventListener('pointerdown', handleActivity);
    };
  }, [reducedMotion]);

  const updateTiltFromPoint = (clientX: number, clientY: number) => {
    if (!interactiveTilt || reducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = ((clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
    const ny = ((clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1;
    setTilt({
      x: Math.max(-1, Math.min(1, nx)),
      y: Math.max(-1, Math.min(1, ny)),
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    updateTiltFromPoint(e.clientX, e.clientY);
  };

  const triggerTapReaction = useCallback(() => {
    if (reducedMotion) return;
    setIsSquished(true);
    setShowPuff(true);
    audioSystem.playGiggle();

    window.setTimeout(() => {
      setIsSquished(false);
    }, 380);

    window.setTimeout(() => {
      setShowPuff(false);
    }, 1100);
  }, [reducedMotion]);

  const handlePointerDown = (e: React.PointerEvent) => {
    updateTiltFromPoint(e.clientX, e.clientY);
    triggerTapReaction();
  };

  const handleMouseEnter = () => {
    if (!reducedMotion && !isSquished) {
      triggerTapReaction();
    }
  };

  const handlePointerLeave = () => {
    if (reducedMotion) return;
    setTilt({ x: 0, y: 0 });
  };

  const computedAlt =
    alt ||
    `Glossy 3D designer-toy render of Pinglet the translucent mint-to-lavender jelly resin baby ghost in ${mood} pose, with suspended glitter, glowing gumdrop antenna tufts, pixel-heart blush cheeks, and a candy-wrapped envelope.`;

  const parallaxX = reducedMotion ? 0 : tilt.x * 6;
  const parallaxY = reducedMotion ? 0 : tilt.y * 6;
  const starParallaxX = reducedMotion ? 0 : -tilt.x * 14;
  const starParallaxY = reducedMotion ? 0 : -tilt.y * 14;

  // Eye gaze tracking calculations
  const lookOffset = idleAction === 'look-left' ? -6 : idleAction === 'look-right' ? 6 : 0;
  const eyePupilX = (tilt.x * 8 + lookOffset);
  const eyePupilY = (tilt.y * 8);

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onMouseEnter={handleMouseEnter}
      onPointerLeave={handlePointerLeave}
      className={`relative select-none flex items-center justify-center cursor-pointer ${className}`}
      style={{
        perspective: '900px',
      }}
    >
      <div
        className={`w-full h-full transition-transform duration-200 ease-out ${
          mood === 'glitchy' && !reducedMotion ? 'animate-glitch-jitter' : ''
        }`}
        style={{
          transform: reducedMotion
            ? 'none'
            : `rotateY(${tilt.x * 9}deg) rotateX(${-tilt.y * 9}deg) translate3d(${parallaxX * 0.4}px, ${parallaxY * 0.4}px, 0) scale(${
                isSquished ? '1.08, 0.92' : '1, 1'
              })`,
          transformStyle: 'preserve-3d',
          transition: isSquished ? 'transform 180ms cubic-bezier(0.34, 1.56, 0.64, 1)' : 'transform 260ms ease-out',
        }}
      >
        <svg
          viewBox="0 0 400 420"
          width="100%"
          height="100%"
          className="overflow-visible drop-shadow-[0_24px_38px_rgba(27,27,58,0.28)]"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label={computedAlt}
        >
          <defs>
            {/* Sunset / Night Backdrop Gradient */}
            <linearGradient id={`sunsetBg-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              {mood === 'glitchy' || sceneVariant === 'glitch' ? (
                <>
                  <stop offset="0%" stopColor="#1B1B3A" />
                  <stop offset="55%" stopColor="#3B2366" />
                  <stop offset="100%" stopColor="#E86FA0" />
                </>
              ) : mood === 'sleepy' || sceneVariant === 'neighborhood' ? (
                <>
                  <stop offset="0%" stopColor="#262052" />
                  <stop offset="50%" stopColor="#7C65C9" />
                  <stop offset="100%" stopColor="#FFC9A8" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#E86FA0" />
                  <stop offset="52%" stopColor="#FFC9A8" />
                  <stop offset="100%" stopColor="#FFF0B3" />
                </>
              )}
            </linearGradient>

            {/* Translucent Mint-to-Lavender Jelly Resin Body Radial Gradient */}
            <radialGradient id={`jellyBody-${uniqueId}`} cx="36%" cy="26%" r="72%" fx="32%" fy="22%">
              <stop offset="0%" stopColor="#F2FFFA" stopOpacity="0.98" />
              <stop offset="24%" stopColor="#9FF3D3" stopOpacity="0.95" />
              <stop offset="62%" stopColor="#C3B0FF" stopOpacity="0.94" />
              <stop offset="88%" stopColor="#B9A7FF" stopOpacity="0.96" />
              <stop offset="100%" stopColor="#866CE8" stopOpacity="0.98" />
            </radialGradient>

            {/* Inner Subsurface Jelly Glow */}
            <radialGradient id={`subsurface-${uniqueId}`} cx="50%" cy="60%" r="48%">
              <stop offset="0%" stopColor="#FFF0B3" stopOpacity="0.55" />
              <stop offset="55%" stopColor="#FF9EC7" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#B9A7FF" stopOpacity="0" />
            </radialGradient>

            {/* High-Gloss Studio Softbox Specular Highlight */}
            <linearGradient id={`glossHighlight-${uniqueId}`} x1="0%" y1="0%" x2="60%" y2="85%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="38%" stopColor="#FFFFFF" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>

            {/* Gumdrop Tufts Gradients */}
            <linearGradient id={`gumdropMint-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="35%" stopColor="#9FF3D3" />
              <stop offset="100%" stopColor="#5EDEA7" />
            </linearGradient>

            <linearGradient id={`gumdropLav-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="35%" stopColor="#D5C7FF" />
              <stop offset="100%" stopColor="#A48CFF" />
            </linearGradient>

            {/* Shiny Big Eye Gloss Gradient */}
            <linearGradient id={`shinyEye-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1B1B3A" />
              <stop offset="58%" stopColor="#1B1B3A" />
              <stop offset="82%" stopColor="#3C326B" />
              <stop offset="100%" stopColor="#6C59BD" />
            </linearGradient>

            {/* Candy Envelope Gradient */}
            <linearGradient id={`candyEnv-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF8EE" />
              <stop offset="50%" stopColor="#FFF0B3" />
              <stop offset="100%" stopColor="#FFC9A8" />
            </linearGradient>

            {/* Ground Contact Shadow Gradient */}
            <radialGradient id={`contactShadow-${uniqueId}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1B1B3A" stopOpacity="0.38" />
              <stop offset="60%" stopColor="#1B1B3A" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#1B1B3A" stopOpacity="0" />
            </radialGradient>

            {/* Dynamic CSS Keyframes inside SVG for Breathing, Antenna Sway, and Glitch */}
            <style>{`
              @keyframes breathe-${uniqueId} {
                0%, 100% { transform: scaleY(1); }
                50% { transform: scaleY(1.02); }
              }
              @keyframes antenna-left-${uniqueId} {
                0%, 100% { transform: rotate(-3deg); }
                50% { transform: rotate(3deg); }
              }
              @keyframes antenna-right-${uniqueId} {
                0%, 100% { transform: rotate(3deg); }
                50% { transform: rotate(-3deg); }
              }
              @keyframes gumdrop-pulse-${uniqueId} {
                0%, 100% { opacity: 0.42; }
                50% { opacity: 0.75; }
              }
              @keyframes wave-arm-${uniqueId} {
                0%, 100% { transform: rotate(0deg); }
                25% { transform: rotate(-18deg); }
                75% { transform: rotate(18deg); }
              }
              .pinglet-body-breathe-${uniqueId} {
                transform-origin: 200px 330px;
                animation: ${reducedMotion ? 'none' : `breathe-${uniqueId} 3.5s ease-in-out infinite`};
              }
              .pinglet-antenna-l-${uniqueId} {
                transform-origin: 166px 96px;
                animation: ${reducedMotion ? 'none' : `antenna-left-${uniqueId} 3.2s ease-in-out infinite`};
              }
              .pinglet-antenna-r-${uniqueId} {
                transform-origin: 234px 96px;
                animation: ${reducedMotion ? 'none' : `antenna-right-${uniqueId} 3.2s ease-in-out infinite 0.5s`};
              }
              .pinglet-glow-${uniqueId} {
                animation: ${reducedMotion ? 'none' : `gumdrop-pulse-${uniqueId} 2.6s ease-in-out infinite alternate`};
              }
              .pinglet-arm-wave-${uniqueId} {
                transform-origin: 302px 210px;
                animation: ${idleAction === 'wave' && !reducedMotion ? `wave-arm-${uniqueId} 0.5s ease-in-out 4` : 'none'};
              }
            `}</style>
          </defs>

          {/* Optional Rounded Color-Blocked Backdrop Pill */}
          {showBackdrop && (
            <g>
              <rect
                x="20"
                y="16"
                width="360"
                height="388"
                rx="48"
                fill={`url(#sunsetBg-${uniqueId})`}
                opacity="0.94"
              />
              <rect
                x="20"
                y="16"
                width="360"
                height="388"
                rx="48"
                fill="none"
                stroke="#1B1B3A"
                strokeWidth="4"
              />
              {/* Retro Dotted Corner Accents */}
              <circle cx="48" cy="44" r="4" fill="#1B1B3A" />
              <circle cx="62" cy="44" r="4" fill="#1B1B3A" />
              <circle cx="352" cy="44" r="4" fill="#1B1B3A" />
              <circle cx="338" cy="44" r="4" fill="#1B1B3A" />
            </g>
          )}

          {/* Floating Parallax 3D Candy Stars */}
          <g
            style={{
              transform: `translate(${starParallaxX}px, ${starParallaxY}px)`,
              transition: 'transform 180ms ease-out',
            }}
          >
            {/* Top-Right Candy Star */}
            <path
              d="M 326 78 C 329 90 334 95 346 98 C 334 101 329 106 326 118 C 323 106 318 101 306 98 C 318 95 323 90 326 78 Z"
              fill="#FFF0B3"
              stroke="#1B1B3A"
              strokeWidth="3.5"
            />
            {/* Top-Left Candy Star */}
            <path
              d="M 72 88 C 74 98 78 102 88 104 C 78 106 74 110 72 120 C 70 110 66 106 56 104 C 66 102 70 98 72 88 Z"
              fill="#9FF3D3"
              stroke="#1B1B3A"
              strokeWidth="3"
            />
            {/* Bottom-Right Candy Star */}
            <path
              d="M 338 286 C 340 294 343 297 351 299 C 343 301 340 304 338 312 C 336 304 333 301 325 299 C 333 297 336 294 338 286 Z"
              fill="#E86FA0"
              stroke="#1B1B3A"
              strokeWidth="3"
            />
            {/* Floating Soft Candy Pearls */}
            <circle cx="96" cy="148" r="5.5" fill="#FFF0B3" opacity="0.9" />
            <circle cx="306" cy="158" r="6.5" fill="#9FF3D3" opacity="0.9" />
            <circle cx="312" cy="60" r="4.5" fill="#FFFFFF" opacity="0.85" />
          </g>

          {/* Heart / Star Puff Animation upon Tap or Hover */}
          {showPuff && !reducedMotion && (
            <g
              className="transition-all duration-700 ease-out"
              style={{
                transform: 'translate(200px, 32px)',
              }}
            >
              {/* Floating Heart */}
              <path
                d="M 0 -8 C -4 -16 -16 -12 -14 -2 C -12 7 0 14 0 14 C 0 14 12 7 14 -2 C 16 -12 4 -16 0 -8 Z"
                fill="#FF6B9D"
                stroke="#1B1B3A"
                strokeWidth="2.5"
                className="animate-bounce"
              />
              <circle cx="-5" cy="-6" r="1.5" fill="#FFFFFF" />
            </g>
          )}

          {/* Soft Ground Contact Shadow */}
          <ellipse cx="200" cy="354" rx="88" ry="18" fill={`url(#contactShadow-${uniqueId})`} />

          {/* Main Character Group (with Idle Breathing) */}
          <g
            className={`pinglet-body-breathe-${uniqueId}`}
            style={{
              transform: `translate(${parallaxX}px, ${parallaxY}px)`,
              transition: 'transform 160ms ease-out',
            }}
          >
            {/* 1. TWO GLOWING GUMDROP-SHAPED ANTENNA TUFTS (Swaying with phase offset) */}
            <g>
              {/* Left Antenna Stem & Tuft */}
              <g className={`pinglet-antenna-l-${uniqueId}`}>
                <path
                  d="M 166 96 C 156 72 138 60 128 50"
                  fill="none"
                  stroke="#1B1B3A"
                  strokeWidth="5.5"
                  strokeLinecap="round"
                />
                <circle cx="122" cy="44" r="24" fill="#9FF3D3" className={`pinglet-glow-${uniqueId}`} />
                <path
                  d="M 106 52 C 104 34 114 24 124 24 C 134 24 142 34 140 52 C 139 58 107 58 106 52 Z"
                  fill={`url(#gumdropMint-${uniqueId})`}
                  stroke="#1B1B3A"
                  strokeWidth="3"
                />
                <ellipse cx="118" cy="34" rx="6" ry="3.2" transform="rotate(-24 118 34)" fill="#FFFFFF" opacity="0.92" />
              </g>

              {/* Right Antenna Stem & Tuft */}
              <g className={`pinglet-antenna-r-${uniqueId}`}>
                <path
                  d="M 234 96 C 244 72 262 60 272 50"
                  fill="none"
                  stroke="#1B1B3A"
                  strokeWidth="5.5"
                  strokeLinecap="round"
                />
                <circle cx="278" cy="44" r="24" fill="#E86FA0" className={`pinglet-glow-${uniqueId}`} />
                <path
                  d="M 260 52 C 258 34 266 24 276 24 C 286 24 296 34 294 52 C 293 58 261 58 260 52 Z"
                  fill={`url(#gumdropLav-${uniqueId})`}
                  stroke="#1B1B3A"
                  strokeWidth="3"
                />
                <ellipse cx="271" cy="34" rx="6" ry="3.2" transform="rotate(-24 271 34)" fill="#FFFFFF" opacity="0.92" />
              </g>
            </g>

            {/* 2. TRANSLUCENT MINT-TO-LAVENDER JELLY RESIN BODY */}
            <g>
              {mood === 'glitchy' && (
                <>
                  {/* Chromatic RGB Split Clones behind body */}
                  <path
                    d="M 200 84 C 128 84 98 136 92 198 C 86 248 84 292 94 322 C 102 336 122 332 138 322 C 154 312 168 336 186 328 C 200 320 214 336 232 328 C 248 320 264 336 282 324 C 296 314 306 330 310 318 C 316 286 314 248 308 198 C 302 136 272 84 200 84 Z"
                    fill="#9FF3D3"
                    opacity="0.55"
                    transform="translate(-6, -2)"
                  />
                  <path
                    d="M 200 84 C 128 84 98 136 92 198 C 86 248 84 292 94 322 C 102 336 122 332 138 322 C 154 312 168 336 186 328 C 200 320 214 336 232 328 C 248 320 264 336 282 324 C 296 314 306 330 310 318 C 316 286 314 248 308 198 C 302 136 272 84 200 84 Z"
                    fill="#E86FA0"
                    opacity="0.55"
                    transform="translate(6, 2)"
                  />
                </>
              )}

              {/* Primary Jelly Resin Silhouette */}
              <path
                d="
                  M 200 84
                  C 128 84, 98 136, 92 198
                  C 86 248, 84 292, 94 322
                  C 102 336, 122 332, 138 322
                  C 154 312, 168 336, 186 328
                  C 200 320, 214 336, 232 328
                  C 248 320, 264 336, 282 324
                  C 296 314, 306 330, 310 318
                  C 316 286, 314 248, 308 198
                  C 302 136, 272 84, 200 84
                  Z
                "
                fill={`url(#jellyBody-${uniqueId})`}
                stroke="#1B1B3A"
                strokeWidth="4"
                strokeLinejoin="round"
              />

              {/* Subsurface Jelly Inner Warmth */}
              <ellipse cx="200" cy="235" rx="82" ry="75" fill={`url(#subsurface-${uniqueId})`} />

              {/* 3. GLITTER SUSPENDED INSIDE THE JELLY RESIN */}
              <g opacity="0.88">
                <path d="M 142 132 L 145 140 L 153 143 L 145 146 L 142 154 L 139 146 L 131 143 L 139 140 Z" fill="#FFFFFF" />
                <path d="M 258 142 L 260 148 L 266 150 L 260 152 L 258 158 L 256 152 L 250 150 L 256 148 Z" fill="#FFF0B3" />
                <path d="M 122 252 L 125 259 L 132 262 L 125 265 L 122 272 L 119 265 L 112 262 L 119 259 Z" fill="#FFF0B3" />
                <path d="M 276 246 L 279 253 L 286 256 L 279 259 L 276 266 L 273 259 L 266 256 L 273 253 Z" fill="#FFFFFF" />
                <path d="M 198 112 L 200 118 L 206 120 L 200 122 L 198 128 L 196 122 L 190 120 L 196 118 Z" fill="#FFFFFF" />
                <circle cx="164" cy="122" r="3.5" fill="#FFF0B3" />
                <circle cx="236" cy="128" r="4" fill="#9FF3D3" />
                <circle cx="116" cy="196" r="4.5" fill="#FFFFFF" opacity="0.75" />
                <circle cx="284" cy="202" r="3.8" fill="#FFD1E6" />
                <circle cx="148" cy="296" r="4.2" fill="#9FF3D3" />
                <circle cx="252" cy="298" r="4.5" fill="#FFF0B3" />
                <circle cx="178" cy="308" r="3" fill="#FFFFFF" />
                <circle cx="222" cy="304" r="3.5" fill="#FFD1E6" />
                <circle cx="132" cy="228" r="2.8" fill="#FFF0B3" />
                <circle cx="268" cy="224" r="3.2" fill="#FFFFFF" />
              </g>

              {/* High-Gloss Studio Softbox Specular Reflection Arc */}
              <path
                d="
                  M 196 92
                  C 142 92, 112 136, 106 194
                  C 102 228, 102 262, 108 282
                  C 114 252, 122 158, 172 114
                  C 186 102, 196 92, 196 92
                  Z
                "
                fill={`url(#glossHighlight-${uniqueId})`}
              />
              <ellipse
                cx="264"
                cy="132"
                rx="14"
                ry="7"
                transform="rotate(34 264 132)"
                fill="#FFFFFF"
                opacity="0.65"
              />
            </g>

            {/* 4. PIXEL-HEART BLUSH CHEEKS */}
            <g>
              <g transform="translate(106, 206)">
                <rect x="4" y="0" width="6" height="6" fill="#FF6B9D" />
                <rect x="10" y="0" width="6" height="6" fill="#FF6B9D" />
                <rect x="22" y="0" width="6" height="6" fill="#FF6B9D" />
                <rect x="28" y="0" width="6" height="6" fill="#FF6B9D" />
                <rect x="0" y="6" width="40" height="6" fill="#FF6B9D" />
                <rect x="4" y="12" width="32" height="6" fill="#FF85B1" />
                <rect x="10" y="18" width="20" height="6" fill="#FF85B1" />
                <rect x="16" y="24" width="8" height="6" fill="#FF9EC7" />
              </g>
              <g transform="translate(254, 206)">
                <rect x="4" y="0" width="6" height="6" fill="#FF6B9D" />
                <rect x="10" y="0" width="6" height="6" fill="#FF6B9D" />
                <rect x="22" y="0" width="6" height="6" fill="#FF6B9D" />
                <rect x="28" y="0" width="6" height="6" fill="#FF6B9D" />
                <rect x="0" y="6" width="40" height="6" fill="#FF6B9D" />
                <rect x="4" y="12" width="32" height="6" fill="#FF85B1" />
                <rect x="10" y="18" width="20" height="6" fill="#FF85B1" />
                <rect x="16" y="24" width="8" height="6" fill="#FF9EC7" />
              </g>
            </g>

            {/* 5. HUGE SHINY EYES & REAL EYE TRACKING */}
            {mood === 'sleepy' ? (
              <g>
                <path
                  d="M 136 186 Q 158 206 180 186"
                  fill="none"
                  stroke="#1B1B3A"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                <path
                  d="M 220 186 Q 242 206 264 186"
                  fill="none"
                  stroke="#1B1B3A"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                <ellipse cx="200" cy="208" rx="6" ry="7.5" fill="#1B1B3A" />
                <ellipse cx="200" cy="209" rx="4" ry="4.5" fill="#FF85B1" />
                <text x="284" y="136" fill="#FFF0B3" stroke="#1B1B3A" strokeWidth="1.5" fontFamily="Fredoka, sans-serif" fontSize="26" fontWeight="700">
                  z
                </text>
                <text x="304" y="112" fill="#FFF0B3" stroke="#1B1B3A" strokeWidth="1.5" fontFamily="Fredoka, sans-serif" fontSize="34" fontWeight="700">
                  Z
                </text>
              </g>
            ) : (
              <g
                style={{
                  transform: isBlinking ? 'scaleY(0.1)' : `translate(${tilt.x * 2.5}px, ${tilt.y * 2.5}px)`,
                  transformOrigin: '200px 182px',
                  transition: 'transform 80ms ease-out',
                }}
              >
                {/* Left Eye Base Sockets */}
                <ellipse cx="158" cy="182" rx="24" ry="29" fill={`url(#shinyEye-${uniqueId})`} />
                <path d="M 142 196 Q 158 208 174 196" fill="none" stroke="#B9A7FF" strokeWidth="3.5" strokeLinecap="round" opacity="0.65" />

                {/* Left Eye Pupils and Catchlights (Following pointer with deeper parallax) */}
                <g style={{ transform: `translate(${eyePupilX}px, ${eyePupilY}px)`, transition: 'transform 120ms ease-out' }}>
                  <circle cx="149" cy="169" r="10.5" fill="#FFFFFF" />
                  <circle cx="168" cy="192" r="5.5" fill="#FFFFFF" />
                  <circle cx="166" cy="171" r="3" fill="#9FF3D3" />
                </g>

                {/* Right Eye Base Sockets */}
                <ellipse cx="242" cy="182" rx="24" ry="29" fill={`url(#shinyEye-${uniqueId})`} />
                <path d="M 226 196 Q 242 208 258 196" fill="none" stroke="#B9A7FF" strokeWidth="3.5" strokeLinecap="round" opacity="0.65" />

                {/* Right Eye Pupils and Catchlights */}
                <g style={{ transform: `translate(${eyePupilX}px, ${eyePupilY}px)`, transition: 'transform 120ms ease-out' }}>
                  <circle cx="233" cy="169" r="10.5" fill="#FFFFFF" />
                  <circle cx="252" cy="192" r="5.5" fill="#FFFFFF" />
                  <circle cx="250" cy="171" r="3" fill="#9FF3D3" />
                </g>

                {/* Mouth by Mood */}
                {mood === 'excited' ? (
                  <path
                    d="M 188 206 Q 200 224 212 206 Z"
                    fill="#FF6B9D"
                    stroke="#1B1B3A"
                    strokeWidth="4"
                    strokeLinejoin="round"
                  />
                ) : mood === 'glitchy' ? (
                  <path
                    d="M 186 210 L 194 205 L 202 212 L 210 205 L 216 210"
                    fill="none"
                    stroke="#1B1B3A"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : (
                  <path
                    d="M 193 208 Q 200 215 207 208"
                    fill="none"
                    stroke="#1B1B3A"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                )}
              </g>
            )}

            {/* 6. SMALL CANDY-WRAPPED ENVELOPE & JELLY ARMS */}
            <g
              transform={
                mood === 'excited'
                  ? 'translate(0, -8)'
                  : mood === 'shy'
                  ? 'translate(0, -14)'
                  : 'translate(0, 4)'
              }
            >
              <path
                d="M 142 258 L 120 244 C 116 254 116 264 120 274 Z"
                fill="#FF9EC7"
                stroke="#1B1B3A"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
              <path
                d="M 258 258 L 280 244 C 284 254 284 264 280 274 Z"
                fill="#9FF3D3"
                stroke="#1B1B3A"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
              <rect
                x="140"
                y="234"
                width="120"
                height="74"
                rx="16"
                fill={`url(#candyEnv-${uniqueId})`}
                stroke="#1B1B3A"
                strokeWidth="4"
              />
              <path
                d="M 144 240 L 200 276 L 256 240"
                fill="none"
                stroke="#1B1B3A"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M 148 298 L 166 280" stroke="#FF9EC7" strokeWidth="4" strokeLinecap="round" />
              <path d="M 252 298 L 234 280" stroke="#9FF3D3" strokeWidth="4" strokeLinecap="round" />
              <path
                d="M 200 265 C 194 257 182 260 184 270 C 186 279 200 286 200 286 C 200 286 214 279 216 270 C 218 260 206 257 200 265 Z"
                fill="#E86FA0"
                stroke="#1B1B3A"
                strokeWidth="3"
              />
              <circle cx="194" cy="267" r="2.2" fill="#FFFFFF" opacity="0.9" />
            </g>

            {/* Stubby Translucent Jelly Arms by Pose (with Waving support on right arm) */}
            {mood === 'excited' ? (
              <g>
                <path
                  d="M 98 210 C 68 186 64 152 82 142 C 98 134 112 162 110 190 Z"
                  fill="#9FF3D3"
                  stroke="#1B1B3A"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />
                <path
                  className={`pinglet-arm-wave-${uniqueId}`}
                  d="M 302 210 C 332 186 336 152 318 142 C 302 134 288 162 290 190 Z"
                  fill="#9FF3D3"
                  stroke="#1B1B3A"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />
              </g>
            ) : (
              <g>
                <ellipse
                  cx="132"
                  cy="262"
                  rx="22"
                  ry="14"
                  transform="rotate(22 132 262)"
                  fill="#9FF3D3"
                  stroke="#1B1B3A"
                  strokeWidth="4"
                />
                <g className={`pinglet-arm-wave-${uniqueId}`}>
                  <ellipse
                    cx="268"
                    cy="262"
                    rx="22"
                    ry="14"
                    transform="rotate(-22 268 262)"
                    fill="#9FF3D3"
                    stroke="#1B1B3A"
                    strokeWidth="4"
                  />
                </g>
              </g>
            )}
          </g>
        </svg>
      </div>
    </div>
  );
});

PingletSvg.displayName = 'PingletSvg';
