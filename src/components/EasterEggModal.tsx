import React, { useEffect, useRef } from 'react';
import { PingletSvg } from './PingletSvg';
import { audioSystem } from '../utils/audioSynth';
import { X } from 'lucide-react';

interface EasterEggModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BURST_STARS = [
  { x: '-120px', y: '-90px', color: '#FFF0B3', size: 28 },
  { x: '130px', y: '-85px', color: '#9FF3D3', size: 26 },
  { x: '-145px', y: '20px', color: '#E86FA0', size: 24 },
  { x: '145px', y: '25px', color: '#B9A7FF', size: 30 },
  { x: '-95px', y: '110px', color: '#FFC9A8', size: 22 },
  { x: '105px', y: '105px', color: '#FFF0B3', size: 26 },
  { x: '0px', y: '-130px', color: '#9FF3D3', size: 32 },
];

export const EasterEggModal: React.FC<EasterEggModalProps> = React.memo(({
  isOpen,
  onClose,
}) => {
  const prevIsOpenRef = useRef(false);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Play audio ONLY when isOpen transitions from false to true
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      audioSystem.playHandshakeEasterEgg();
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen]);

  // Focus trap, backdrop escape, and restore focus on close
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

    // Move focus into the dialog
    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
      // Restore focus
      if (previouslyFocusedRef.current && typeof previouslyFocusedRef.current.focus === 'function') {
        previouslyFocusedRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B1B3A]/85 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="easter-egg-title"
      ref={dialogRef}
    >
      {/* Burst of Glossy 3D Candy Stars */}
      <div className="relative w-full max-w-md pointer-events-auto">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
          {BURST_STARS.map((st, i) => (
            <svg
              key={i}
              width={st.size}
              height={st.size}
              viewBox="-24 -24 48 48"
              className="absolute animate-bounce"
              style={{
                transform: `translate(${st.x}, ${st.y})`,
              }}
            >
              <path
                d="M 0 -20 C 5 -8 8 -5 20 0 C 8 5 5 8 0 20 C -5 8 -8 5 -20 0 C -8 -5 -5 -8 0 -20 Z"
                fill={st.color}
                stroke="#FFFFFF"
                strokeWidth="2.5"
              />
            </svg>
          ))}
        </div>

        {/* Modal Card with RGB-Split Glitch Intro */}
        <div className="relative bg-gradient-to-b from-[#FFF8EE] via-[#FFC9A8] to-[#FFF0B3] text-[#1B1B3A] rounded-[2.5rem] border-4 border-[#1B1B3A] toy-panel-shadow p-6 sm:p-8 text-center space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-[#1B1B3A] text-[#9FF3D3] font-mono-retro font-bold text-xs">
              &mdash; 3:00 A.M. SECRET
            </span>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="min-h-[48px] min-w-[48px] rounded-full bg-[#1B1B3A] text-[#FFF8EE] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-[#9FF3D3]"
              aria-label="Close secret hug modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="w-44 h-44 mx-auto animate-rgb-glitch">
            <PingletSvg
              mood="excited"
              size={176}
              showBackdrop={false}
              className="w-full h-auto"
              alt="Pinglet sparkling with an RGB-split glitch and delivering a candy-wrapped hug"
            />
          </div>

          <h3
            id="easter-egg-title"
            className="font-display text-5xl sm:text-6xl text-[#1B1B3A] tracking-tight leading-none uppercase"
          >
            YOU&apos;VE GOT MAIL: A HUG
          </h3>

          <p className="font-rounded font-semibold text-base sm:text-lg text-[#1B1B3A]/90">
            Hand-delivered across the dial-up wires just for you!
          </p>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] px-8 py-3 bg-[#9FF3D3] hover:bg-[#88efd0] text-[#1B1B3A] font-rounded font-bold text-base uppercase tracking-wider rounded-full border-3 border-[#1B1B3A] toy-button-gloss cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1B1B3A]"
          >
            KEEP THIS HUG 💖
          </button>
        </div>
      </div>
    </div>
  );
});

EasterEggModal.displayName = 'EasterEggModal';
