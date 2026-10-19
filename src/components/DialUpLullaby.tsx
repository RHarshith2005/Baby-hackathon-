import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  audioSystem,
  PENTATONIC_SCALE,
} from '../utils/audioSynth';
import { PingletSvg } from './PingletSvg';
import { Play, Pause, Volume2, VolumeX, Music, Sliders, Share2 } from 'lucide-react';
import { encodeLullabyPattern, decodeLullabyPattern } from '../store/pingletStoreRules';

interface DialUpLullabyProps {
  isMuted: boolean;
  onToggleMute: () => void;
}

const PENTATONIC_NOTES_ORDER = ['G5', 'E5', 'D5', 'C5', 'A4', 'G4'] as Array<keyof typeof PENTATONIC_SCALE>;
const STORAGE_PATTERN_KEY = 'pinglet_composer_grid_v1';

export const DialUpLullaby: React.FC<DialUpLullabyProps> = React.memo(({
  isMuted,
  onToggleMute,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [isComposeMode, setIsComposeMode] = useState<boolean>(false);
  const [tempo, setTempo] = useState<number>(120);
  const [activeStep, setActiveStep] = useState<number>(-1);
  const [shareCopied, setShareCopied] = useState<boolean>(false);

  // 6 notes (rows) x 8 steps (cols)
  const [grid, setGrid] = useState<boolean[][]>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const decoded = decodeLullabyPattern(hash);
      if (decoded) {
        return decoded.grid;
      }
      try {
        const saved = localStorage.getItem(STORAGE_PATTERN_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length === 6) return parsed;
        }
      } catch {}
    }
    // Default pleasant pattern
    const def = Array.from({ length: 6 }, () => Array(8).fill(false));
    def[1][0] = true;
    def[3][2] = true;
    def[4][4] = true;
    def[2][6] = true;
    return def;
  });

  const composerTimerRef = useRef<number | null>(null);
  const currentStepRef = useRef<number>(0);

  useEffect(() => {
    audioSystem.setOnTrackNoteChange((note) => {
      if (!isComposeMode) {
        setActiveNote(note);
        window.setTimeout(() => setActiveNote((n) => (n === note ? null : n)), 280);
      }
    });
    return () => {
      audioSystem.stopLullaby();
      if (composerTimerRef.current) {
        window.clearInterval(composerTimerRef.current);
      }
    };
  }, [isComposeMode]);

  // Save grid to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_PATTERN_KEY, JSON.stringify(grid));
    } catch {}
  }, [grid]);

  const togglePlayback = () => {
    if (isPlaying) {
      if (isComposeMode) {
        if (composerTimerRef.current) {
          window.clearInterval(composerTimerRef.current);
          composerTimerRef.current = null;
        }
        setActiveStep(-1);
      } else {
        audioSystem.stopLullaby();
      }
      setIsPlaying(false);
      setActiveNote(null);
    } else {
      if (isComposeMode) {
        startComposerPlayback();
      } else {
        audioSystem.startLullaby();
      }
      setIsPlaying(true);
    }
  };

  const startComposerPlayback = useCallback(() => {
    if (composerTimerRef.current) {
      window.clearInterval(composerTimerRef.current);
    }
    currentStepRef.current = 0;
    const stepDurationMs = (60 / tempo) * 500; // 8th note intervals

    composerTimerRef.current = window.setInterval(() => {
      const step = currentStepRef.current;
      setActiveStep(step);

      // Play notes active in this column
      for (let r = 0; r < 6; r++) {
        if (grid[r][step]) {
          const noteName = PENTATONIC_NOTES_ORDER[r];
          const freq = PENTATONIC_SCALE[noteName];
          if (!isMuted) {
            audioSystem.playTone(freq, 0.22, 'triangle');
          }
          setActiveNote(noteName);
          window.setTimeout(() => setActiveNote(null), 220);
        }
      }

      currentStepRef.current = (step + 1) % 8;
    }, stepDurationMs);
  }, [grid, tempo, isMuted]);

  const toggleCell = (row: number, col: number) => {
    const next = grid.map((r, rIdx) =>
      rIdx === row ? r.map((cell, cIdx) => (cIdx === col ? !cell : cell)) : r
    );
    setGrid(next);
  };

  const handleShareHash = () => {
    const hashStr = encodeLullabyPattern(grid, tempo);
    const fullUrl = `${window.location.origin}${window.location.pathname}#${hashStr}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(fullUrl).then(() => {
        setShareCopied(true);
        window.setTimeout(() => setShareCopied(false), 2500);
      });
    }
    window.location.hash = hashStr;
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
            &mdash; WORK 01 : MUSIC BOX & COMPOSER
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
                  mouthOpen={isPlaying ? 0.75 : 0}
                  className="w-full h-auto"
                  alt="Pinglet perched atop a pastel designer-toy wind-up music box"
                />
              </div>

              {/* 3D Pastel Music Box Base Pedestal */}
              <div className="w-full bg-gradient-to-r from-[#E86FA0] via-[#FFC9A8] to-[#FFF0B3] rounded-2xl p-4 border-3 border-[#1B1B3A] toy-card-gloss flex items-center justify-between gap-3 -mt-4 relative z-10">
                <div className="flex items-center gap-2">
                  <Music className={`w-6 h-6 text-[#1B1B3A] ${isPlaying ? 'animate-bounce' : ''}`} />
                  <span className="font-rounded font-bold text-sm sm:text-base text-[#1B1B3A]">
                    {isPlaying ? 'Singing Note: ' + (activeNote || '♪') : '56k Chime Box'}
                  </span>
                </div>

                {/* Golden Wind-Up Key Visual */}
                <button
                  type="button"
                  onClick={togglePlayback}
                  className="min-h-[44px] px-4 py-1.5 rounded-full bg-[#FFF0B3] border-2 border-[#1B1B3A] font-mono-retro font-bold text-xs text-[#1B1B3A] shadow-sm cursor-pointer hover:scale-105 transition-transform"
                  aria-label={isPlaying ? 'Stop winding music box' : 'Wind music box key'}
                >
                  {isPlaying ? '⟳ PLAYING' : '🔑 WIND KEY'}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Heading, Mode Switcher, & Grid / Chime Keys */}
          <div className="lg:col-span-6 text-center lg:text-left space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-5xl sm:text-7xl tracking-tight leading-[0.88] uppercase">
                {isComposeMode ? 'LULLABY COMPOSER' : 'DIAL-UP LULLABY'}
              </h2>

              <button
                type="button"
                onClick={() => {
                  if (isPlaying) togglePlayback();
                  setIsComposeMode(!isComposeMode);
                }}
                className="min-h-[48px] px-4 py-2 rounded-full bg-[#FFF8EE] text-[#1B1B3A] font-rounded font-bold text-xs uppercase border-2 border-[#1B1B3A] flex items-center gap-1.5 cursor-pointer hover:bg-white shadow-sm"
              >
                <Sliders className="w-4 h-4" />
                <span>{isComposeMode ? 'Music Box Mode' : 'Compose Mode'}</span>
              </button>
            </div>

            <p className="font-rounded font-semibold text-base sm:text-lg max-w-md mx-auto lg:mx-0 leading-snug">
              {isComposeMode
                ? 'Create your own custom 8-step pentatonic melody and share it via URL hash!'
                : 'Wind the glossy music box to hear a soft pentatonic modem melody.'}
            </p>

            {/* Primary Controls */}
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
                    <Pause className="w-5 h-5 fill-current" /> STOP
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" /> {isComposeMode ? 'PLAY PATTERN' : 'PLAY LULLABY'}
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

              {isComposeMode && (
                <button
                  type="button"
                  onClick={handleShareHash}
                  className="min-h-[48px] px-4 py-2.5 rounded-full bg-[#FFC9A8] text-[#1B1B3A] font-rounded font-bold text-xs uppercase border-3 border-[#1B1B3A] flex items-center gap-1.5 cursor-pointer hover:bg-[#ffb993]"
                  title="Copy shareable URL hash"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{shareCopied ? 'Copied Hash!' : 'Share URL'}</span>
                </button>
              )}
            </div>

            {/* Compose Mode Grid or Classic Keys */}
            {isComposeMode ? (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs font-mono-retro font-bold text-[#1B1B3A]">
                  <span>TEMPO: {tempo} BPM</span>
                  <input
                    type="range"
                    min="60"
                    max="200"
                    step="5"
                    value={tempo}
                    onChange={(e) => setTempo(parseInt(e.target.value, 10))}
                    className="w-36 accent-[#1B1B3A] cursor-pointer"
                  />
                </div>

                {/* 6x8 Grid */}
                <div className="bg-[#1B1B3A] rounded-2xl p-3 border-3 border-[#1B1B3A] space-y-2">
                  {PENTATONIC_NOTES_ORDER.map((noteName, rIdx) => (
                    <div key={noteName} className="flex items-center gap-2">
                      <span className="w-10 font-mono-retro text-xs font-bold text-[#9FF3D3] text-right">
                        {noteName}
                      </span>
                      <div className="flex-1 grid grid-cols-8 gap-1.5">
                        {Array.from({ length: 8 }).map((_, cIdx) => {
                          const isActive = grid[rIdx][cIdx];
                          const isHighlighted = activeStep === cIdx;
                          return (
                            <button
                              key={cIdx}
                              type="button"
                              onClick={() => toggleCell(rIdx, cIdx)}
                              className={`h-11 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-center font-bold text-xs ${
                                isActive
                                  ? 'bg-[#9FF3D3] text-[#1B1B3A] border-white shadow-sm'
                                  : 'bg-[#282854] text-white/30 border-white/20 hover:bg-[#34346B]'
                              } ${isHighlighted ? 'ring-2 ring-yellow-300 scale-105' : ''}`}
                              aria-label={`Step ${cIdx + 1}, Note ${noteName}, ${isActive ? 'Active' : 'Inactive'}`}
                            >
                              {isActive ? '•' : ''}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Interactive Candy Chime Buttons */
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

DialUpLullaby.displayName = 'DialUpLullaby';
