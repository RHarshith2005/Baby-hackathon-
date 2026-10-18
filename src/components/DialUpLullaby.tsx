import React, { useState, useEffect } from 'react';
import {
  audioSystem,
  PENTATONIC_SCALE,
} from '../utils/audioSynth';
import { PingletSvg } from './PingletSvg';
import { Play, Pause, Volume2, VolumeX, Music } from 'lucide-react';

interface DialUpLullabyProps {
  isMuted: boolean;
  onToggleMute: () => void;
}

export const DialUpLullaby: React.FC<DialUpLullabyProps> = ({
  isMuted,
  onToggleMute,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeNote, setActiveNote] = useState<string | null>(null);

  useEffect(() => {
    audioSystem.setOnTrackNoteChange((note) => {
      setActiveNote(note);
      window.setTimeout(() => setActiveNote((n) => (n === note ? null : n)), 280);
    });
    return () => {
      audioSystem.stopLullaby();
    };
  }, []);

  const togglePlayback = () => {
    if (isPlaying) {
      audioSystem.stopLullaby();
      setIsPlaying(false);
      setActiveNote(null);
    } else {
      audioSystem.startLullaby();
      setIsPlaying(true);
    }
  };

  const handleManualKeyClick = (noteName: keyof typeof PENTATONIC_SCALE) => {
    audioSystem.playTone(PENTATONIC_SCALE[noteName], 0.32, 'triangle');
    setActiveNote(noteName);
    window.setTimeout(() => setActiveNote(null), 280);
  };

  return (
    <div className="relative w-full bg-[#B9A7FF] text-[#1B1B3A] px-4 sm:px-8 md:px-14 py-12 sm:py-16 border-b-4 border-[#1B1B3A] overflow-hidden">
      {/* Pale Oversized Circle Arc */}
      <div
        className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full border-[42px] border-white/25 pointer-events-none"
        aria-hidden="true"
      />

      {/* Huge Ghosted Word Behind Character */}
      <div
        className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <span className="font-display text-[24vw] leading-none text-white/35 tracking-widest font-extrabold">
          MELODY
        </span>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Tiny Corner Mood Tag with Dash Mark */}
        <div className="flex items-center justify-between gap-2 mb-6 text-xs font-mono-retro font-bold uppercase tracking-widest">
          <span className="px-3.5 py-1.5 rounded-full bg-[#1B1B3A] text-[#FFF0B3]">
            &mdash; WORK 01 : MUSIC BOX
          </span>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Left: Glossy 3D Music Box Render with Pinglet */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="relative w-full max-w-[380px] bg-gradient-to-b from-[#FFF8EE] to-[#FFC9A8] rounded-[2.5rem] p-5 border-4 border-[#1B1B3A] toy-panel-shadow flex flex-col items-center">
              <div className="w-full max-w-[270px] animate-toy-float">
                <PingletSvg
                  mood={isPlaying ? 'excited' : 'sleepy'}
                  size={270}
                  showBackdrop={false}
                  className="w-full h-auto"
                  alt="Pinglet perched atop a pastel designer-toy wind-up music box"
                />
              </div>

              {/* 3D Pastel Music Box Base Pedestal */}
              <div className="w-full bg-gradient-to-r from-[#E86FA0] via-[#FFC9A8] to-[#FFF0B3] rounded-2xl p-4 border-3 border-[#1B1B3A] toy-card-gloss flex items-center justify-between gap-3 -mt-4 relative z-10">
                <div className="flex items-center gap-2">
                  <Music className={`w-6 h-6 text-[#1B1B3A] ${isPlaying ? 'animate-bounce' : ''}`} />
                  <span className="font-rounded font-bold text-sm sm:text-base text-[#1B1B3A]">
                    {isPlaying ? 'Playing Note: ' + (activeNote || '♪') : '56k Chime Box'}
                  </span>
                </div>

                {/* Golden Wind-Up Key Visual */}
                <button
                  type="button"
                  onClick={togglePlayback}
                  className="min-h-[44px] px-4 py-1.5 rounded-full bg-[#FFF0B3] border-2 border-[#1B1B3A] font-mono-retro font-bold text-xs text-[#1B1B3A] shadow-sm cursor-pointer hover:scale-105 transition-transform"
                  aria-label={isPlaying ? 'Stop winding music box' : 'Wind music box key'}
                >
                  {isPlaying ? '⟳ WINDING' : '🔑 WIND KEY'}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Giant Stacked Heading (2 words), Caption (<15 words), & Pentatonic Keys */}
          <div className="lg:col-span-6 text-center lg:text-left space-y-5">
            <h2 className="font-display text-6xl sm:text-8xl tracking-tight leading-[0.88] uppercase">
              DIAL-UP LULLABY
            </h2>

            <p className="font-rounded font-semibold text-xl sm:text-2xl max-w-md mx-auto lg:mx-0 leading-snug">
              Wind the glossy music box to hear a soft pentatonic modem melody.
            </p>

            {/* Primary Music Box Controls (44px+ tap targets) */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <button
                type="button"
                onClick={togglePlayback}
                className={`min-h-[48px] px-6 py-2.5 rounded-full font-rounded font-bold text-base uppercase tracking-wider border-3 border-[#1B1B3A] toy-button-gloss flex items-center gap-2 cursor-pointer transition-all ${
                  isPlaying ? 'bg-[#FFF0B3] text-[#1B1B3A]' : 'bg-[#9FF3D3] text-[#1B1B3A]'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-5 h-5 fill-current" /> PAUSE BOX
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" /> PLAY LULLABY
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onToggleMute}
                className="min-h-[48px] px-5 py-2.5 rounded-full bg-[#FFF8EE] text-[#1B1B3A] font-rounded font-bold text-sm uppercase border-3 border-[#1B1B3A] flex items-center gap-2 cursor-pointer hover:bg-white transition-all"
                aria-label={isMuted ? 'Unmute music box' : 'Mute music box'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isMuted ? 'MUTED' : 'AUDIO ON'}</span>
              </button>
            </div>

            {/* Interactive Candy Chime Buttons */}
            <div
              className="grid grid-cols-5 sm:grid-cols-9 gap-2 pt-2"
              role="group"
              aria-label="Pentatonic music box keys"
            >
              {(Object.keys(PENTATONIC_SCALE) as Array<keyof typeof PENTATONIC_SCALE>).map(
                (noteKey) => {
                  const isCurrent = activeNote === noteKey;
                  return (
                    <button
                      key={noteKey}
                      type="button"
                      onClick={() => handleManualKeyClick(noteKey)}
                      className={`min-h-[52px] rounded-2xl border-2 border-[#1B1B3A] font-rounded font-bold text-sm flex flex-col items-center justify-center cursor-pointer transition-all ${
                        isCurrent
                          ? 'bg-[#FFF0B3] text-[#1B1B3A] scale-105 shadow-md'
                          : 'bg-[#FFF8EE] hover:bg-white text-[#1B1B3A]'
                      }`}
                      aria-label={`Play pentatonic note ${noteKey}`}
                    >
                      <span>{noteKey}</span>
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
