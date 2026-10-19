import { useState, useRef, useEffect, useCallback } from 'react';
import {
  isHeadZone,
  detectGesture,
  calculateBlushMultiplier,
  shouldTriggerSugarRush,
  type ToyReaction,
  type TouchSample,
} from './toyTouchRules';
import { audioSystem } from './audioSynth';

export interface UseToyTouchOptions {
  isMuted?: boolean;
  onFeed?: () => void;
  onWake?: () => void;
}

export function useToyTouch(options: UseToyTouchOptions = {}) {
  const [reaction, setReaction] = useState<ToyReaction>('idle');
  const [candiesFed, setCandiesFed] = useState<number>(0);
  const [blushMultiplier, setBlushMultiplier] = useState<number>(1.0);
  const [eyesClosed, setEyesClosed] = useState<boolean>(false);
  const [antennasWarm, setAntennasWarm] = useState<boolean>(false);
  const [mouthOpen, setMouthOpen] = useState<number>(0);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  // Gesture tracking refs
  const touchSamplesRef = useRef<TouchSample[]>([]);
  const pointerStartTimeRef = useRef<number>(0);
  const isPointerDownRef = useRef<boolean>(false);
  const pointerStartZoneRef = useRef<'head' | 'belly'>('belly');
  const rapidPokesRef = useRef<number>(0);
  const rapidPokeTimerRef = useRef<number | null>(null);

  // Idle timer refs
  const idleTimer15sRef = useRef<number | null>(null);
  const idleTimer30sRef = useRef<number | null>(null);
  const reactionTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const resetIdleTimers = useCallback(() => {
    if (idleTimer15sRef.current) window.clearTimeout(idleTimer15sRef.current);
    if (idleTimer30sRef.current) window.clearTimeout(idleTimer30sRef.current);

    // 15s Idle: Yawn & droop
    idleTimer15sRef.current = window.setTimeout(() => {
      setReaction('yawn');
      setMouthOpen(0.8);
      setEyesClosed(true);
      audioSystem.playYawn();

      window.setTimeout(() => {
        setMouthOpen(0);
        setEyesClosed(false);
        setReaction('idle');
      }, 1600);
    }, 15000);

    // 30s Idle: Fall asleep with Zzz
    idleTimer30sRef.current = window.setTimeout(() => {
      setReaction('sleeping');
      setEyesClosed(true);
    }, 30000);
  }, []);

  // Initialize idle timers on mount
  useEffect(() => {
    resetIdleTimers();
    return () => {
      if (idleTimer15sRef.current) window.clearTimeout(idleTimer15sRef.current);
      if (idleTimer30sRef.current) window.clearTimeout(idleTimer30sRef.current);
      if (reactionTimerRef.current) window.clearTimeout(reactionTimerRef.current);
      if (rapidPokeTimerRef.current) window.clearTimeout(rapidPokeTimerRef.current);
    };
  }, [resetIdleTimers]);

  const wakeUp = useCallback(() => {
    if (reaction === 'sleeping' || reaction === 'yawn') {
      setReaction('startled');
      setEyesClosed(false);
      setMouthOpen(0.5);
      audioSystem.playWakeHop();

      window.setTimeout(() => {
        setMouthOpen(0);
        setReaction('idle');
      }, 700);
    }
    resetIdleTimers();
  }, [reaction, resetIdleTimers]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      isPointerDownRef.current = true;
      const rect = e.currentTarget.getBoundingClientRect();
      const normY = (e.clientY - rect.top) / Math.max(1, rect.height);
      const isHead = isHeadZone(normY);
      pointerStartZoneRef.current = isHead ? 'head' : 'belly';

      pointerStartTimeRef.current = performance.now();
      touchSamplesRef.current = [{ x: e.clientX, y: e.clientY, time: performance.now() }];

      if (reaction === 'sleeping' || reaction === 'yawn') {
        wakeUp();
        return;
      }

      resetIdleTimers();
    },
    [reaction, wakeUp, resetIdleTimers]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isPointerDownRef.current) return;
      touchSamplesRef.current.push({ x: e.clientX, y: e.clientY, time: performance.now() });

      // Live petting check during long touch on head
      const now = performance.now();
      const duration = now - pointerStartTimeRef.current;
      if (pointerStartZoneRef.current === 'head' && duration > 350 && reaction !== 'petting') {
        setReaction('petting');
        setEyesClosed(true);
        setAntennasWarm(true);
        setBlushMultiplier(1.85);
        audioSystem.playPurr();
      }
    },
    [reaction]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isPointerDownRef.current) return;
      isPointerDownRef.current = false;

      const duration = performance.now() - pointerStartTimeRef.current;
      touchSamplesRef.current.push({ x: e.clientX, y: e.clientY, time: performance.now() });

      const isHead = pointerStartZoneRef.current === 'head';
      const gesture = detectGesture(touchSamplesRef.current, isHead, duration);

      touchSamplesRef.current = [];

      if (gesture === 'pet' || reaction === 'petting') {
        // Wrap up petting
        setReaction('petting');
        setEyesClosed(true);
        setAntennasWarm(true);
        setBlushMultiplier(1.85);

        if (reactionTimerRef.current) window.clearTimeout(reactionTimerRef.current);
        reactionTimerRef.current = window.setTimeout(() => {
          setReaction('idle');
          setEyesClosed(false);
          setAntennasWarm(false);
          setBlushMultiplier(1.0);
        }, 1200);
        return;
      }

      if (gesture === 'tickle') {
        setReaction('tickled');
        setMouthOpen(0.85);
        setBlushMultiplier(1.95);
        audioSystem.playLaugh();

        if (reactionTimerRef.current) window.clearTimeout(reactionTimerRef.current);
        reactionTimerRef.current = window.setTimeout(() => {
          setReaction('out_of_breath');
          setMouthOpen(0.35);

          reactionTimerRef.current = window.setTimeout(() => {
            setReaction('idle');
            setMouthOpen(0);
            setBlushMultiplier(1.0);
          }, 1400);
        }, 1200);
        return;
      }

      if (gesture === 'poke' || gesture === 'tap') {
        rapidPokesRef.current += 1;
        if (rapidPokeTimerRef.current) window.clearTimeout(rapidPokeTimerRef.current);
        rapidPokeTimerRef.current = window.setTimeout(() => {
          rapidPokesRef.current = 0;
        }, 1400);

        if (rapidPokesRef.current >= 4) {
          // Escalated "stop it!!" shake and deep blush
          setReaction('stop_it');
          setBlushMultiplier(2.4);
          setMouthOpen(0.7);
          audioSystem.playGiggle();

          if (reactionTimerRef.current) window.clearTimeout(reactionTimerRef.current);
          reactionTimerRef.current = window.setTimeout(() => {
            setReaction('idle');
            setMouthOpen(0);
            setBlushMultiplier(1.0);
            rapidPokesRef.current = 0;
          }, 1600);
        } else {
          // Standard poke
          setReaction('poked');
          setBlushMultiplier(calculateBlushMultiplier('poked', rapidPokesRef.current));
          audioSystem.playBoop();
          audioSystem.playGiggle();

          if (reactionTimerRef.current) window.clearTimeout(reactionTimerRef.current);
          reactionTimerRef.current = window.setTimeout(() => {
            setReaction('idle');
            setBlushMultiplier(1.0);
          }, 450);
        }
      }
    },
    [reaction]
  );

  const feedCandy = useCallback(() => {
    wakeUp();
    const nextCount = candiesFed + 1;
    setCandiesFed(nextCount);
    audioSystem.playMunch();

    if (shouldTriggerSugarRush(nextCount)) {
      // 5 candies reached: trigger 3s sugar rush glitchy zoomies
      setReaction('sugar_rush');
      setMouthOpen(0.9);
      setBlushMultiplier(2.2);
      audioSystem.playGiggle();

      if (reactionTimerRef.current) window.clearTimeout(reactionTimerRef.current);
      reactionTimerRef.current = window.setTimeout(() => {
        setReaction('idle');
        setMouthOpen(0);
        setBlushMultiplier(1.0);
        setCandiesFed(0);
      }, 3000);
    } else {
      // Single candy munch
      setReaction('munching');
      setMouthOpen(0.7);

      window.setTimeout(() => setMouthOpen(0.1), 120);
      window.setTimeout(() => setMouthOpen(0.65), 240);
      window.setTimeout(() => {
        setMouthOpen(0);
        setReaction('idle');
      }, 550);
    }

    options.onFeed?.();
  }, [candiesFed, wakeUp, options]);

  return {
    reaction,
    candiesFed,
    blushMultiplier,
    eyesClosed,
    antennasWarm,
    mouthOpen,
    reducedMotion,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    feedCandy,
    wakeUp,
    resetIdleTimers,
  };
}
