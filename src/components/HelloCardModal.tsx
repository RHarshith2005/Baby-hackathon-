import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Download, Share2, Sparkles } from 'lucide-react';
import type { PingletMood } from '../game/packetRules';
import { trackEvent } from '../store/pingletStore';
import { audioSystem } from '../utils/audioSynth';

interface HelloCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type PostcardStampType = '56k_handshake' | 'attic_sparkle' | 'baud_heart';

const STAMPS_OPTIONS: Array<{ id: PostcardStampType; name: string; icon: string; color: string }> = [
  { id: '56k_handshake', name: '56K Handshake', icon: '⚡', color: '#9FF3D3' },
  { id: 'attic_sparkle', name: 'Attic Sparkle', icon: '✨', color: '#FFF0B3' },
  { id: 'baud_heart', name: 'Baud Heart', icon: '💖', color: '#FF9EC7' },
];

export const HelloCardModal: React.FC<HelloCardModalProps> = React.memo(({
  isOpen,
  onClose,
}) => {
  const [message, setMessage] = useState('Hello from across the 56K wires! ✨');
  const [selectedStamp, setSelectedStamp] = useState<PostcardStampType>('baud_heart');
  const [selectedMood, setSelectedMood] = useState<PingletMood>('excited');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [blobFile, setBlobFile] = useState<File | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Esc key & Focus Trap
  useEffect(() => {
    if (!isOpen) return;

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
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Render 1080x1350 Postcard on Canvas
  const renderCard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1080;
    canvas.height = 1350;

    // 1. Cream Paper Backdrop
    ctx.fillStyle = '#FFF8EE';
    ctx.fillRect(0, 0, 1080, 1350);

    // 2. Outer Border & Airmail Stripes
    ctx.strokeStyle = '#1B1B3A';
    ctx.lineWidth = 16;
    ctx.strokeRect(30, 30, 1020, 1290);

    // Top Airmail header gradient
    const headerGrad = ctx.createLinearGradient(0, 40, 1080, 240);
    headerGrad.addColorStop(0, '#E86FA0');
    headerGrad.addColorStop(0.5, '#FFC9A8');
    headerGrad.addColorStop(1, '#FFF0B3');
    ctx.fillStyle = headerGrad;
    ctx.fillRect(40, 40, 1000, 240);

    ctx.strokeStyle = '#1B1B3A';
    ctx.lineWidth = 8;
    ctx.strokeRect(40, 40, 1000, 240);

    // Header Title
    ctx.fillStyle = '#1B1B3A';
    ctx.font = 'bold 74px "Bebas Neue", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('POSTE RESTANTE · ATTIC 56K', 80, 160);

    ctx.font = 'bold 26px "Space Mono", monospace';
    ctx.fillText('JUNIOR PACKET COURIER AIRMAIL', 80, 215);

    // 3. Postcard Postal Stamp (Upper Right)
    const stampOption = STAMPS_OPTIONS.find((s) => s.id === selectedStamp) || STAMPS_OPTIONS[0];
    ctx.fillStyle = stampOption.color;
    ctx.fillRect(800, 320, 200, 240);
    ctx.strokeStyle = '#1B1B3A';
    ctx.lineWidth = 8;
    ctx.strokeRect(800, 320, 200, 240);

    ctx.font = '72px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(stampOption.icon, 900, 440);

    ctx.fillStyle = '#1B1B3A';
    ctx.font = 'bold 20px "Space Mono", monospace';
    ctx.fillText(stampOption.name.toUpperCase(), 900, 520);

    // 4. Postmark Circular Stamp with today's date
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).toUpperCase();

    ctx.save();
    ctx.translate(720, 440);
    ctx.rotate(-0.08);
    ctx.strokeStyle = '#E86FA0';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, 85, 0, Math.PI * 2);
    ctx.stroke();

    ctx.font = 'bold 16px "Space Mono", monospace';
    ctx.fillStyle = '#E86FA0';
    ctx.fillText('DIAL-UP HANDSHAKE', 0, -35);
    ctx.font = 'bold 22px "Fredoka", sans-serif';
    ctx.fillText(dateStr, 0, 10);
    ctx.font = '14px "Space Mono", monospace';
    ctx.fillText('3:00 A.M. ATTIC', 0, 45);
    ctx.restore();

    // 5. Vertical Postcard Divider
    ctx.strokeStyle = '#1B1B3A';
    ctx.lineWidth = 4;
    ctx.setLineDash([12, 12]);
    ctx.beginPath();
    ctx.moveTo(540, 320);
    ctx.lineTo(540, 1140);
    ctx.stroke();
    ctx.setLineDash([]);

    // 6. Left Column: Pinglet Character Illustration
    ctx.save();
    // Simplified high-res vector character drawing for crisp standalone rendering
    const cx = 290;
    const cy = 600;

    // Contact shadow
    ctx.fillStyle = 'rgba(27, 27, 58, 0.15)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 180, 130, 24, 0, 0, Math.PI * 2);
    ctx.fill();

    // Translucent Jelly Body
    const bodyGrad = ctx.createRadialGradient(cx - 30, cy - 40, 20, cx, cy, 180);
    bodyGrad.addColorStop(0, '#FFFFFF');
    bodyGrad.addColorStop(0.3, '#9FF3D3');
    bodyGrad.addColorStop(0.7, '#C3B0FF');
    bodyGrad.addColorStop(1, '#866CE8');

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(cx, cy - 30, 130, Math.PI, 0, false);
    ctx.bezierCurveTo(cx + 130, cy + 100, cx + 110, cy + 170, cx + 80, cy + 170);
    ctx.bezierCurveTo(cx + 50, cy + 150, cx + 20, cy + 170, cx, cy + 150);
    ctx.bezierCurveTo(cx - 20, cy + 170, cx - 50, cy + 150, cx - 80, cy + 170);
    ctx.bezierCurveTo(cx - 110, cy + 170, cx - 130, cy + 100, cx - 130, cy - 30);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#1B1B3A';
    ctx.lineWidth = 8;
    ctx.stroke();

    // Antennas
    ctx.fillStyle = '#9FF3D3';
    ctx.beginPath();
    ctx.arc(cx - 60, cy - 180, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FF9EC7';
    ctx.beginPath();
    ctx.arc(cx + 60, cy - 180, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Eyes
    if (selectedMood === 'sleepy') {
      ctx.strokeStyle = '#1B1B3A';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(cx - 45, cy - 25, 26, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + 45, cy - 25, 26, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#1B1B3A';
      ctx.beginPath();
      ctx.ellipse(cx - 45, cy - 25, 24, 30, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 45, cy - 25, 24, 30, 0, 0, Math.PI * 2);
      ctx.fill();

      // Catchlights
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(cx - 52, cy - 35, 10, 0, Math.PI * 2);
      ctx.arc(cx + 38, cy - 35, 10, 0, Math.PI * 2);
      ctx.arc(cx - 38, cy - 15, 6, 0, Math.PI * 2);
      ctx.arc(cx + 52, cy - 15, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cheeks
    ctx.fillStyle = '#FF6B9D';
    ctx.fillRect(cx - 85, cy, 26, 14);
    ctx.fillRect(cx + 60, cy, 26, 14);

    // Mouth
    ctx.strokeStyle = '#1B1B3A';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cx, cy + 8, 14, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    // Envelope
    ctx.fillStyle = '#FFF8EE';
    ctx.fillRect(cx - 45, cy + 30, 90, 60);
    ctx.strokeStyle = '#1B1B3A';
    ctx.lineWidth = 6;
    ctx.strokeRect(cx - 45, cy + 30, 90, 60);
    ctx.fillStyle = '#E86FA0';
    ctx.font = '24px sans-serif';
    ctx.fillText('💌', cx, cy + 72);

    ctx.restore();

    // 7. Right Column: Message & Lines
    ctx.textAlign = 'left';
    ctx.fillStyle = '#523B8A';
    ctx.font = 'bold 32px "Fredoka", sans-serif';
    ctx.fillText('A TINY HELLO FOR YOU:', 580, 620);

    ctx.fillStyle = '#1B1B3A';
    ctx.font = 'bold 44px "Fredoka", sans-serif';

    // Word wrap message
    const words = message.trim().split(' ');
    let currentLine = '';
    let lineY = 700;
    const maxLineWidth = 420;

    for (let n = 0; n < words.length; n++) {
      const testLine = currentLine + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxLineWidth && n > 0) {
        ctx.fillText(currentLine.trim(), 580, lineY);
        currentLine = words[n] + ' ';
        lineY += 60;
      } else {
        currentLine = testLine;
      }
    }
    ctx.fillText(currentLine.trim(), 580, lineY);

    // Decorative ruled lines underneath
    ctx.strokeStyle = '#1B1B3A';
    ctx.lineWidth = 3;
    [920, 980, 1040, 1100].forEach((ly) => {
      ctx.beginPath();
      ctx.moveTo(580, ly);
      ctx.lineTo(1000, ly);
      ctx.stroke();
    });

    // 8. Footer Badge
    ctx.fillStyle = '#1B1B3A';
    ctx.fillRect(40, 1190, 1000, 100);
    ctx.fillStyle = '#9FF3D3';
    ctx.font = 'bold 32px "Space Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('★ CARRIED ACROSS THE WIRES BY PINGLET (#0404) ★', 540, 1252);

    // Save Data URL & File
    const dataUrl = canvas.toDataURL('image/png');
    setPreviewUrl(dataUrl);

    canvas.toBlob((blob) => {
      if (blob) {
        setBlobFile(new File([blob], 'pinglet-hello-card.png', { type: 'image/png' }));
      }
    }, 'image/png');
  }, [message, selectedStamp, selectedMood]);

  useEffect(() => {
    if (isOpen) {
      renderCard();
    }
  }, [isOpen, renderCard]);

  const handleDownload = () => {
    if (!previewUrl) return;
    trackEvent('madeCard');
    audioSystem.playGiggle();
    const link = document.createElement('a');
    link.download = 'pinglet-hello-card.png';
    link.href = previewUrl;
    link.click();
  };

  const handleShare = async () => {
    trackEvent('madeCard');
    audioSystem.playTone(880, 0.1, 'sine');

    if (blobFile && typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: 'Pinglet Hello Card',
          text: message,
          files: [blobFile],
        });
        return;
      } catch (err: unknown) {
        if ((err as Error)?.name !== 'AbortError') {
          handleDownload();
        }
      }
    } else {
      handleDownload();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#1B1B3A]/85 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-4xl bg-[#FFF8EE] rounded-[2.5rem] border-4 border-[#1B1B3A] p-5 sm:p-7 max-h-[92vh] overflow-y-auto toy-panel-shadow grid md:grid-cols-12 gap-6 items-center"
      >
        {/* Controls Column */}
        <div className="md:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-10 h-10 rounded-xl bg-[#FF9EC7] border-2 border-[#1B1B3A] flex items-center justify-center text-xl">
                💌
              </span>
              <h2 id="card-modal-title" className="font-display text-3xl sm:text-4xl text-[#1B1B3A] tracking-wide">
                HELLO CARD
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] min-w-[48px] rounded-full bg-[#1B1B3A] text-white flex items-center justify-center hover:bg-[#282854] cursor-pointer"
              aria-label="Close Hello Card modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="font-rounded text-xs sm:text-sm text-[#523B8A]">
            Type a tiny hello, pick a vintage stamp, and send a postcard from 3:00 a.m.
          </p>

          {/* Message Input */}
          <div>
            <div className="flex justify-between items-center text-xs font-mono-retro font-bold text-[#1B1B3A] mb-1">
              <label htmlFor="card-message">MESSAGE (MAX 70 CHARS)</label>
              <span>{message.length} / 70</span>
            </div>
            <input
              id="card-message"
              type="text"
              maxLength={70}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full min-h-[48px] px-4 py-2.5 rounded-2xl bg-white border-3 border-[#1B1B3A] font-rounded font-semibold text-sm text-[#1B1B3A] focus:outline-none focus:ring-2 focus:ring-[#9FF3D3]"
              placeholder="Write a tiny hello..."
            />
          </div>

          {/* Stamp Picker */}
          <div>
            <p className="text-xs font-mono-retro font-bold text-[#1B1B3A] mb-1.5">
              POSTAL STAMP
            </p>
            <div className="grid grid-cols-3 gap-2">
              {STAMPS_OPTIONS.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelectedStamp(st.id)}
                  className={`min-h-[48px] p-2 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
                    selectedStamp === st.id
                      ? 'border-[#1B1B3A] bg-white shadow-md scale-102 ring-2 ring-[#9FF3D3]'
                      : 'border-[#1B1B3A]/30 bg-[#FFF8EE] opacity-75'
                  }`}
                >
                  <span className="text-lg">{st.icon}</span>
                  <span className="font-rounded font-bold text-[10px] text-[#1B1B3A] truncate w-full text-center">
                    {st.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Mood Picker */}
          <div>
            <p className="text-xs font-mono-retro font-bold text-[#1B1B3A] mb-1.5">
              PINGLET MOOD
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {(['excited', 'shy', 'sleepy', 'glitchy'] as PingletMood[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedMood(m)}
                  className={`min-h-[48px] py-1 px-2 rounded-xl border-2 font-mono-retro font-bold text-[11px] uppercase cursor-pointer transition-all ${
                    selectedMood === m
                      ? 'bg-[#1B1B3A] text-[#9FF3D3] border-[#1B1B3A] shadow-sm'
                      : 'bg-white text-[#1B1B3A] border-[#1B1B3A]/30'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 min-h-[48px] px-5 py-3 rounded-full bg-[#9FF3D3] hover:bg-[#85eac4] text-[#1B1B3A] font-rounded font-bold text-sm uppercase flex items-center justify-center gap-2 border-3 border-[#1B1B3A] shadow-md cursor-pointer active:scale-95 transition-transform"
            >
              <Download className="w-4 h-4" />
              Download PNG
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="min-h-[48px] px-5 py-3 rounded-full bg-[#B9A7FF] hover:bg-[#aa95ff] text-[#1B1B3A] font-rounded font-bold text-sm uppercase flex items-center justify-center gap-2 border-3 border-[#1B1B3A] shadow-md cursor-pointer active:scale-95 transition-transform"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>

        {/* Live Card Preview Column */}
        <div className="md:col-span-6 flex flex-col items-center justify-center">
          <div className="w-full max-w-[340px] aspect-[4/5] rounded-3xl border-4 border-[#1B1B3A] shadow-2xl overflow-hidden bg-white relative">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Live preview of Pinglet 1080x1350 postcard"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-xs font-mono-retro text-gray-400">
                Rendering postcard...
              </div>
            )}
          </div>
          <p className="font-mono-retro text-[10px] text-[#523B8A] mt-2">
            1080 × 1350 High-Res Airmail Postcard
          </p>
        </div>

        {/* Hidden canvas used for high-res render */}
        <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
      </div>
    </div>
  );
});

HelloCardModal.displayName = 'HelloCardModal';
