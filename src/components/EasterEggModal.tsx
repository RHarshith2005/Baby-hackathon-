import React, { useState, useEffect } from 'react';
import { PingletSvg } from './PingletSvg';
import { audioSystem } from '../utils/audioSynth';
import { X, Sparkles, Heart, Terminal, MailOpen } from 'lucide-react';

interface EasterEggModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EasterEggModal: React.FC<EasterEggModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [step, setStep] = useState<'handshake' | 'hug'>('handshake');
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setStep('handshake');
      setLogs([]);
      return;
    }

    setStep('handshake');
    setLogs(['ATZ', 'OK', 'ATDT 555-PINGLET-0404...']);
    audioSystem.playHandshakeEasterEgg();

    const t1 = setTimeout(() => {
      setLogs((l) => [...l, 'DIALING... RINGING...']);
    }, 400);

    const t2 = setTimeout(() => {
      setLogs((l) => [...l, 'CARRIER DETECTED 56000 / V.90']);
    }, 900);

    const t3 = setTimeout(() => {
      setLogs((l) => [...l, 'HANDSHAKE NEGOTIATED // BIT-ROT 0%']);
    }, 1300);

    const t4 = setTimeout(() => {
      setLogs((l) => [...l, 'CONNECT! DECRYPTING INCOMING PACKET...']);
      setStep('hug');
    }, 1700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="easter-egg-title"
    >
      <div className="relative w-full max-w-lg bg-[#FFF8EE] text-[#1B1B3A] rounded-3xl border-4 border-[#1B1B3A] shadow-2xl overflow-hidden p-6 sm:p-8">
        {/* Retro Window Titlebar */}
        <div className="flex items-center justify-between bg-[#1B1B3A] text-[#9FF3D3] -mt-6 -mx-6 sm:-mt-8 sm:-mx-8 px-4 py-2.5 mb-6 border-b-3 border-[#1B1B3A]">
          <div className="flex items-center gap-2 font-mono-retro text-xs font-bold">
            <Terminal className="w-4 h-4 text-[#FFB088]" />
            <span>MODEM_56K://ATTIC_HANDSHAKE.EXE</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded text-white cursor-pointer transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'handshake' ? (
          <div className="space-y-4 py-6">
            <div className="flex items-center justify-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[#9FF3D3] animate-ping" />
              <span className="font-display text-3xl text-[#1B1B3A]">
                DIALING ATTIC COMPUTER...
              </span>
            </div>

            {/* Terminal log */}
            <div className="bg-[#12122b] text-[#9FF3D3] p-4 rounded-xl font-mono-retro text-xs space-y-1 h-36 overflow-y-auto border border-white/10">
              {logs.map((log, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[#FFB088]">&gt;</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center space-y-5 animate-scale-up py-2">
            <div className="w-32 h-32 mx-auto animate-float">
              <PingletSvg mood="excited" size={128} />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFB088] text-[#1B1B3A] text-xs font-mono-retro font-bold uppercase rounded-sm">
              <MailOpen className="w-3.5 h-3.5" /> [ - 1 UNREAD TRANSMISSION - ]
            </div>

            <h3 id="easter-egg-title" className="font-display text-5xl sm:text-6xl text-[#1B1B3A] tracking-tight leading-none">
              YOU&apos;VE GOT MAIL: A HUG
            </h3>

            <div className="bg-[#9FF3D3]/30 p-5 rounded-2xl border-2 border-[#1B1B3A] text-left">
              <p className="font-body text-sm sm:text-base text-[#1B1B3A] leading-relaxed mb-3">
                &ldquo;You found the 3:00 a.m. handshake secret! Pinglet flew through copper wires, past forgotten static, all the way to your screen to bring you this little hello.&rdquo;
              </p>
              <div className="flex items-center justify-between text-xs font-mono-retro font-bold text-[#1B1B3A]/80 border-t border-[#1B1B3A]/20 pt-2">
                <span>STAMP: 56K ATTIC SEAL</span>
                <span className="text-[#FFB088] flex items-center gap-1">
                  <Heart className="w-4 h-4 fill-current text-red-500" /> DELIVERED
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-8 py-3.5 bg-[#1B1B3A] hover:bg-[#2c2c5c] text-[#9FF3D3] font-display text-2xl tracking-wider rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              KEEP THE HUG IN YOUR POUCH
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
