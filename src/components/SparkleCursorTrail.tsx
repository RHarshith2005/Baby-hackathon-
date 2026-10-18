import React, { useEffect, useState, useRef } from 'react';

interface TrailStar {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
}

const CANDY_COLORS = ['#FFF0B3', '#9FF3D3', '#E86FA0', '#B9A7FF', '#FFC9A8'];

export const SparkleCursorTrail: React.FC = () => {
  const [stars, setStars] = useState<TrailStar[]>([]);
  const [enabled, setEnabled] = useState(false);
  const idCounter = useRef(0);
  const lastSpawnTime = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isTouchDevice =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isTouchDevice || prefersReducedMotion) {
      setEnabled(false);
      return;
    }

    setEnabled(true);

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      const now = performance.now();
      if (now - lastSpawnTime.current < 48) return;
      lastSpawnTime.current = now;

      const id = ++idCounter.current;
      const newStar: TrailStar = {
        id,
        x: e.clientX,
        y: e.clientY,
        color: CANDY_COLORS[id % CANDY_COLORS.length],
        size: 14 + (id % 3) * 5,
        rotation: (id * 37) % 360,
      };

      setStars((prev) => [...prev.slice(-10), newStar]);
      window.setTimeout(() => {
        setStars((prev) => prev.filter((s) => s.id !== id));
      }, 650);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  if (!enabled || stars.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
      {stars.map((s) => (
        <svg
          key={s.id}
          width={s.size}
          height={s.size}
          viewBox="-24 -24 48 48"
          className="absolute transition-all duration-500 ease-out opacity-90 scale-100"
          style={{
            left: s.x - s.size / 2,
            top: s.y - s.size / 2,
            transform: `rotate(${s.rotation}deg)`,
            filter: 'drop-shadow(0 4px 6px rgba(27,27,58,0.22))',
          }}
        >
          <path
            d="M 0 -20 C 5 -8 8 -5 20 0 C 8 5 5 8 0 20 C -5 8 -8 5 -20 0 C -8 -5 -5 -8 0 -20 Z"
            fill={s.color}
            stroke="#1B1B3A"
            strokeWidth="2.5"
          />
          <circle cx="-4" cy="-5" r="3" fill="#FFFFFF" opacity="0.85" />
        </svg>
      ))}
    </div>
  );
};
