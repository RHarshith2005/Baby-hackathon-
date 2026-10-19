/**
 * Synthesized Night Sounds (Crickets & Wind) for Pinglet's Sleepy / Night mode.
 * 100% procedural Web Audio API, zero audio files. Mute-aware.
 */

class NightSoundsManager {
  private ctx: AudioContext | null = null;
  private noiseNode: AudioNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;
  private cricketOsc: OscillatorNode | null = null;
  private cricketGain: GainNode | null = null;
  private cricketLfo: OscillatorNode | null = null;
  private isEnabled: boolean = false;
  private isMuted: boolean = false;

  public setEnabled(enabled: boolean, isNight: boolean, muted: boolean) {
    this.isEnabled = enabled;
    this.isMuted = muted;

    if (enabled && isNight && !muted) {
      this.start();
    } else {
      this.stop();
    }
  }

  public setMuted(muted: boolean, isNight: boolean) {
    this.isMuted = muted;
    if (this.isEnabled && isNight && !muted) {
      this.start();
    } else {
      this.stop();
    }
  }

  private start() {
    if (typeof window === 'undefined') return;
    if (this.ctx && this.ctx.state === 'running') return;

    try {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.ctx) {
        this.ctx = new AudioCtxClass();
      }

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const now = this.ctx.currentTime;

      // Master Gain for ambient night sounds (very soft)
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0, now);
      this.gainNode.gain.linearRampToValueAtTime(0.045, now + 1.5);
      this.gainNode.connect(this.ctx.destination);

      // Wind (filtered white noise)
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = 'bandpass';
      this.filterNode.frequency.value = 320;
      this.filterNode.Q.value = 3.0;

      whiteNoise.connect(this.filterNode);
      this.filterNode.connect(this.gainNode);
      whiteNoise.start(now);
      this.noiseNode = whiteNoise;

      // Crickets (pulsing high sine wave)
      this.cricketOsc = this.ctx.createOscillator();
      this.cricketOsc.type = 'sine';
      this.cricketOsc.frequency.value = 4200;

      this.cricketGain = this.ctx.createGain();
      this.cricketGain.gain.value = 0.015;

      this.cricketLfo = this.ctx.createOscillator();
      this.cricketLfo.type = 'sine';
      this.cricketLfo.frequency.value = 12; // Chirping pulse rate

      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 0.012;

      this.cricketLfo.connect(lfoGain);
      lfoGain.connect(this.cricketGain.gain);

      this.cricketOsc.connect(this.cricketGain);
      this.cricketGain.connect(this.gainNode);

      this.cricketOsc.start(now);
      this.cricketLfo.start(now);
    } catch {}
  }

  public stop() {
    if (!this.ctx) return;
    try {
      if (this.gainNode) {
        const now = this.ctx.currentTime;
        this.gainNode.gain.linearRampToValueAtTime(0, now + 0.4);
      }
      window.setTimeout(() => {
        if (this.noiseNode) {
          try {
            (this.noiseNode as AudioBufferSourceNode).stop();
            this.noiseNode.disconnect();
          } catch {}
          this.noiseNode = null;
        }
        if (this.cricketOsc) {
          try {
            this.cricketOsc.stop();
            this.cricketOsc.disconnect();
          } catch {}
          this.cricketOsc = null;
        }
        if (this.cricketLfo) {
          try {
            this.cricketLfo.stop();
            this.cricketLfo.disconnect();
          } catch {}
          this.cricketLfo = null;
        }
      }, 450);
    } catch {}
  }
}

export const nightSoundsService = new NightSoundsManager();
