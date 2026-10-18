import React, { useState, useEffect } from 'react';
import {
  audioSystem,
  PENTATONIC_SCALE,
  LULLABY_SEQUENCE,
} from '../utils/audioSynth';
import { Play, Pause, Music, Volume2, VolumeX, Sparkles, Disc } from 'lucide-react';

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
      // Auto clear highlight after 300ms
      setTimeout(() => setActiveNote((n) => (n === note ? null : n)), 300);
    });
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
    audioSystem.playTone(PENTATONIC_SCALE[noteName], 0.35, 'triangle');
    setActiveNote(noteName);
    setTimeout(() => setActiveNote(null), 300);
  };

  return (
    <div className="w-full bg-[#1B1B3A] text-[#FFF8EE] rounded-3xl p-5 sm:p-7 md:p-8 border-4 border-[#B9A7FF]/40 shadow-2xl relative overflow-hidden">
      {/* Corner retro tag */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 text-xs font-mono-retro tracking-widest uppercase">
        <span className="px-3 py-1 bg-[#B9A7FF] text-[#1B1B3A] font-bold rounded-sm flex items-center gap-1.5">
          <Music className="w-3.5 h-3.5" /> [ - WORK 01 : DIAL-UP LULLABY - ]
        </span>
        <span className="text-[#9FF3D3] bg-[#1B1B3A] px-3 py-1 border border-[#9FF3D3]/30 rounded-sm">
          CARRIER FREQ: 261 - 784 Hz
        </span>
      </div>

      <div className="grid md:grid-cols-12 gap-6 items-center">
        {/* Left Column: Description & Player Controls */}
        <div className="md:col-span-7 space-y-4">
          <h3 className="font-display text-4xl sm:text-5xl text-[#B9A7FF] tracking-wide leading-none">
            GENTLE MODEM CHIRPS & STATIC STRINGS
          </h3>
          <p className="font-body text-sm sm:text-base text-[#FFF8EE]/85 leading-relaxed">
            When everyone fell asleep, the old telephone wires hummed softly. Pinglet sings a gentle pentatonic lullaby woven from 56k handshake sine blips and soft CRT phosphor warmth. Never harsh, pure procedural Web Audio API blips.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={togglePlayback}
              className={`px-5 py-3 rounded-xl font-display text-xl sm:text-2xl tracking-wider shadow-lg flex items-center gap-2 cursor-pointer transition-all transform hover:scale-105 active:scale-95 ${
                isPlaying
                  ? 'bg-[#FFB088] text-[#1B1B3A]'
                  : 'bg-[#9FF3D3] text-[#1B1B3A]'
              }`}
              aria-label={isPlaying ? 'Pause Dial-Up Lullaby' : 'Play Dial-Up Lullaby'}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-5 h-5 fill-current" /> PAUSE LULLABY
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" /> PLAY LULLABY
                </>
              )}
            </button>

            <button
              onClick={onToggleMute}
              className={`px-4 py-3 rounded-xl font-mono-retro text-xs uppercase tracking-wider border cursor-pointer transition-all flex items-center gap-2 ${
                isMuted
                  ? 'bg-red-500/20 text-red-300 border-red-400/40'
                  : 'bg-white/10 text-[#9FF3D3] border-white/20 hover:bg-white/15'
              }`}
              aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              {isMuted ? 'MUTED' : 'AUDIO ON'}
            </button>

            <button
              onClick={() => audioSystem.playHandshakeEasterEgg()}
              className="px-4 py-3 rounded-xl font-mono-retro text-xs uppercase tracking-wider bg-[#26264d] hover:bg-[#323264] text-[#B9A7FF] border border-[#B9A7FF]/40 cursor-pointer transition-all flex items-center gap-1.5"
              title="Play retro 3:00 AM dial-up handshake sound"
            >
              <Sparkles className="w-3.5 h-3.5" /> 3AM HANDSHAKE CHIRP
            </button>
          </div>
        </div>

        {/* Right Column: Interactive Pentatonic Organ Keys */}
        <div className="md:col-span-5 bg-[#12122b] p-4 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-3 text-xs font-mono-retro text-[#9FF3D3]">
            <span>PENTATONIC CRT KEYS</span>
            <span className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-[#9FF3D3] animate-ping' : 'bg-white/30'}`} />
              {isPlaying ? 'ACTIVE' : 'TOUCH TO PLAY'}
            </span>
          </div>

          {/* Interactive Keyboard */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {(Object.keys(PENTATONIC_SCALE) as Array<keyof typeof PENTATONIC_SCALE>).map(
              (noteKey) => {
                const isCurrent = activeNote === noteKey;
                return (
                  <button
                    key={noteKey}
                    onClick={() => handleManualKeyClick(noteKey)}
                    className={`h-24 sm:h-28 rounded-lg flex flex-col justify-end p-2 transition-all cursor-pointer border ${
                      isCurrent
                        ? 'bg-[#9FF3D3] text-[#1B1B3A] border-[#FFF8EE] shadow-[0_0_15px_#9FF3D3] scale-95'
                        : 'bg-[#222247] hover:bg-[#2e2e5c] text-[#FFF8EE] border-white/10'
                    }`}
                    aria-label={`Play note ${noteKey}`}
                  >
                    <span className="text-[10px] font-mono-retro opacity-70">
                      {Math.round(PENTATONIC_SCALE[noteKey])}Hz
                    </span>
                    <span className="font-display text-lg sm:text-xl font-bold">{noteKey}</span>
                  </button>
                );
              }
            )}
          </div>

          <p className="text-[11px] font-mono-retro text-[#FFF8EE]/60 mt-3 text-center">
            Tap any key above to chime in with Pinglet!
          </p>
        </div>
      </div>
    </div>
  );
};
