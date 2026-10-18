import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  type Packet,
  type PingletMood,
  GAME_DURATION_SECONDS,
  calculateCatchScore,
  determineGameMood,
  createPacketData,
} from '../game/packetRules';
import { audioSystem } from '../utils/audioSynth';
import { PingletSvg } from './PingletSvg';
import { Play, RotateCcw } from 'lucide-react';

interface CatchThePacketsProps {
  onMoodChange?: (mood: PingletMood) => void;
  onIncrementHellos?: () => void;
  isMuted?: boolean;
}

export const CatchThePackets: React.FC<CatchThePacketsProps> = ({
  onMoodChange,
  onIncrementHellos,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(GAME_DURATION_SECONDS);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(() => {
    try {
      if (typeof window !== 'undefined') {
        return Number(localStorage.getItem('pinglet_best_score') || 0);
      }
    } catch {
      // Ignore storage errors
    }
    return 0;
  });
  const [packets, setPackets] = useState<Packet[]>([]);
  const [mood, setMood] = useState<PingletMood>('excited');
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const packetIdCounterRef = useRef<number>(1);
  const timeElapsedRef = useRef<number>(0);
  const nextSpawnTimerRef = useRef<number>(0.4);

  useEffect(() => {
    if (onMoodChange) {
      onMoodChange(mood);
    }
  }, [mood, onMoodChange]);

  const startGame = useCallback(() => {
    setIsPlaying(true);
    setIsGameOver(false);
    setTimeLeft(GAME_DURATION_SECONDS);
    setScore(0);
    setStreak(0);
    setMood('excited');
    packetIdCounterRef.current = 1;
    timeElapsedRef.current = 0;
    nextSpawnTimerRef.current = 0.25;
    lastTimeRef.current = performance.now();
    // Spawn 2 initial packets immediately
    const initial: Packet[] = [
      { ...createPacketData(11, packetIdCounterRef.current++, 0), y: 18 },
      { ...createPacketData(47, packetIdCounterRef.current++, 0), y: 34 },
    ];
    setPackets(initial);
  }, []);

  const handleTapPacket = (pkt: Packet) => {
    if (!isPlaying || isGameOver) return;
    audioSystem.playPacketCatch(pkt.type);
    setPackets((prev) => prev.filter((item) => item.id !== pkt.id));

    const result = calculateCatchScore(score, streak, pkt.points);
    const nextScore = result.score;
    setScore(nextScore);
    setStreak(result.streak);

    if (nextScore > bestScore) {
      setBestScore(nextScore);
      try {
        localStorage.setItem('pinglet_best_score', String(nextScore));
      } catch {
        // Ignore storage error
      }
    }

    if (onIncrementHellos) {
      onIncrementHellos();
    }

    setMood(determineGameMood(nextScore, result.streak, false));
  };

  useEffect(() => {
    if (!isPlaying || isGameOver) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    const gameLoop = (timestamp: number) => {
      const dt = Math.min(0.1, (timestamp - lastTimeRef.current) / 1000);
      lastTimeRef.current = timestamp;

      timeElapsedRef.current += dt;
      const remaining = Math.max(0, GAME_DURATION_SECONDS - timeElapsedRef.current);
      setTimeLeft(Math.ceil(remaining));

      if (remaining <= 0) {
        setIsGameOver(true);
        setIsPlaying(false);
        setMood('sleepy');
        return;
      }

      nextSpawnTimerRef.current -= dt;
      if (nextSpawnTimerRef.current <= 0) {
        const newPacket = createPacketData(
          Math.floor(Math.random() * 100),
          packetIdCounterRef.current++,
          timeElapsedRef.current
        );
        setPackets((prev) => [...prev, newPacket]);
        nextSpawnTimerRef.current = 0.55;
      }

      setPackets((prevPackets) =>
        prevPackets
          .map((pkt) => ({ ...pkt, y: pkt.y + pkt.speed * dt }))
          .filter((pkt) => pkt.y <= 98)
      );

      requestRef.current = requestAnimationFrame(gameLoop);
    };

    lastTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, isGameOver]);

  return (
    <div className="relative w-full bg-[#9FF3D3] text-[#1B1B3A] px-4 sm:px-8 md:px-14 py-12 sm:py-16 border-b-4 border-[#1B1B3A] overflow-hidden">
      {/* Pale Oversized Circle Arc */}
      <div
        className="absolute -bottom-32 -left-32 w-[440px] h-[440px] rounded-full border-[44px] border-white/30 pointer-events-none"
        aria-hidden="true"
      />

      {/* Huge Ghosted Word Behind Character */}
      <div
        className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <span className="font-display text-[26vw] leading-none text-white/45 tracking-widest font-extrabold">
          CATCH
        </span>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Tiny Corner Mood Tag with Dash Mark */}
        <div className="flex items-center justify-between gap-2 mb-6 text-xs font-mono-retro font-bold uppercase tracking-widest">
          <span className="px-3.5 py-1.5 rounded-full bg-[#1B1B3A] text-[#9FF3D3]">
            &mdash; WORK 02 : 20S TAP GAME
          </span>
        </div>

        {/* Heading (3 words) + Fredoka Caption (<15 words) */}
        <div className="text-center lg:text-left mb-6">
          <h2 className="font-display text-6xl sm:text-8xl tracking-tight leading-[0.88] uppercase">
            CATCH THE PACKETS
          </h2>
          <p className="font-rounded font-semibold text-xl sm:text-2xl mt-2">
            Tap the falling candy envelopes for twenty seconds to deliver hellos!
          </p>
        </div>

        {/* Game Arena Card */}
        <div className="bg-[#1B1B3A] text-[#FFF8EE] rounded-[2.5rem] p-4 sm:p-6 border-4 border-[#1B1B3A] toy-panel-shadow">
          {/* Scoreboard Bar */}
          <div className="grid grid-cols-3 gap-3 mb-4 text-center">
            <div className="bg-[#282854] rounded-2xl py-2.5 px-3 border-2 border-white/15">
              <span className="text-[11px] font-mono-retro text-[#9FF3D3] uppercase block">
                TIME LEFT
              </span>
              <span className="font-display text-3xl sm:text-4xl text-[#FFF0B3]">
                {timeLeft}s
              </span>
            </div>
            <div className="bg-[#282854] rounded-2xl py-2.5 px-3 border-2 border-white/15">
              <span className="text-[11px] font-mono-retro text-[#FFC9A8] uppercase block">
                SCORE
              </span>
              <span className="font-display text-3xl sm:text-4xl text-white">
                {score}
              </span>
            </div>
            <div className="bg-[#282854] rounded-2xl py-2.5 px-3 border-2 border-white/15">
              <span className="text-[11px] font-mono-retro text-[#B9A7FF] uppercase block">
                BEST
              </span>
              <span className="font-display text-3xl sm:text-4xl text-[#B9A7FF]">
                {bestScore}
              </span>
            </div>
          </div>

          {/* Interactive Tap Playfield */}
          <div
            className="relative w-full h-[350px] sm:h-[400px] bg-gradient-to-b from-[#1F1A45] via-[#3B266B] to-[#E86FA0]/40 rounded-[2rem] border-3 border-[#B9A7FF]/40 overflow-hidden select-none"
            role="region"
            aria-label="Tap falling candy packets game board"
          >
            {/* Falling Tappable Candy Packets (Minimum 48px touch targets) */}
            {packets.map((pkt) => (
              <button
                key={pkt.id}
                type="button"
                onClick={() => handleTapPacket(pkt)}
                onPointerDown={() => handleTapPacket(pkt)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 min-h-[48px] min-w-[116px] px-4 py-2 rounded-full font-rounded font-bold text-xs sm:text-sm text-[#1B1B3A] border-3 border-[#1B1B3A] shadow-lg flex items-center justify-center gap-1.5 cursor-pointer active:scale-90 transition-transform"
                style={{
                  left: `${pkt.x}%`,
                  top: `${pkt.y}%`,
                  backgroundColor: pkt.glowColor,
                }}
                aria-label={`Tap packet ${pkt.label} for ${pkt.points} points`}
              >
                <span>🍬</span>
                <span>{pkt.label}</span>
                <span>+{pkt.points}</span>
              </button>
            ))}

            {/* Pinglet Cheering at Bottom Center */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-28 sm:w-32 sm:h-32 pointer-events-none">
              <PingletSvg
                mood={mood}
                size={128}
                showBackdrop={false}
                interactiveTilt={false}
                className="w-full h-auto"
                alt="Pinglet cheering as packets are tapped"
              />
            </div>

            {/* Start / Replay Overlay */}
            {(!isPlaying || isGameOver) && (
              <div className="absolute inset-0 bg-[#1B1B3A]/90 flex flex-col items-center justify-center p-6 text-center z-20">
                <div className="w-28 h-28 mb-2 animate-toy-float">
                  <PingletSvg
                    mood={isGameOver ? 'excited' : 'shy'}
                    size={112}
                    showBackdrop={false}
                    className="w-full h-auto"
                    alt="Pinglet ready to play Catch the Packets"
                  />
                </div>

                <h3 className="font-display text-4xl sm:text-5xl text-[#FFF0B3] tracking-wide uppercase mb-3">
                  {isGameOver ? `SCORE: ${score} PTS!` : '20-SECOND PACKET RUSH'}
                </h3>

                <button
                  type="button"
                  onClick={startGame}
                  className="min-h-[52px] px-8 py-3 bg-[#9FF3D3] hover:bg-[#88efd0] text-[#1B1B3A] font-rounded font-bold text-lg uppercase rounded-full border-3 border-[#1B1B3A] toy-button-gloss flex items-center gap-2 cursor-pointer"
                >
                  {isGameOver ? (
                    <>
                      <RotateCcw className="w-5 h-5" /> PLAY AGAIN (20S)
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current" /> START 20S GAME
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
