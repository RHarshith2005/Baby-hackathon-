import React, { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import {
  type DataPacketParticle,
  createPacketBurst,
  updateParticleSystem,
} from '../game/particleSystem';
import { audioSystem } from '../utils/audioSynth';

export interface DataPacketCanvasHandle {
  triggerBurst: (originX?: number, originY?: number, count?: number) => void;
}

interface DataPacketParticleCanvasProps {
  className?: string;
  isMuted?: boolean;
}

export const DataPacketParticleCanvas = forwardRef<DataPacketCanvasHandle, DataPacketParticleCanvasProps>(
  ({ className = '', isMuted = false }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<DataPacketParticle[]>([]);
    const animIdRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);
    const prefersReducedMotionRef = useRef<boolean>(false);

    useEffect(() => {
      if (typeof window === 'undefined' || !window.matchMedia) return;
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      prefersReducedMotionRef.current = mq.matches;
      const handler = (e: MediaQueryListEvent) => {
        prefersReducedMotionRef.current = e.matches;
      };
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }, []);

    // Resize canvas to match display size and DPI
    const resizeCanvas = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(10, Math.floor(rect.width * dpr));
      const height = Math.max(10, Math.floor(rect.height * dpr));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    }, []);

    useEffect(() => {
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      return () => window.removeEventListener('resize', resizeCanvas);
    }, [resizeCanvas]);

    // Safe roundRect helper with arc fallback for all browser contexts
    const safeRoundRect = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      w: number,
      h: number,
      r: number
    ) => {
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, w, h, r);
      } else {
        const radius = Math.min(r, w / 2, h / 2);
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + w - radius, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
        ctx.lineTo(x + w, y + h - radius);
        ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
        ctx.lineTo(x + radius, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
      }
    };

    // Draw an individual 'data-packet' icon onto the 2D canvas context
    const drawPacket = (ctx: CanvasRenderingContext2D, p: DataPacketParticle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.scale(p.scale, p.scale);
      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));

      if (p.type === 'envelope') {
        // Candy-wrapped data envelope
        const w = p.width;
        const h = p.height;
        const hw = w / 2;
        const hh = h / 2;

        // Shadow
        ctx.fillStyle = 'rgba(27, 27, 58, 0.22)';
        ctx.beginPath();
        safeRoundRect(ctx, -hw + 2, -hh + 3, w, h, 6);
        ctx.fill();

        // Main body
        ctx.fillStyle = p.color;
        ctx.strokeStyle = '#1B1B3A';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        safeRoundRect(ctx, -hw, -hh, w, h, 6);
        ctx.fill();
        ctx.stroke();

        // Flap fold
        ctx.beginPath();
        ctx.moveTo(-hw + 2, -hh + 2);
        ctx.lineTo(0, 3);
        ctx.lineTo(hw - 2, -hh + 2);
        ctx.stroke();

        // Mini heart wax seal in center
        ctx.fillStyle = '#E86FA0';
        ctx.beginPath();
        ctx.arc(-2, 3, 2.5, 0, Math.PI * 2);
        ctx.arc(2, 3, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Candy wrapper side twists
        ctx.fillStyle = p.accentColor;
        ctx.beginPath();
        ctx.moveTo(-hw, -2);
        ctx.lineTo(-hw - 6, -7);
        ctx.lineTo(-hw - 6, 7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(hw, -2);
        ctx.lineTo(hw + 6, -7);
        ctx.lineTo(hw + 6, 7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (p.type === 'datagram') {
        // High-tech retro data packet with label [56K] / [HELLO] / [ACK]
        const w = p.width;
        const h = p.height;
        const hw = w / 2;
        const hh = h / 2;

        // Shadow
        ctx.fillStyle = 'rgba(27, 27, 58, 0.25)';
        ctx.beginPath();
        safeRoundRect(ctx, -hw + 2, -hh + 3, w, h, 5);
        ctx.fill();

        // Packet background
        ctx.fillStyle = '#1B1B3A';
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        safeRoundRect(ctx, -hw, -hh, w, h, 5);
        ctx.fill();
        ctx.stroke();

        // Header strip
        ctx.fillStyle = p.color;
        ctx.fillRect(-hw + 2, -hh + 2, w - 4, 4);

        // Label text
        ctx.fillStyle = '#FFF8EE';
        ctx.font = 'bold 9px "Space Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.label, 0, 4);
      } else if (p.type === 'chip') {
        // Mini data packet microchip
        const s = 18;
        const hs = s / 2;
        ctx.fillStyle = '#1B1B3A';
        ctx.strokeStyle = p.accentColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        safeRoundRect(ctx, -hs, -hs, s, s, 3);
        ctx.fill();
        ctx.stroke();

        // Gold pins
        ctx.fillStyle = p.color;
        ctx.fillRect(-hs - 3, -4, 3, 2);
        ctx.fillRect(-hs - 3, 2, 3, 2);
        ctx.fillRect(hs, -4, 3, 2);
        ctx.fillRect(hs, 2, 3, 2);

        // Center dot
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Glossy 3D Candy Star
        const r = 14;
        ctx.fillStyle = p.color;
        ctx.strokeStyle = '#1B1B3A';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -r);
        ctx.quadraticCurveTo(r * 0.25, -r * 0.25, r, 0);
        ctx.quadraticCurveTo(r * 0.25, r * 0.25, 0, r);
        ctx.quadraticCurveTo(-r * 0.25, r * 0.25, -r, 0);
        ctx.quadraticCurveTo(-r * 0.25, -r * 0.25, 0, -r);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Gloss highlight
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-2, -3, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    // Render loop
    const render = (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const dt = Math.min(0.08, (time - lastTimeRef.current) / 1000);
      lastTimeRef.current = time;

      // Update particle physics
      particlesRef.current = updateParticleSystem(particlesRef.current, dt);

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        ctx.save();
        ctx.scale(dpr, dpr);

        for (const p of particlesRef.current) {
          drawPacket(ctx, p);
        }

        ctx.restore();
      }

      // If particles remain, keep ticking. If all finished, stop RAF to consume 0 CPU!
      if (particlesRef.current.length > 0) {
        animIdRef.current = requestAnimationFrame(render);
      } else {
        animIdRef.current = null;
      }
    };

    const triggerBurst = useCallback(
      (originX?: number, originY?: number, count: number = 36) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        resizeCanvas();

        const rect = canvas.getBoundingClientRect();
        const startX = originX !== undefined ? originX : rect.width / 2;
        const startY = originY !== undefined ? originY : rect.height * 0.55;

        const effectiveCount = prefersReducedMotionRef.current
          ? Math.min(10, Math.floor(count * 0.3))
          : count;
        const speed = prefersReducedMotionRef.current ? 160 : 380;

        const newParticles = createPacketBurst(effectiveCount, startX, startY, speed);
        particlesRef.current = [...particlesRef.current, ...newParticles];

        // Sound chime for burst celebration (if not muted)
        if (!isMuted) {
          audioSystem.playTone(523.25, 0.12, 'sine');
          setTimeout(() => audioSystem.playTone(659.25, 0.14, 'triangle'), 60);
          setTimeout(() => audioSystem.playTone(783.99, 0.22, 'sine'), 120);
        }

        // Start animation loop if not already running
        if (!animIdRef.current) {
          lastTimeRef.current = performance.now();
          animIdRef.current = requestAnimationFrame(render);
        }
      },
      [isMuted, resizeCanvas]
    );

    useImperativeHandle(
      ref,
      () => ({
        triggerBurst,
      }),
      [triggerBurst]
    );

    useEffect(() => {
      return () => {
        if (animIdRef.current) {
          cancelAnimationFrame(animIdRef.current);
          animIdRef.current = null;
        }
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        role="presentation"
        aria-hidden="true"
        data-testid="data-packet-particle-canvas"
        className={`pointer-events-none absolute inset-0 z-30 w-full h-full select-none ${className}`}
      />
    );
  }
);

DataPacketParticleCanvas.displayName = 'DataPacketParticleCanvas';
