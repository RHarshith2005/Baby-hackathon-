import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  type Packet,
  type PingletMood,
  isPacketCaught,
  calculateCatchScore,
  determineGameMood,
  createPacketData,
} from '../game/packetRules';
import { audioSystem } from '../utils/audioSynth';
import { PingletSvg } from './PingletSvg';
import { Play, RotateCcw, Volume2, VolumeX, Sparkles, Trophy, Zap } from 'lucide-react';

interface CatchThePacketsProps {
  onMoodChange?: (mood: PingletMood) => void;
  isMuted?: boolean;
}

export const CatchThePackets: React.FC<CatchThePacketsProps> = ({
  onMoodChange,
  isMuted = false,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playerX, setPlayerX] = useState<number>(50); // percentage (0 - 100)
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return Number(localStorage.getItem('pinglet_best_score') || 0);
    }
    return 0;
  });
  const [packets, setPackets] = useState<Packet[]>([]);
  const [mood, setMood] = useState<PingletMood>('shy');
  const [missedCount, setMissedCount] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [lastCatchText, setLastCatchText] = useState<string | null>(null);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const packetIdCounterRef = useRef<number>(1);
  const timeElapsedRef = useRef<number>(0);
  const nextSpawnTimerRef = useRef<number>(0.8);

  // Sync mood to parent
  useEffect(() => {
    if (onMoodChange) {
      onMoodChange(mood);
    }
  }, [mood, onMoodChange]);

  const startGame = useCallback(() => {
    setIsPlaying(true);
    setIsGameOver(false);
    setScore(0);
    setStreak(0);
    setMissedCount(0);
    setPackets([]);
    setPlayerX(50);
    setMood('shy');
    setLastCatchText('READY! STEER PINGLET');
    packetIdCounterRef.current = 1;
    timeElapsedRef.current = 0;
    nextSpawnTimerRef.current = 0.5;
    lastTimeRef.current = performance.now();
  }, []);

  const resetGame = useCallback(() => {
    setIsPlaying(false);
    setIsGameOver(false);
    setPackets([]);
    setMood('shy');
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || isGameOver) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        setPlayerX((prev) => Math.max(10, prev - 7));
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        setPlayerX((prev) => Math.min(90, prev + 7));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isGameOver]);

  // Touch and pointer dragging
  const updatePlayerPosFromPointer = (clientX: number) => {
    if (!gameAreaRef.current) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPlayerX(Math.max(10, Math.min(90, pct)));
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    updatePlayerPosFromPointer(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    updatePlayerPosFromPointer(e.clientX);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Main game tick
  useEffect(() => {
    if (!isPlaying || isGameOver) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    const gameLoop = (timestamp: number) => {
      const dt = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      // Bound dt to prevent huge leaps if tab unfocused
      const safeDt = Math.min(dt, 0.1);
      timeElapsedRef.current += safeDt;
      nextSpawnTimerRef.current -= safeDt;

      // Spawn packets
      if (nextSpawnTimerRef.current <= 0) {
        const newPacket = createPacketData(
          Math.floor(Math.random() * 100),
          packetIdCounterRef.current++,
          timeElapsedRef.current
        );
        setPackets((prev) => [...prev, newPacket]);
        // Dynamic spawn frequency
        nextSpawnTimerRef.current = Math.max(0.65, 1.4 - timeElapsedRef.current * 0.015);
      }

      // Update falling packets and check collisions
      setPackets((prevPackets) => {
        const nextList: Packet[] = [];
        let scoreDelta = 0;
        let streakDelta = 0;
        let missedDelta = 0;
        let caughtLabel = '';
        let caughtType: Packet['type'] | null = null;

        for (const pkt of prevPackets) {
          const nextY = pkt.y + pkt.speed * safeDt;

          // Check if caught in Pinglet's hitzone (y ~ 75-90)
          if (isPacketCaught({ x: pkt.x, y: nextY }, playerX, 22, 75, 92)) {
            const result = calculateCatchScore(score, streak, pkt.points);
            scoreDelta += result.earned;
            streakDelta = result.streak;
            caughtLabel = `${pkt.points > 0 ? '+' : ''}${result.earned} (${pkt.label})`;
            caughtType = pkt.type;
            continue; // Packet is collected!
          }

          // Check if missed below screen
          if (nextY > 105) {
            if (pkt.type !== 'bitrot') {
              missedDelta++;
            }
            continue; // Dropped off screen
          }

          nextList.push({ ...pkt, y: nextY });
        }

        // Apply catch effects
        if (caughtType) {
          audioSystem.playPacketCatch(caughtType);
          setLastCatchText(caughtLabel);
          setScore((s) => {
            const newS = Math.max(0, s + scoreDelta);
            if (newS > bestScore) {
              setBestScore(newS);
              localStorage.setItem('pinglet_best_score', String(newS));
            }
            return newS;
          });
          setStreak(streakDelta);
          const nextMood = determineGameMood(score + scoreDelta, streakDelta, false);
          setMood(nextMood);
        }

        // Apply misses
        if (missedDelta > 0) {
          setMissedCount((m) => {
            const totalMissed = m + missedDelta;
            if (totalMissed >= 5) {
              setIsGameOver(true);
              const endMood = determineGameMood(score, 0, true);
              setMood(endMood);
            }
            return totalMissed;
          });
          setStreak(0);
        }

        return nextList;
      });

      requestRef.current = requestAnimationFrame(gameLoop);
    };

    lastTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, isGameOver, playerX, score, streak, bestScore]);

  return (
    <div className="w-full bg-[#1B1B3A] text-[#FFF8EE] rounded-3xl p-4 sm:p-6 md:p-8 border-4 border-[#9FF3D3]/40 shadow-2xl relative overflow-hidden">
      {/* Corner retro mood tag */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 text-xs font-mono-retro tracking-widest uppercase">
        <span className="px-3 py-1 bg-[#9FF3D3] text-[#1B1B3A] font-bold rounded-sm flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5" /> [ - MINI-GAME : 56K DISPATCH - ]
        </span>
        <span className="text-[#B9A7FF] bg-[#1B1B3A]/80 px-3 py-1 border border-[#B9A7FF]/30 rounded-sm">
          CARRIER: 100% CRT PHOSPHOR
        </span>
      </div>

      {/* Header and stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4">
        <div className="bg-[#26264d] p-3 rounded-xl border border-white/10 text-center">
          <span className="text-[11px] font-mono-retro text-[#9FF3D3] uppercase block">Score</span>
          <span className="font-display text-3xl sm:text-4xl text-[#FFF8EE]">{score}</span>
        </div>
        <div className="bg-[#26264d] p-3 rounded-xl border border-white/10 text-center">
          <span className="text-[11px] font-mono-retro text-[#FFB088] uppercase block">Streak</span>
          <span className="font-display text-3xl sm:text-4xl text-[#FFB088]">
            {streak > 1 ? `${streak}x` : streak}
          </span>
        </div>
        <div className="bg-[#26264d] p-3 rounded-xl border border-white/10 text-center">
          <span className="text-[11px] font-mono-retro text-[#B9A7FF] uppercase block">Pinglet Mood</span>
          <span className="font-mono-retro font-bold text-lg sm:text-xl text-[#B9A7FF] capitalize">
            {mood}
          </span>
        </div>
        <div className="bg-[#26264d] p-3 rounded-xl border border-white/10 text-center">
          <span className="text-[11px] font-mono-retro text-red-300 uppercase block">Lost Packets</span>
          <span className="font-display text-3xl sm:text-4xl text-red-300">
            {missedCount}/5
          </span>
        </div>
      </div>

      {/* Playfield Area */}
      <div
        ref={gameAreaRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="relative w-full h-[360px] sm:h-[420px] bg-gradient-to-b from-[#12122b] to-[#1e1e40] rounded-2xl border-2 border-dashed border-[#B9A7FF]/40 overflow-hidden select-none touch-none cursor-ew-resize"
        role="region"
        aria-label="Catch the Packets game board"
      >
        {/* Retro Grid Background */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#9FF3D3 1px, transparent 1px), linear-gradient(90deg, #9FF3D3 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />

        {/* Catch lane line */}
        <div className="absolute top-[82%] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#9FF3D3]/40 to-transparent pointer-events-none" />

        {/* Falling Packets */}
        {packets.map((pkt) => (
          <div
            key={pkt.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none transition-transform duration-75"
            style={{
              left: `${pkt.x}%`,
              top: `${pkt.y}%`,
            }}
          >
            <div
              className="px-2.5 py-1 rounded text-xs font-mono-retro font-bold border shadow-lg flex items-center gap-1"
              style={{
                backgroundColor: pkt.type === 'bitrot' ? '#5a1212' : '#1B1B3A',
                color: pkt.glowColor,
                borderColor: pkt.glowColor,
                boxShadow: `0 0 12px ${pkt.glowColor}66`,
              }}
            >
              {pkt.type === 'sparkle' ? '★' : pkt.type === 'bitrot' ? '⚠' : '✉'} {pkt.label}
            </div>
            <div
              className="w-2.5 h-2.5 rounded-full mt-0.5 animate-ping opacity-75"
              style={{ backgroundColor: pkt.glowColor }}
            />
          </div>
        ))}

        {/* Pinglet Player Character */}
        <div
          className="absolute top-[82%] transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-75 flex flex-col items-center"
          style={{
            left: `${playerX}%`,
          }}
        >
          {/* Reaction bubble */}
          {lastCatchText && (
            <div className="absolute -top-10 px-2 py-0.5 bg-[#FFF8EE] text-[#1B1B3A] text-[11px] font-mono-retro font-bold rounded shadow-md whitespace-nowrap animate-bounce">
              {lastCatchText}
            </div>
          )}

          <div className="w-24 h-24 sm:w-28 sm:h-28 filter drop-shadow-[0_8px_16px_rgba(159,243,211,0.35)]">
            <PingletSvg mood={mood} size={112} />
          </div>

          {/* Steer ring */}
          <div className="w-20 h-3 rounded-full bg-[#9FF3D3]/20 border border-[#9FF3D3]/50 blur-[1px]" />
        </div>

        {/* Overlay: Game Start / Game Over */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-[#1B1B3A]/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-10">
            <div className="w-20 h-20 mb-3 animate-float">
              <PingletSvg mood="shy" size={80} />
            </div>
            <h3 className="font-display text-4xl sm:text-5xl tracking-wide text-[#9FF3D3] mb-2">
              CATCH THE PACKETS
            </h3>
            <p className="font-body text-sm sm:text-base text-[#FFF8EE]/90 max-w-sm mb-5 leading-relaxed">
              Touch and drag Pinglet left and right (or use <kbd className="px-1.5 py-0.5 bg-white/10 rounded font-mono-retro text-xs">←</kbd> <kbd className="px-1.5 py-0.5 bg-white/10 rounded font-mono-retro text-xs">→</kbd> keys) to catch lost hellos!
            </p>
            <button
              onClick={startGame}
              className="px-6 py-3 bg-[#9FF3D3] hover:bg-[#86eec6] text-[#1B1B3A] font-display text-2xl tracking-wider rounded-xl shadow-lg transform hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-6 h-6 fill-current" /> LAUNCH DISPATCH
            </button>
          </div>
        )}

        {isGameOver && (
          <div className="absolute inset-0 bg-[#1B1B3A]/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-10 animate-fade-in">
            <div className="w-20 h-20 mb-2">
              <PingletSvg mood="sleepy" size={80} />
            </div>
            <span className="font-mono-retro text-xs text-[#B9A7FF] tracking-widest uppercase mb-1">
              [ - ATTIC DISPATCH PAUSED - ]
            </span>
            <h3 className="font-display text-4xl sm:text-5xl text-[#FFB088] mb-1">
              TIRED BABY GHOST
            </h3>
            <p className="font-body text-sm text-[#FFF8EE]/80 max-w-xs mb-4">
              5 packets slipped through the copper wires! Pinglet is taking a cozy nap.
            </p>
            <div className="bg-[#26264d] px-5 py-3 rounded-xl border border-white/10 mb-5 flex items-center gap-6">
              <div>
                <span className="text-[11px] font-mono-retro text-[#9FF3D3] block uppercase">Final Score</span>
                <span className="font-display text-3xl text-white">{score}</span>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div>
                <span className="text-[11px] font-mono-retro text-[#FFB088] block uppercase">Best Record</span>
                <span className="font-display text-3xl text-[#FFB088]">{bestScore}</span>
              </div>
            </div>
            <button
              onClick={startGame}
              className="px-6 py-3 bg-[#B9A7FF] hover:bg-[#a791ff] text-[#1B1B3A] font-display text-2xl tracking-wider rounded-xl shadow-lg transform hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" /> TRY AGAIN WITH A SMILE
            </button>
          </div>
        )}
      </div>

      {/* Controls & instructions footer */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono-retro text-[#FFF8EE]/70">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#9FF3D3] animate-ping" />
          <span>DRAG OR TAP SCREEN TO STEER</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#9FF3D3]">✉ +10 HELLO</span>
          <span className="text-[#B9A7FF]">✉ +25 PING</span>
          <span className="text-[#FFB088]">★ +50 KISS</span>
          <span className="text-red-400">⚠ -15 BITROT</span>
        </div>
      </div>
    </div>
  );
};
