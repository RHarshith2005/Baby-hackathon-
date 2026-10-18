import React, { useState, useRef, useEffect } from 'react';
import type { PingletMood } from '../game/packetRules';

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

export const PingletSvg: React.FC<PingletSvgProps> = ({
  mood = 'excited',
  sceneVariant,
  className = 'w-full h-auto max-w-[360px]',
  size = 420,
  alt,
  interactiveTilt = true,
  showBackdrop = true,
}) => {
  const uniqueId = React.useId().replace(/:/g, '');
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

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

  const handlePointerDown = (e: React.PointerEvent) => {
    updateTiltFromPoint(e.clientX, e.clientY);
  };

  const handlePointerLeave = () => {
    if (reducedMotion) return;
    setTilt({ x: 0, y: 0 });
  };

  const imageSrc = `/pinglet_${mood}.png`;
  const computedAlt =
    alt ||
    `Glossy 3D designer-toy render of Pinglet the translucent mint-to-lavender jelly resin baby ghost in ${mood} pose, with suspended glitter, glowing gumdrop antenna tufts, pixel-heart blush cheeks, and a candy-wrapped envelope.`;

  const parallaxX = reducedMotion ? 0 : tilt.x * 10;
  const parallaxY = reducedMotion ? 0 : tilt.y * 10;
  const starParallaxX = reducedMotion ? 0 : -tilt.x * 16;
  const starParallaxY = reducedMotion ? 0 : -tilt.y * 16;

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerLeave={handlePointerLeave}
      className={`relative select-none flex items-center justify-center ${className}`}
      style={{
        perspective: '900px',
      }}
    >
      {/* Semantic lazy-loaded <img> referencing the requested pinglet_<mood>.png render */}
      <img
        src={imageSrc}
        alt={computedAlt}
        loading="lazy"
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        className="sr-only"
      />

      <div
        className={`w-full h-full transition-transform duration-200 ease-out ${
          mood === 'glitchy' && !reducedMotion ? 'animate-rgb-glitch' : ''
        }`}
        style={{
          transform: reducedMotion
            ? 'none'
            : `rotateY(${tilt.x * 11}deg) rotateX(${-tilt.y * 11}deg) translate3d(${parallaxX * 0.4}px, ${parallaxY * 0.4}px, 0)`,
          transformStyle: 'preserve-3d',
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

            {/* Gumdrop Antenna Left (Glowing Mint Jelly) */}
            <radialGradient id={`gumdropMint-${uniqueId}`} cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="35%" stopColor="#9FF3D3" />
              <stop offset="80%" stopColor="#3CE3A8" />
              <stop offset="100%" stopColor="#17B882" />
            </radialGradient>

            {/* Gumdrop Antenna Right (Glowing Berry-Lavender Jelly) */}
            <radialGradient id={`gumdropLav-${uniqueId}`} cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="35%" stopColor="#FFD1E6" />
              <stop offset="75%" stopColor="#E86FA0" />
              <stop offset="100%" stopColor="#B9A7FF" />
            </radialGradient>

            {/* Glossy 3D Candy Star Gradient (Butter Gold) */}
            <radialGradient id={`candyStarGold-${uniqueId}`} cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="35%" stopColor="#FFF0B3" />
              <stop offset="80%" stopColor="#FFB870" />
              <stop offset="100%" stopColor="#E8874A" />
            </radialGradient>

            {/* Glossy 3D Candy Star Gradient (Mint) */}
            <radialGradient id={`candyStarMint-${uniqueId}`} cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="40%" stopColor="#9FF3D3" />
              <stop offset="100%" stopColor="#4BC9A0" />
            </radialGradient>

            {/* Glossy 3D Candy Star Gradient (Pink) */}
            <radialGradient id={`candyStarPink-${uniqueId}`} cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="40%" stopColor="#FFA8CC" />
              <stop offset="100%" stopColor="#E86FA0" />
            </radialGradient>

            {/* Deep Glossy Eye Gradient */}
            <radialGradient id={`shinyEye-${uniqueId}`} cx="36%" cy="32%" r="68%">
              <stop offset="0%" stopColor="#3B2D66" />
              <stop offset="65%" stopColor="#1B1B3A" />
              <stop offset="100%" stopColor="#0C0C1E" />
            </radialGradient>

            {/* Candy-Wrapped Envelope Gradient */}
            <linearGradient id={`candyEnv-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF8EE" />
              <stop offset="55%" stopColor="#FFD6E7" />
              <stop offset="100%" stopColor="#FFC9A8" />
            </linearGradient>

            {/* Contact Shadow */}
            <radialGradient id={`contactShadow-${uniqueId}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1B1B3A" stopOpacity="0.42" />
              <stop offset="55%" stopColor="#1B1B3A" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#1B1B3A" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Dreamy Sunset Rounded Card Backdrop with Shallow DOF Bokeh */}
          {showBackdrop && (
            <g>
              <rect
                x="24"
                y="18"
                width="352"
                height="368"
                rx="64"
                fill={`url(#sunsetBg-${uniqueId})`}
                stroke="#FFFFFF"
                strokeWidth="5"
                strokeOpacity="0.7"
              />
              {/* Soft Studio Rim Inner Glow */}
              <rect
                x="30"
                y="24"
                width="340"
                height="356"
                rx="58"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeOpacity="0.4"
              />
              {/* Shallow Depth-of-Field Bokeh Circles */}
              <circle cx="88" cy="92" r="34" fill="#FFF0B3" opacity="0.28" />
              <circle cx="318" cy="110" r="44" fill="#FFFFFF" opacity="0.22" />
              <circle cx="80" cy="295" r="28" fill="#9FF3D3" opacity="0.25" />
              <circle cx="315" cy="285" r="38" fill="#B9A7FF" opacity="0.26" />
            </g>
          )}

          {/* Floating Glossy 3D Candy Stars (Parallax Layer) */}
          <g
            style={{
              transform: `translate(${starParallaxX}px, ${starParallaxY}px)`,
              transition: 'transform 180ms ease-out',
            }}
          >
            {/* Top-Left Plump 3D Gold Candy Star */}
            <g transform="translate(66, 86) rotate(-14)">
              <path
                d="M 0 -22 C 5 -9 9 -5 22 0 C 9 5 5 9 0 22 C -5 9 -9 5 -22 0 C -9 -5 -5 -9 0 -22 Z"
                fill={`url(#candyStarGold-${uniqueId})`}
              />
              <ellipse cx="-4" cy="-6" rx="4" ry="2.2" transform="rotate(-30 -4 -6)" fill="#FFFFFF" opacity="0.85" />
            </g>

            {/* Top-Right Plump 3D Mint Candy Star */}
            <g transform="translate(332, 92) rotate(18)">
              <path
                d="M 0 -19 C 4.5 -8 8 -4.5 19 0 C 8 4.5 4.5 8 0 19 C -4.5 8 -8 4.5 -19 0 C -8 -4.5 -4.5 -8 0 -19 Z"
                fill={`url(#candyStarMint-${uniqueId})`}
              />
              <circle cx="-3" cy="-5" r="3" fill="#FFFFFF" opacity="0.85" />
            </g>

            {/* Bottom-Left Plump 3D Pink Candy Star */}
            <g transform="translate(58, 256) rotate(12)">
              <path
                d="M 0 -16 C 4 -7 7 -4 16 0 C 7 4 4 7 0 16 C -4 7 -7 4 -16 0 C -7 -4 -4 -7 0 -16 Z"
                fill={`url(#candyStarPink-${uniqueId})`}
              />
              <circle cx="-2.5" cy="-4" r="2.5" fill="#FFFFFF" opacity="0.85" />
            </g>

            {/* Bottom-Right Plump 3D Gold Candy Star */}
            <g transform="translate(338, 248) rotate(-20)">
              <path
                d="M 0 -18 C 4.2 -7.5 7.5 -4.2 18 0 C 7.5 4.2 4.2 7.5 0 18 C -4.2 7.5 -7.5 4.2 -18 0 C -7.5 -4.2 -4.2 -7.5 0 -18 Z"
                fill={`url(#candyStarGold-${uniqueId})`}
              />
              <circle cx="-3" cy="-4.5" r="2.8" fill="#FFFFFF" opacity="0.85" />
            </g>

            {/* Extra Floating Mini Sugar Pearls */}
            <circle cx="96" cy="148" r="5.5" fill="#FFF0B3" opacity="0.9" />
            <circle cx="306" cy="158" r="6.5" fill="#9FF3D3" opacity="0.9" />
            <circle cx="312" cy="60" r="4.5" fill="#FFFFFF" opacity="0.85" />
          </g>

          {/* Soft Ground Contact Shadow */}
          <ellipse cx="200" cy="354" rx="88" ry="18" fill={`url(#contactShadow-${uniqueId})`} />

          {/* Main Character Group */}
          <g
            style={{
              transform: `translate(${parallaxX}px, ${parallaxY}px)`,
              transition: 'transform 160ms ease-out',
            }}
          >
            {/* 1. TWO GLOWING GUMDROP-SHAPED ANTENNA TUFTS */}
            <g>
              {/* Left Antenna Stem */}
              <path
                d="M 166 96 C 156 72 138 60 128 50"
                fill="none"
                stroke="#1B1B3A"
                strokeWidth="5.5"
                strokeLinecap="round"
              />
              {/* Left Gumdrop Glow Halo */}
              <circle cx="122" cy="44" r="24" fill="#9FF3D3" opacity="0.45" />
              {/* Left Gumdrop Tuft Silhouette */}
              <path
                d="M 106 52 C 104 34 114 24 124 24 C 134 24 142 34 140 52 C 139 58 107 58 106 52 Z"
                fill={`url(#gumdropMint-${uniqueId})`}
                stroke="#1B1B3A"
                strokeWidth="3"
              />
              {/* Left Gumdrop Gloss Highlight */}
              <ellipse cx="118" cy="34" rx="6" ry="3.2" transform="rotate(-24 118 34)" fill="#FFFFFF" opacity="0.92" />

              {/* Right Antenna Stem */}
              <path
                d="M 234 96 C 244 72 262 60 272 50"
                fill="none"
                stroke="#1B1B3A"
                strokeWidth="5.5"
                strokeLinecap="round"
              />
              {/* Right Gumdrop Glow Halo */}
              <circle cx="278" cy="44" r="24" fill="#E86FA0" opacity="0.42" />
              {/* Right Gumdrop Tuft Silhouette */}
              <path
                d="M 260 52 C 258 34 266 24 276 24 C 286 24 296 34 294 52 C 293 58 261 58 260 52 Z"
                fill={`url(#gumdropLav-${uniqueId})`}
                stroke="#1B1B3A"
                strokeWidth="3"
              />
              {/* Right Gumdrop Gloss Highlight */}
              <ellipse cx="271" cy="34" rx="6" ry="3.2" transform="rotate(-24 271 34)" fill="#FFFFFF" opacity="0.92" />
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
                    transform="translate(-8, -3)"
                  />
                  <path
                    d="M 200 84 C 128 84 98 136 92 198 C 86 248 84 292 94 322 C 102 336 122 332 138 322 C 154 312 168 336 186 328 C 200 320 214 336 232 328 C 248 320 264 336 282 324 C 296 314 306 330 310 318 C 316 286 314 248 308 198 C 302 136 272 84 200 84 Z"
                    fill="#E86FA0"
                    opacity="0.55"
                    transform="translate(8, 3)"
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
                {/* 4-point sparkle flakes suspended inside translucent resin */}
                <path d="M 142 132 L 145 140 L 153 143 L 145 146 L 142 154 L 139 146 L 131 143 L 139 140 Z" fill="#FFFFFF" />
                <path d="M 258 142 L 260 148 L 266 150 L 260 152 L 258 158 L 256 152 L 250 150 L 256 148 Z" fill="#FFF0B3" />
                <path d="M 122 252 L 125 259 L 132 262 L 125 265 L 122 272 L 119 265 L 112 262 L 119 259 Z" fill="#FFF0B3" />
                <path d="M 276 246 L 279 253 L 286 256 L 279 259 L 276 266 L 273 259 L 266 256 L 273 253 Z" fill="#FFFFFF" />
                <path d="M 198 112 L 200 118 L 206 120 L 200 122 L 198 128 L 196 122 L 190 120 L 196 118 Z" fill="#FFFFFF" />
                {/* Suspended holographic glitter dots */}
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
              {/* Secondary Glossy Pill Highlight */}
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
              {/* Left Pixel-Heart Blush */}
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

              {/* Right Pixel-Heart Blush */}
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

            {/* 5. HUGE SHINY EYES & EXPRESSION */}
            {mood === 'sleepy' ? (
              <g>
                {/* Closed Peaceful Eyelids with Lashes */}
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
                {/* Cute sleepy o-mouth */}
                <ellipse cx="200" cy="208" rx="6" ry="7.5" fill="#1B1B3A" />
                <ellipse cx="200" cy="209" rx="4" ry="4.5" fill="#FF85B1" />
                {/* Floating Glossy Zzz */}
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
                  transform: `translate(${tilt.x * 5}px, ${tilt.y * 5}px)`,
                }}
              >
                {/* Left Huge Shiny Eye */}
                <ellipse cx="158" cy="182" rx="24" ry="29" fill={`url(#shinyEye-${uniqueId})`} />
                {/* Lower iris jelly reflection */}
                <path d="M 142 196 Q 158 208 174 196" fill="none" stroke="#B9A7FF" strokeWidth="3.5" strokeLinecap="round" opacity="0.65" />
                {/* Big Glossy Catchlight */}
                <circle cx="149" cy="169" r="10.5" fill="#FFFFFF" />
                {/* Secondary Catchlight */}
                <circle cx="168" cy="192" r="5.5" fill="#FFFFFF" />
                {/* Tiny Star Highlight */}
                <circle cx="166" cy="171" r="3" fill="#9FF3D3" />

                {/* Right Huge Shiny Eye */}
                <ellipse cx="242" cy="182" rx="24" ry="29" fill={`url(#shinyEye-${uniqueId})`} />
                <path d="M 226 196 Q 242 208 258 196" fill="none" stroke="#B9A7FF" strokeWidth="3.5" strokeLinecap="round" opacity="0.65" />
                <circle cx="233" cy="169" r="10.5" fill="#FFFFFF" />
                <circle cx="252" cy="192" r="5.5" fill="#FFFFFF" />
                <circle cx="250" cy="171" r="3" fill="#9FF3D3" />

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
                  /* Shy tiny smile */
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
              {/* Left Candy-Wrapper Twist */}
              <path
                d="M 142 258 L 120 244 C 116 254 116 264 120 274 Z"
                fill="#FF9EC7"
                stroke="#1B1B3A"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
              {/* Right Candy-Wrapper Twist */}
              <path
                d="M 258 258 L 280 244 C 284 254 284 264 280 274 Z"
                fill="#9FF3D3"
                stroke="#1B1B3A"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />

              {/* Candy-Wrapped Envelope Body */}
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
              {/* Envelope Flap Lines */}
              <path
                d="M 144 240 L 200 276 L 256 240"
                fill="none"
                stroke="#1B1B3A"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Candy Stripes on Envelope Corners */}
              <path d="M 148 298 L 166 280" stroke="#FF9EC7" strokeWidth="4" strokeLinecap="round" />
              <path d="M 252 298 L 234 280" stroke="#9FF3D3" strokeWidth="4" strokeLinecap="round" />

              {/* Glossy Heart Wax Seal in Center of Envelope */}
              <path
                d="M 200 265 C 194 257 182 260 184 270 C 186 279 200 286 200 286 C 200 286 214 279 216 270 C 218 260 206 257 200 265 Z"
                fill="#E86FA0"
                stroke="#1B1B3A"
                strokeWidth="3"
              />
              <circle cx="194" cy="267" r="2.2" fill="#FFFFFF" opacity="0.9" />
            </g>

            {/* Stubby Translucent Jelly Arms by Pose */}
            {mood === 'excited' ? (
              <g>
                {/* Arms Raised High Cheering! */}
                <path
                  d="M 98 210 C 68 186 64 152 82 142 C 98 134 112 162 110 190 Z"
                  fill="#9FF3D3"
                  stroke="#1B1B3A"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />
                <path
                  d="M 302 210 C 332 186 336 152 318 142 C 302 134 288 162 290 190 Z"
                  fill="#9FF3D3"
                  stroke="#1B1B3A"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />
              </g>
            ) : (
              <g>
                {/* Arms Hugging the Candy-Wrapped Envelope */}
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
            )}
          </g>
        </svg>
      </div>
    </div>
  );
};
