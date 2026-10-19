import React, { useEffect, useRef, useState } from 'react';
import { X, Award, Download, CheckCircle, Sparkles } from 'lucide-react';
import { PASSPORT_STAMPS, type StampId } from '../store/pingletStoreRules';
import { usePingletStore } from '../store/pingletStore';
import { audioSystem } from '../utils/audioSynth';

interface CourierPassportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CourierPassportModal: React.FC<CourierPassportModalProps> = React.memo(({
  isOpen,
  onClose,
}) => {
  const { collectedStamps } = usePingletStore();
  const collectedSet = new Set(collectedStamps);
  const totalCount = PASSPORT_STAMPS.length;
  const collectedCount = collectedStamps.length;
  const isMasterCourier = collectedCount >= totalCount;

  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [certUrl, setCertUrl] = useState<string | null>(null);

  // Esc key and focus trap
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedElementRef.current = document.activeElement as HTMLElement | null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Initial focus into modal
    const timer = window.setTimeout(() => {
      const closeBtn = modalRef.current?.querySelector<HTMLElement>('button');
      closeBtn?.focus();
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.clearTimeout(timer);
      if (previouslyFocusedElementRef.current) {
        previouslyFocusedElementRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  // Generate Master Courier Certificate on 10/10
  useEffect(() => {
    if (!isOpen || !isMasterCourier) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1000;
    canvas.height = 700;

    // Background paper
    ctx.fillStyle = '#FFF8EE';
    ctx.fillRect(0, 0, 1000, 700);

    // Border
    ctx.strokeStyle = '#1B1B3A';
    ctx.lineWidth = 14;
    ctx.strokeRect(20, 20, 960, 660);

    ctx.strokeStyle = '#9FF3D3';
    ctx.lineWidth = 6;
    ctx.strokeRect(36, 36, 928, 628);

    // Decorative stamps
    ctx.fillStyle = '#1B1B3A';
    ctx.font = 'bold 36px "Space Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('★ OLD WEB PACKET COURIER SERVICE ★', 500, 90);

    ctx.font = 'bold 56px "Fredoka", sans-serif';
    ctx.fillText('MASTER COURIER CERTIFICATE', 500, 170);

    ctx.font = '22px "Fredoka", sans-serif';
    ctx.fillStyle = '#523B8A';
    ctx.fillText('This certifies that the official bearer has explored all corners of the 56K attic,', 500, 230);
    ctx.fillText('delivered lost hellos across the dial-up wires, and collected all 10 Courier Stamps.', 500, 265);

    // Grid of collected icons
    const icons = ['💌', '👉', '✨', '🐾', '🍬', '🌙', '🏆', '🏷️', '📖', '🔑'];
    icons.forEach((ic, idx) => {
      const x = 180 + (idx % 5) * 160;
      const y = 350 + Math.floor(idx / 5) * 90;
      ctx.fillStyle = '#FFF0B3';
      ctx.beginPath();
      ctx.arc(x, y, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1B1B3A';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.font = '32px sans-serif';
      ctx.fillText(ic, x, y + 10);
    });

    // Postmark Stamp Seal
    ctx.save();
    ctx.translate(500, 560);
    ctx.rotate(-0.06);
    ctx.strokeStyle = '#E86FA0';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 65, 0, Math.PI * 2);
    ctx.stroke();
    ctx.font = 'bold 15px "Space Mono", monospace';
    ctx.fillStyle = '#E86FA0';
    ctx.fillText('PINGLET OFFICIAL', 0, -28);
    ctx.font = 'bold 24px "Fredoka", sans-serif';
    ctx.fillText('10 / 10', 0, 8);
    ctx.font = '13px "Space Mono", monospace';
    ctx.fillText('3:00 AM HANDSHAKE', 0, 36);
    ctx.restore();

    setCertUrl(canvas.toDataURL('image/png'));
  }, [isOpen, isMasterCourier]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="passport-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#1B1B3A]/80 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl bg-[#FFF8EE] rounded-t-[2.5rem] sm:rounded-[2.5rem] border-4 border-[#1B1B3A] p-5 sm:p-8 max-h-[90vh] overflow-y-auto toy-panel-shadow"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b-3 border-[#1B1B3A] pb-4 mb-5">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-2xl bg-[#9FF3D3] border-3 border-[#1B1B3A] flex items-center justify-center text-2xl shadow-sm">
              📖
            </span>
            <div>
              <h2 id="passport-title" className="font-display text-3xl sm:text-4xl text-[#1B1B3A] tracking-wide leading-none">
                COURIER PASSPORT
              </h2>
              <p className="font-mono-retro text-xs text-[#523B8A] font-bold mt-1">
                STAMPS COLLECTED: {collectedCount} / {totalCount}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] min-w-[48px] rounded-full bg-[#1B1B3A] hover:bg-[#34346B] text-[#FFF8EE] flex items-center justify-center border-2 border-white cursor-pointer active:scale-95 transition-transform"
            aria-label="Close passport"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Master Courier Banner when 10/10 collected */}
        {isMasterCourier && (
          <div className="mb-6 p-4 rounded-3xl bg-[#9FF3D3] border-3 border-[#1B1B3A] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-bounce-once">
            <div className="flex items-center gap-3">
              <Award className="w-10 h-10 text-[#1B1B3A] shrink-0" />
              <div>
                <p className="font-rounded font-bold text-lg text-[#1B1B3A]">
                  All 10 Stamps Collected!
                </p>
                <p className="font-rounded text-xs text-[#1B1B3A]/80">
                  You are an official Master Packet Courier of the Old Web.
                </p>
              </div>
            </div>

            {certUrl && (
              <a
                href={certUrl}
                download="pinglet-master-courier-certificate.png"
                onClick={() => audioSystem.playGiggle()}
                className="min-h-[48px] px-5 py-2.5 rounded-full bg-[#1B1B3A] text-[#9FF3D3] hover:bg-[#282854] font-rounded font-bold text-xs uppercase flex items-center gap-2 border-2 border-white shadow-md cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4" />
                Certificate PNG
              </a>
            )}
          </div>
        )}

        {/* 10 Postal Stamp Slots */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 mb-6">
          {PASSPORT_STAMPS.map((stamp) => {
            const isUnlocked = collectedSet.has(stamp.id);
            return (
              <div
                key={stamp.id}
                className={`relative rounded-2xl p-3 border-3 border-[#1B1B3A] flex flex-col items-center text-center transition-all ${
                  isUnlocked
                    ? 'bg-white shadow-md scale-100'
                    : 'bg-[#1B1B3A]/5 border-dashed opacity-50'
                }`}
                style={{
                  borderTopColor: isUnlocked ? stamp.color : undefined,
                  borderTopWidth: isUnlocked ? '6px' : undefined,
                }}
              >
                {/* Stamp perforation edge effect */}
                <div className="w-12 h-12 rounded-full border-2 border-[#1B1B3A] flex items-center justify-center text-2xl mb-2"
                  style={{ backgroundColor: isUnlocked ? stamp.color : '#E5DFD5' }}
                >
                  {isUnlocked ? stamp.icon : '🔒'}
                </div>

                <p className="font-rounded font-bold text-xs text-[#1B1B3A] leading-tight">
                  {stamp.isSecret && !isUnlocked ? '???' : stamp.name}
                </p>

                <p className="font-rounded text-[10px] text-[#523B8A] mt-1 leading-snug">
                  {isUnlocked ? (
                    <span className="inline-flex items-center gap-0.5 text-emerald-700 font-bold">
                      <CheckCircle className="w-3 h-3" /> Unlocked
                    </span>
                  ) : stamp.isSecret ? (
                    'Hidden attic secret'
                  ) : (
                    stamp.hint
                  )}
                </p>
              </div>
            );
          })}
        </div>

        {/* Hidden canvas for certificate generation */}
        <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

        {/* Footer info */}
        <div className="text-center font-mono-retro text-[11px] text-[#523B8A]">
          Carry little hellos across the old wires to unlock every postal stamp!
        </div>
      </div>
    </div>
  );
});

CourierPassportModal.displayName = 'CourierPassportModal';
