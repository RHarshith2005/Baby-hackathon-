import React, { useEffect, useRef, useState } from 'react';

interface CandyStar {
  id: number;
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  size: number;
  color: string;
  depth: 1 | 2 | 3; // 1 = background, 2 = midground, 3 = foreground
  rotation: number;
}

const STARS: CandyStar[] = [
  // 4 Mobile + Desktop Stars (Layer 1 & 2)
  { id: 1, x: 8, y: 14, size: 22, color: '#FFF0B3', depth: 1, rotation: 12 },
  { id: 2, x: 92, y: 22, size: 30, color: '#9FF3D3', depth: 2, rotation: -18 },
  { id: 3, x: 14, y: 72, size: 28, color: '#FF9EC7', depth: 2, rotation: 25 },
  { id: 4, x: 88, y: 84, size: 24, color: '#B9A7FF', depth: 1, rotation: -8 },
  // 4 Additional Desktop Stars (Layer 2 & 3)
  { id: 5, x: 32, y: 8, size: 36, color: '#FFFFFF', depth: 3, rotation: 4 },
  { id: 6, x: 74, y: 38, size: 20, color: '#FFF0B3', depth: 1, rotation: -15 },
  { id: 7, x: 26, y: 88, size: 34, color: '#9FF3D3', depth: 3, rotation: 18 },
  { id: 8, x: 68, y: 92, size: 26, color: '#FFF8EE', depth: 2, rotation: -10 },
];

export const CandyStarField: React.FC = React.memo(() => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const isTabHiddenRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const motionHandler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', motionHandler);

    const visibilityHandler = () => {
      isTabHiddenRef.current = document.hidden;
    };
    document.addEventListener('visibilitychange', visibilityHandler);
    window.addEventListener('resize', checkMobile);

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId: number;

    const onPointerMove = (e: MouseEvent) => {
      if (isTabHiddenRef.current || mq.matches) return;
      targetX = (e.clientX / window.innerWidth) * 2 - 1;
      targetY = (e.clientY / window.innerHeight) * 2 - 1;
    };

    window.addEventListener('mousemove', onPointerMove, { passive: true });

    const loop = () => {
      if (!isTabHiddenRef.current && !mq.matches) {
        currentX += (targetX - currentX) * 0.08;
        currentY += (targetY - currentY) * 0.08;
        setOffset({ x: currentX, y: currentY });
      }
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      mq.removeEventListener('change', motionHandler);
      document.removeEventListener('visibilitychange', visibilityHandler);
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('mousemove', onPointerMove);
    };
  }, []);

  if (reducedMotion) return null;

  const visibleStars = isMobile ? STARS.slice(0, 4) : STARS;

  return (
    <div
      className="fixed inset-0 z-10 pointer-events-none select-none overflow-hidden"
      aria-hidden="true"
    >
      {visibleStars.map((st) => {
        const factor = st.depth === 1 ? 8 : st.depth === 2 ? 18 : 32;
        const tx = offset.x * factor;
        const ty = offset.y * factor;

        return (
          <div
            key={st.id}
            className="absolute transition-transform duration-75 ease-out"
            style={{
              left: `${st.x}%`,
              top: `${st.y}%`,
              transform: `translate3d(${tx}px, ${ty}px, 0) rotate(${st.rotation}deg)`,
              opacity: st.depth === 1 ? 0.45 : st.depth === 2 ? 0.75 : 0.9,
            }}
          >
            <svg
              width={st.size}
              height={st.size}
              viewBox="-24 -24 48 48"
              className="drop-shadow-[0_4px_8px_rgba(27,27,58,0.22)]"
            >
              {/* 4-Point Glossy 3D Candy Star */}
              <path
                d="M 0 -22 C 5 -9 9 -5 22 0 C 9 5 5 9 0 22 C -5 9 -9 5 -22 0 C -9 -5 -5 -9 0 -22 Z"
                fill={st.color}
                stroke="#1B1B3A"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {/* Star Specular Highlight */}
              <circle cx="-3" cy="-4" r={st.size * 0.09} fill="#FFFFFF" opacity="0.95" />
            </svg>
          </div>
        );
      })}
    </div>
  );
});

CandyStarField.displayName = 'CandyStarField';
