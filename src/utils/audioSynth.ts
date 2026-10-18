/**
 * Web Audio API synthesizer for Pinglet's Dial-Up Lullaby & Packet Sound Effects.
 * 100% procedural, zero audio files.
 */

// Pentatonic scale note frequencies (in Hz)
export const PENTATONIC_SCALE: Record<string, number> = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  G4: 392.00,
  A4: 440.00,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  G5: 783.99,
};

// Soft modem lullaby melody pattern [note, duration in seconds, rest in seconds]
export const LULLABY_SEQUENCE: Array<{ note: keyof typeof PENTATONIC_SCALE; dur: number; rest: number }> = [
  { note: 'E4', dur: 0.28, rest: 0.15 },
  { note: 'G4', dur: 0.28, rest: 0.15 },
  { note: 'A4', dur: 0.45, rest: 0.25 },
  { note: 'C5', dur: 0.35, rest: 0.20 },
  { note: 'D5', dur: 0.30, rest: 0.15 },
  { note: 'C5', dur: 0.50, rest: 0.35 },
  { note: 'A4', dur: 0.28, rest: 0.15 },
  { note: 'G4', dur: 0.40, rest: 0.30 },
  { note: 'E4', dur: 0.60, rest: 0.50 },
  // Second phrase
  { note: 'D4', dur: 0.28, rest: 0.15 },
  { note: 'E4', dur: 0.28, rest: 0.15 },
  { note: 'G4', dur: 0.35, rest: 0.20 },
  { note: 'E4', dur: 0.35, rest: 0.20 },
  { note: 'D4', dur: 0.45, rest: 0.30 },
  { note: 'C4', dur: 0.70, rest: 0.80 },
];

export function getMidiFrequency(semitoneOffsetFromA4: number): number {
  return 440 * Math.pow(2, semitoneOffsetFromA4 / 12);
}

class DialUpSoundSystem {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isLullabyPlaying: boolean = false;
  private loopTimer: number | null = null;
  private onTrackNoteChange?: (note: string) => void;

  public init() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.25, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ctx && this.masterGain) {
      const t = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(t);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, t);
      this.masterGain.gain.linearRampToValueAtTime(muted ? 0 : 0.25, t + 0.05);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setOnTrackNoteChange(cb: (note: string) => void) {
    this.onTrackNoteChange = cb;
  }

  public playTone(freq: number, durationSec: number = 0.2, type: OscillatorType = 'triangle') {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Soft envelope to avoid clicks
      const now = this.ctx.currentTime;
      noteGain.gain.setValueAtTime(0.001, now);
      noteGain.gain.linearRampToValueAtTime(0.3, now + 0.03);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

      osc.connect(noteGain);
      noteGain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + durationSec + 0.02);
    } catch {
      // Audio context might be restricted before gesture
    }
  }

  public playPacketCatch(type: 'hello' | 'ping' | 'sparkle' | 'bitrot') {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    try {
      if (type === 'hello') {
        // Cheerful dual bell
        this.playTone(PENTATONIC_SCALE.G4, 0.15, 'sine');
        setTimeout(() => this.playTone(PENTATONIC_SCALE.C5, 0.22, 'triangle'), 60);
      } else if (type === 'ping') {
        // Warm modem chime
        this.playTone(PENTATONIC_SCALE.E4, 0.12, 'sine');
        setTimeout(() => this.playTone(PENTATONIC_SCALE.A4, 0.25, 'sine'), 50);
      } else if (type === 'sparkle') {
        // High sparkle arpeggio
        this.playTone(PENTATONIC_SCALE.C5, 0.1, 'sine');
        setTimeout(() => this.playTone(PENTATONIC_SCALE.E5, 0.12, 'triangle'), 60);
        setTimeout(() => this.playTone(PENTATONIC_SCALE.G5, 0.2, 'sine'), 120);
      } else {
        // Soft bitrot buzz
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.2);
        g.gain.setValueAtTime(0.15, now);
        g.gain.linearRampToValueAtTime(0.001, now + 0.2);
        osc.connect(g);
        g.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.22);
      }
    } catch {}
  }

  public playHandshakeEasterEgg() {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    // Authentic nostalgic gentle dial-up sequence:
    // 1. Dial tone chirp
    // 2. DTMF dual tones
    // 3. Carrier wave handshake chirp
    // 4. Cheerful "You've Got Mail" bell!
    const baseNow = this.ctx.currentTime;

    // DTMF sequence
    const chirps = [697, 770, 852, 941, 1209, 1336, 1477];
    chirps.forEach((f, idx) => {
      setTimeout(() => {
        if (!this.isMuted) this.playTone(f, 0.08, 'sine');
      }, idx * 90);
    });

    // White static chirp simulation
    setTimeout(() => {
      if (this.isMuted || !this.ctx || !this.masterGain) return;
      try {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1800, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(1200, this.ctx.currentTime + 0.4);
        g.gain.setValueAtTime(0.08, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
        osc.connect(g);
        g.connect(this.masterGain);
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 0.42);
      } catch {}
    }, 800);

    // Final cheerful bell
    setTimeout(() => {
      this.playTone(PENTATONIC_SCALE.C5, 0.35, 'triangle');
      setTimeout(() => this.playTone(PENTATONIC_SCALE.G5, 0.6, 'sine'), 120);
    }, 1300);
  }

  public startLullaby() {
    this.init();
    if (this.isLullabyPlaying) return;
    this.isLullabyPlaying = true;
    this.stepLullaby(0);
  }

  public stopLullaby() {
    this.isLullabyPlaying = false;
    if (this.loopTimer) {
      window.clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }
  }

  public getIsLullabyPlaying(): boolean {
    return this.isLullabyPlaying;
  }

  private stepLullaby(index: number) {
    if (!this.isLullabyPlaying) return;

    const item = LULLABY_SEQUENCE[index % LULLABY_SEQUENCE.length];
    const freq = PENTATONIC_SCALE[item.note];

    if (!this.isMuted) {
      this.playTone(freq, item.dur, 'sine');
      if (this.onTrackNoteChange) {
        this.onTrackNoteChange(item.note);
      }
    }

    const nextDelayMs = (item.dur + item.rest) * 1000;
    this.loopTimer = window.setTimeout(() => {
      this.stepLullaby(index + 1);
    }, nextDelayMs);
  }
}

export const audioSystem = new DialUpSoundSystem();
