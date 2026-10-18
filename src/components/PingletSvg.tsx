import React from 'react';
import type { PingletMood } from '../game/packetRules';

interface PingletSvgProps {
  mood?: PingletMood;
  className?: string;
  size?: number;
}

export const PingletSvg: React.FC<PingletSvgProps> = ({
  mood = 'shy',
  className = 'w-full h-auto max-w-[280px]',
  size = 320,
}) => {
  const uniqueId = React.useId().replace(/:/g, '');

  return (
    <svg
      viewBox="0 0 320 340"
      width={size}
      height={size * (340 / 320)}
      className={`drop-shadow-xl ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`Pinglet 3D clay toy character in ${mood} pose`}
    >
      <defs>
        {/* Soft Drop Shadow Filter */}
        <filter id={`shadow-${uniqueId}`} x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#1B1B3A" floodOpacity="0.22" />
        </filter>

        {/* Soft Clay Mint-to-Lavender Body Radial Gradient */}
        <radialGradient id={`bodyGrad-${uniqueId}`} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#D4FFF0" />
          <stop offset="25%" stopColor="#9FF3D3" />
          <stop offset="70%" stopColor="#B9A7FF" />
          <stop offset="100%" stopColor="#8975F0" />
        </radialGradient>

        {/* Inner Clay Highlight */}
        <linearGradient id={`innerLight-${uniqueId}`} x1="0%" y1="0%" x2="50%" y2="80%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
          <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Glossy Eye Gradient */}
        <radialGradient id={`eyeGrad-${uniqueId}`} cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#2E2B52" />
          <stop offset="80%" stopColor="#1B1B3A" />
          <stop offset="100%" stopColor="#0F0F24" />
        </radialGradient>

        {/* Antenna LED Glow Mint */}
        <radialGradient id={`ledMint-${uniqueId}`} cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="35%" stopColor="#9FF3D3" />
          <stop offset="100%" stopColor="#4AE8B0" />
        </radialGradient>

        {/* Antenna LED Glow Lavender */}
        <radialGradient id={`ledLavender-${uniqueId}`} cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="35%" stopColor="#D8CDFF" />
          <stop offset="100%" stopColor="#B9A7FF" />
        </radialGradient>

        {/* Contact Shadow Radial Gradient */}
        <radialGradient id={`contactGrad-${uniqueId}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1B1B3A" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#1B1B3A" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#1B1B3A" stopOpacity="0" />
        </radialGradient>

        {/* Glitch Filter for 3am mode */}
        <filter id={`glitch-${uniqueId}`}>
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 1 0"
          />
          <feOffset dx="3" dy="0" result="red" />
          <feOffset dx="-3" dy="0" result="blue" />
        </filter>
      </defs>

      {/* 1. Soft Ground Contact Shadow */}
      <ellipse cx="160" cy="315" rx="75" ry="14" fill={`url(#contactGrad-${uniqueId})`} />

      {/* 2. Dual LED Antenna Stems */}
      <g>
        {/* Left Antenna Stem */}
        <path
          d="M 140 85 C 130 55 105 45 95 35"
          fill="none"
          stroke="#1B1B3A"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        {/* Left LED Bulb */}
        <circle cx="95" cy="35" r="11" fill={`url(#ledMint-${uniqueId})`} />
        <circle cx="95" cy="35" r="15" fill="#9FF3D3" opacity="0.35" />
        <circle cx="92" cy="32" r="3.5" fill="#FFFFFF" />

        {/* Right Antenna Stem */}
        <path
          d="M 180 85 C 190 55 215 45 225 35"
          fill="none"
          stroke="#1B1B3A"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        {/* Right LED Bulb */}
        <circle cx="225" cy="35" r="11" fill={`url(#ledLavender-${uniqueId})`} />
        <circle cx="225" cy="35" r="15" fill="#B9A7FF" opacity="0.35" />
        <circle cx="222" cy="32" r="3.5" fill="#FFFFFF" />
      </g>

      {/* 3. Main Baby Ghost Body with Wavy Tail */}
      <g filter={`url(#shadow-${uniqueId})`}>
        {/* Body Outline & Soft-Clay Vinyl Fill */}
        <path
          d="
            M 160 80
            C 100 80, 75 125, 70 175
            C 65 215, 62 250, 70 280
            C 75 292, 92 290, 105 282
            C 118 274, 132 295, 148 288
            C 160 282, 172 295, 188 288
            C 202 282, 215 295, 230 285
            C 242 277, 252 290, 255 278
            C 260 248, 258 215, 250 175
            C 245 125, 220 80, 160 80
            Z
          "
          fill={`url(#bodyGrad-${uniqueId})`}
        />

        {/* Soft Clay Rim Highlight */}
        <path
          d="
            M 160 86
            C 115 86, 88 125, 82 175
            C 78 210, 77 245, 82 265
            C 88 245, 95 150, 140 105
            C 152 95, 160 86, 160 86
            Z
          "
          fill={`url(#innerLight-${uniqueId})`}
        />
      </g>

      {/* 4. Pixel-Style Blush Cheeks */}
      <g>
        {/* Left Blush */}
        <rect x="94" y="200" width="12" height="9" rx="2" fill="#FFA07A" opacity="0.9" />
        <rect x="106" y="197" width="12" height="13" rx="2" fill="#FFA07A" opacity="0.95" />
        <rect x="118" y="200" width="12" height="9" rx="2" fill="#FFA07A" opacity="0.9" />

        {/* Right Blush */}
        <rect x="190" y="200" width="12" height="9" rx="2" fill="#FFA07A" opacity="0.9" />
        <rect x="202" y="197" width="12" height="13" rx="2" fill="#FFA07A" opacity="0.95" />
        <rect x="214" y="200" width="12" height="9" rx="2" fill="#FFA07A" opacity="0.9" />
      </g>

      {/* 5. Eyes based on Mood */}
      {mood === 'sleepy' ? (
        /* Cute sleepy closed eyes (^_^) */
        <g stroke="#1B1B3A" strokeWidth="6.5" strokeLinecap="round" fill="none">
          <path d="M 115 178 Q 130 162 145 178" />
          <path d="M 175 178 Q 190 162 205 178" />
          {/* Floating Zzz */}
          <text
            x="225"
            y="130"
            fill="#B9A7FF"
            fontFamily="Space Mono, monospace"
            fontSize="18"
            fontWeight="bold"
          >
            z
          </text>
          <text
            x="240"
            y="112"
            fill="#B9A7FF"
            fontFamily="Space Mono, monospace"
            fontSize="24"
            fontWeight="bold"
          >
            Z
          </text>
        </g>
      ) : mood === 'excited' ? (
        /* Huge sparkling wide eyes with double star highlights */
        <g>
          {/* Left Eye */}
          <ellipse cx="130" cy="172" rx="19" ry="24" fill={`url(#eyeGrad-${uniqueId})`} />
          <circle cx="124" cy="162" r="8.5" fill="#FFFFFF" />
          <circle cx="138" cy="180" r="4.5" fill="#FFFFFF" />
          <circle cx="137" cy="164" r="2.5" fill="#9FF3D3" />

          {/* Right Eye */}
          <ellipse cx="190" cy="172" rx="19" ry="24" fill={`url(#eyeGrad-${uniqueId})`} />
          <circle cx="184" cy="162" r="8.5" fill="#FFFFFF" />
          <circle cx="198" cy="180" r="4.5" fill="#FFFFFF" />
          <circle cx="197" cy="164" r="2.5" fill="#9FF3D3" />

          {/* Open happy smile */}
          <path
            d="M 152 196 Q 160 208 168 196"
            stroke="#1B1B3A"
            strokeWidth="4"
            strokeLinecap="round"
            fill="#FFA07A"
          />
        </g>
      ) : mood === 'glitchy' ? (
        /* Glitchy RGB Split Eyes */
        <g>
          {/* Cyan split */}
          <ellipse cx="127" cy="172" rx="16" ry="20" fill="#9FF3D3" opacity="0.6" />
          <ellipse cx="187" cy="172" rx="16" ry="20" fill="#9FF3D3" opacity="0.6" />
          {/* Pink split */}
          <ellipse cx="133" cy="172" rx="16" ry="20" fill="#FF8BA7" opacity="0.6" />
          <ellipse cx="193" cy="172" rx="16" ry="20" fill="#FF8BA7" opacity="0.6" />
          {/* Dark core */}
          <ellipse cx="130" cy="172" rx="15" ry="19" fill="#1B1B3A" />
          <ellipse cx="190" cy="172" rx="15" ry="19" fill="#1B1B3A" />
          <circle cx="125" cy="165" r="5" fill="#FFFFFF" />
          <circle cx="185" cy="165" r="5" fill="#FFFFFF" />
          {/* Small CRT jitter line */}
          <line x1="110" y1="172" x2="210" y2="172" stroke="#9FF3D3" strokeWidth="1.5" opacity="0.7" />
        </g>
      ) : (
        /* Shy: Peeking glossy eyes looking down-left */
        <g>
          {/* Left Eye */}
          <ellipse cx="130" cy="174" rx="17" ry="22" fill={`url(#eyeGrad-${uniqueId})`} />
          <circle cx="124" cy="166" r="7.5" fill="#FFFFFF" />
          <circle cx="134" cy="180" r="3.5" fill="#FFFFFF" />

          {/* Right Eye */}
          <ellipse cx="190" cy="174" rx="17" ry="22" fill={`url(#eyeGrad-${uniqueId})`} />
          <circle cx="184" cy="166" r="7.5" fill="#FFFFFF" />
          <circle cx="194" cy="180" r="3.5" fill="#FFFFFF" />

          {/* Shy tiny dot mouth */}
          <circle cx="160" cy="198" r="3" fill="#1B1B3A" />
        </g>
      )}

      {/* 6. Arms according to Mood */}
      {mood === 'excited' ? (
        /* Arms raised up in the air! */
        <g>
          {/* Left arm up */}
          <path
            d="M 85 190 Q 60 160 70 135 Q 82 135 90 165 Z"
            fill="#9FF3D3"
            stroke="#1B1B3A"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Right arm up */}
          <path
            d="M 235 190 Q 260 160 250 135 Q 238 135 230 165 Z"
            fill="#9FF3D3"
            stroke="#1B1B3A"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
        </g>
      ) : mood === 'sleepy' ? (
        /* Arms relaxing down */
        <g>
          <path
            d="M 82 195 Q 65 215 75 230 Q 88 230 95 210 Z"
            fill="#9FF3D3"
            stroke="#1B1B3A"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M 238 195 Q 255 215 245 230 Q 232 230 225 210 Z"
            fill="#9FF3D3"
            stroke="#1B1B3A"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </g>
      ) : (
        /* Shy: Peeking tiny hands held inward over cheeks */
        <g>
          <ellipse
            cx="108"
            cy="216"
            rx="12"
            ry="8"
            transform="rotate(25 108 216)"
            fill="#9FF3D3"
            stroke="#1B1B3A"
            strokeWidth="3"
          />
          <ellipse
            cx="212"
            cy="216"
            rx="12"
            ry="8"
            transform="rotate(-25 212 216)"
            fill="#9FF3D3"
            stroke="#1B1B3A"
            strokeWidth="3"
          />
        </g>
      )}
    </svg>
  );
};
