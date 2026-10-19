/**
 * Voice Echo & Audio Processing Service for Pinglet's "Hello Relay"
 *
 * Captures raw PCM from microphone without MediaRecorder/decodeAudioData,
 * performs voice activity detection (VAD), peak normalization, and
 * plays back squeaky pitch-shifted echo with vibrato and real-time lip sync.
 *
 * Privacy: 100% in-browser, no audio leaves device, never uploaded or stored.
 */

export type VoiceEchoState = 'idle' | 'listening' | 'packing' | 'speaking' | 'error';

export interface VoiceSticker {
  id: string;
  timestamp: number;
  durationSec: number;
  buffer: Float32Array;
  sampleRate: number;
  label: string;
}

export interface VoiceEchoOptions {
  onStateChange?: (state: VoiceEchoState) => void;
  onLiveLevel?: (level: number) => void;
  onMouthLevel?: (level: number) => void;
  onEchoComplete?: (sticker: VoiceSticker) => void;
  onError?: (err: Error | string) => void;
  playbackRate?: number;
  keepChatting?: boolean;
  isMuted?: boolean;
}

/**
 * PURE HELPER: Compute Root Mean Square (RMS) of audio sample buffer.
 */
export function computeRms(buffer: Float32Array): number {
  if (!buffer || buffer.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    const val = buffer[i];
    sum += val * val;
  }
  return Math.sqrt(sum / buffer.length);
}

/**
 * PURE HELPER: Calibrate VAD threshold based on initial ambient noise readings.
 * Clamped between 0.015 (very quiet room) and 0.35 (noisy environment).
 */
export function calibrateThreshold(ambientRmsValues: number[], multiplier: number = 2.4): number {
  if (!ambientRmsValues || ambientRmsValues.length === 0) {
    return 0.025;
  }
  let sum = 0;
  let max = 0;
  for (const v of ambientRmsValues) {
    sum += v;
    if (v > max) max = v;
  }
  const avg = sum / ambientRmsValues.length;
  // Blend between peak ambient and average ambient
  const baseNoise = avg * 0.4 + max * 0.6;
  const calibrated = baseNoise * multiplier;
  return Math.max(0.015, Math.min(0.35, calibrated));
}

/**
 * PURE HELPER: Determine if speech should start being recorded.
 * Requires RMS to stay above threshold for consecutive duration (default 80ms).
 */
export function shouldStartRecording(
  rms: number,
  threshold: number,
  consecutiveAboveMs: number,
  requiredDurationMs: number = 80
): boolean {
  return rms >= threshold && consecutiveAboveMs >= requiredDurationMs;
}

/**
 * PURE HELPER: Determine if active speech recording should stop.
 * Stops after 600ms of silence (if minimum 250ms recorded) OR 6s maximum duration.
 */
export function shouldStopRecording(
  rms: number,
  threshold: number,
  silenceDurationMs: number,
  maxRecordingDurationMs: number = 6000,
  totalRecordingDurationMs: number = 0
): boolean {
  if (totalRecordingDurationMs >= maxRecordingDurationMs) {
    return true;
  }
  if (totalRecordingDurationMs >= 250 && silenceDurationMs >= 600) {
    return true;
  }
  return false;
}

/**
 * PURE HELPER: Clamp playback rate to squeaky cute range [1.4, 2.0].
 */
export function clampPlaybackRate(rate: number): number {
  if (Number.isNaN(rate) || !Number.isFinite(rate)) return 1.7;
  return Math.max(1.4, Math.min(2.0, rate));
}

/**
 * PURE HELPER: Normalize peak audio amplitude with target headroom and max safe gain.
 */
export function normalizePeak(buffer: Float32Array, targetPeak: number = 0.95): Float32Array {
  if (!buffer || buffer.length === 0) return new Float32Array(0);
  let max = 0;
  for (let i = 0; i < buffer.length; i++) {
    const abs = Math.abs(buffer[i]);
    if (abs > max) max = abs;
  }

  const out = new Float32Array(buffer.length);
  if (max < 0.0001) {
    // Pure silence, return as-is
    out.set(buffer);
    return out;
  }

  const gain = Math.min(10, targetPeak / max);
  for (let i = 0; i < buffer.length; i++) {
    out[i] = Math.max(-1, Math.min(1, buffer[i] * gain));
  }
  return out;
}

/**
 * VoiceEchoManager: handles microphone capture, VAD state machine,
 * AudioWorklet/ScriptProcessor PCM ingestion, squeaky pitch-shifted playback,
 * and live mouth-sync analysis.
 */
export class VoiceEchoManager {
  private ctx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private scriptNode: ScriptProcessorNode | null = null;
  private isRunning: boolean = false;
  private isCapturingMic: boolean = false;
  private currentState: VoiceEchoState = 'idle';
  private options: VoiceEchoOptions = {};

  // VAD state
  private ambientRmsList: number[] = [];
  private isCalibrated: boolean = false;
  private calibrationStartTime: number = 0;
  private threshold: number = 0.025;
  private isRecordingVoice: boolean = false;
  private consecutiveAboveMs: number = 0;
  private silenceDurationMs: number = 0;
  private recordingStartTime: number = 0;
  private recordedChunks: Float32Array[] = [];
  private totalRecordedSamples: number = 0;

  // Session echoes (max 5 kept in memory for this session, never persisted)
  private sessionEchoes: VoiceSticker[] = [];
  private activeSourceNode: AudioBufferSourceNode | null = null;
  private activeAnalyserNode: AnalyserNode | null = null;
  private mouthAnimRaf: number | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }

  private handleVisibilityChange = () => {
    if (document.hidden && this.isRunning) {
      this.pauseCapture();
    }
  };

  public getSessionEchoes(): VoiceSticker[] {
    return [...this.sessionEchoes];
  }

  public getState(): VoiceEchoState {
    return this.currentState;
  }

  private setState(state: VoiceEchoState) {
    this.currentState = state;
    this.options.onStateChange?.(state);
  }

  /**
   * Request microphone permission and start listening loop.
   */
  public async start(options: VoiceEchoOptions = {}): Promise<void> {
    this.options = { ...this.options, ...options };
    this.stopPlayback();

    try {
      if (!this.ctx || this.ctx.state === 'closed') {
        const AudioCtxClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtxClass();
      }

      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      if (!this.stream) {
        this.stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      }

      this.isRunning = true;
      this.startMicCapture();
    } catch (err: unknown) {
      this.setState('error');
      const error = err instanceof Error ? err : new Error(String(err));
      this.options.onError?.(error);
      this.stop();
      throw error;
    }
  }

  private async startMicCapture() {
    if (!this.ctx || !this.stream || !this.isRunning) return;

    this.isCapturingMic = true;
    this.isCalibrated = false;
    this.calibrationStartTime = performance.now();
    this.ambientRmsList = [];
    this.isRecordingVoice = false;
    this.consecutiveAboveMs = 0;
    this.silenceDurationMs = 0;
    this.recordedChunks = [];
    this.totalRecordedSamples = 0;
    this.setState('listening');

    this.sourceNode = this.ctx.createMediaStreamSource(this.stream);

    // Try AudioWorklet first, falling back to ScriptProcessorNode
    let workletSuccess = false;
    if (this.ctx.audioWorklet) {
      try {
        const workletCode = `
          class VoiceRecorderProcessor extends AudioWorkletProcessor {
            process(inputs) {
              const input = inputs[0];
              if (input && input.length > 0 && input[0]) {
                this.port.postMessage(input[0]);
              }
              return true;
            }
          }
          registerProcessor('voice-recorder-processor', VoiceRecorderProcessor);
        `;
        const blob = new Blob([workletCode], { type: 'application/javascript' });
        const blobUrl = URL.createObjectURL(blob);
        await this.ctx.audioWorklet.addModule(blobUrl);
        URL.revokeObjectURL(blobUrl);

        this.workletNode = new AudioWorkletNode(this.ctx, 'voice-recorder-processor');
        this.workletNode.port.onmessage = (event) => {
          this.handleIncomingSamples(event.data);
        };
        this.sourceNode.connect(this.workletNode);
        workletSuccess = true;
      } catch {
        workletSuccess = false;
      }
    }

    if (!workletSuccess) {
      // Fallback: ScriptProcessorNode (iOS/Safari older engines)
      this.scriptNode = this.ctx.createScriptProcessor(2048, 1, 1);
      this.scriptNode.onaudioprocess = (e) => {
        const samples = e.inputBuffer.getChannelData(0);
        this.handleIncomingSamples(samples);
      };
      this.sourceNode.connect(this.scriptNode);
      // ScriptProcessor needs to be connected to destination in some browsers to process audio
      const silenceGain = this.ctx.createGain();
      silenceGain.gain.value = 0;
      this.scriptNode.connect(silenceGain);
      silenceGain.connect(this.ctx.destination);
    }
  }

  private pauseCapture() {
    this.isCapturingMic = false;
    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect();
      } catch {}
      this.sourceNode = null;
    }
    if (this.workletNode) {
      try {
        this.workletNode.disconnect();
      } catch {}
      this.workletNode = null;
    }
    if (this.scriptNode) {
      try {
        this.scriptNode.disconnect();
      } catch {}
      this.scriptNode = null;
    }
  }

  private handleIncomingSamples(chunk: Float32Array) {
    if (!this.isRunning || !this.isCapturingMic) return;

    const rms = computeRms(chunk);
    const chunkDurationMs = (chunk.length / (this.ctx?.sampleRate || 44100)) * 1000;
    const now = performance.now();

    // Live level visualizer (smoothed 0..1)
    const normalizedLevel = Math.min(1, rms * 8);
    this.options.onLiveLevel?.(normalizedLevel);

    // 1. Initial 400ms Calibration Phase
    if (!this.isCalibrated) {
      this.ambientRmsList.push(rms);
      if (now - this.calibrationStartTime >= 400) {
        this.isCalibrated = true;
        this.threshold = calibrateThreshold(this.ambientRmsList, 2.4);
      }
      return;
    }

    // 2. Active Listening & VAD
    if (!this.isRecordingVoice) {
      if (rms >= this.threshold) {
        this.consecutiveAboveMs += chunkDurationMs;
        if (shouldStartRecording(rms, this.threshold, this.consecutiveAboveMs, 80)) {
          this.isRecordingVoice = true;
          this.recordingStartTime = now;
          this.silenceDurationMs = 0;
          this.recordedChunks = [new Float32Array(chunk)];
          this.totalRecordedSamples = chunk.length;
        }
      } else {
        this.consecutiveAboveMs = 0;
      }
    } else {
      // 3. Recording Voice
      this.recordedChunks.push(new Float32Array(chunk));
      this.totalRecordedSamples += chunk.length;
      const totalDurationMs = now - this.recordingStartTime;

      if (rms < this.threshold) {
        this.silenceDurationMs += chunkDurationMs;
      } else {
        this.silenceDurationMs = 0;
      }

      if (
        shouldStopRecording(
          rms,
          this.threshold,
          this.silenceDurationMs,
          6000,
          totalDurationMs
        )
      ) {
        this.finishRecording(totalDurationMs);
      }
    }
  }

  /**
   * Manually stop listening or complete current recording (e.g. for hold-to-talk).
   */
  public finishRecording(totalDurationMs: number = 0) {
    if (!this.isRecordingVoice) {
      return;
    }

    this.isRecordingVoice = false;

    // Discard clips under 250ms
    if (totalDurationMs < 250 && this.totalRecordedSamples < 11025) {
      this.recordedChunks = [];
      this.totalRecordedSamples = 0;
      this.setState('listening');
      return;
    }

    // Stitch chunks together
    const merged = new Float32Array(this.totalRecordedSamples);
    let offset = 0;
    for (const ch of this.recordedChunks) {
      merged.set(ch, offset);
      offset += ch.length;
    }
    this.recordedChunks = [];

    // Normalize peak
    const normalized = normalizePeak(merged, 0.95);
    const sampleRate = this.ctx?.sampleRate || 44100;
    const durationSec = normalized.length / sampleRate;

    // Create session sticker
    const sticker: VoiceSticker = {
      id: `echo-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now(),
      durationSec,
      buffer: normalized,
      sampleRate,
      label: `Echo #${this.sessionEchoes.length + 1} (${durationSec.toFixed(1)}s)`,
    };

    // Keep up to 5 session echoes
    this.sessionEchoes = [sticker, ...this.sessionEchoes].slice(0, 5);

    // Transition: listening -> packing -> speaking
    this.setState('packing');
    this.pauseCapture(); // Pause mic capture to prevent acoustic feedback loop!

    window.setTimeout(() => {
      this.playSticker(sticker);
    }, 450);
  }

  /**
   * Plays a recorded audio sticker with squeaky pitch-shift, vibrato, filter,
   * and real-time lip-sync mouth level.
   */
  public playSticker(sticker: VoiceSticker, customRate?: number) {
    if (!this.ctx || this.ctx.state === 'closed') {
      return;
    }

    this.stopPlayback();

    const rate = clampPlaybackRate(customRate ?? this.options.playbackRate ?? 1.7);
    const audioBuffer = this.ctx.createBuffer(1, sticker.buffer.length, sticker.sampleRate);
    audioBuffer.copyToChannel(new Float32Array(sticker.buffer), 0);

    const source = this.ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.playbackRate.value = rate;

    // Biquad lowpass filter for silky softbox character sound
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 4600;
    filter.Q.value = 1.0;

    // Vibrato LFO for playful cute wobble
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 5.8;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.035; // gentle pitch modulation
    lfo.connect(lfoGain);
    lfoGain.connect(source.playbackRate);

    // Fade in / out GainNode (10ms ramp)
    const fadeGain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    const duration = audioBuffer.duration / rate;

    fadeGain.gain.setValueAtTime(0, now);
    fadeGain.gain.linearRampToValueAtTime(this.options.isMuted ? 0 : 0.85, now + 0.012);
    fadeGain.gain.setValueAtTime(this.options.isMuted ? 0 : 0.85, Math.max(now + 0.012, now + duration - 0.012));
    fadeGain.gain.linearRampToValueAtTime(0, now + duration);

    // AnalyserNode for lip-sync mouthLevel
    const analyser = this.ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.65;

    // Connect graph: source -> filter -> fadeGain -> analyser -> destination
    source.connect(filter);
    filter.connect(fadeGain);
    fadeGain.connect(analyser);
    analyser.connect(this.ctx.destination);

    this.activeSourceNode = source;
    this.activeAnalyserNode = analyser;
    this.setState('speaking');

    try {
      lfo.start(now);
      source.start(now);
    } catch {}

    // Mouth animation loop
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const updateMouth = () => {
      if (!this.activeAnalyserNode || this.currentState !== 'speaking') {
        this.options.onMouthLevel?.(0);
        return;
      }
      this.activeAnalyserNode.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length;
      const mouth = Math.min(1, Math.max(0, avg / 128));
      this.options.onMouthLevel?.(mouth);

      this.mouthAnimRaf = requestAnimationFrame(updateMouth);
    };
    this.mouthAnimRaf = requestAnimationFrame(updateMouth);

    source.onended = () => {
      if (this.mouthAnimRaf) {
        cancelAnimationFrame(this.mouthAnimRaf);
        this.mouthAnimRaf = null;
      }
      this.options.onMouthLevel?.(0);
      try {
        lfo.stop();
        lfo.disconnect();
      } catch {}

      this.options.onEchoComplete?.(sticker);

      if (this.options.keepChatting && this.isRunning) {
        window.setTimeout(() => {
          if (this.isRunning) {
            this.startMicCapture();
          }
        }, 500);
      } else {
        this.setState('idle');
      }
    };
  }

  public stopPlayback() {
    if (this.mouthAnimRaf) {
      cancelAnimationFrame(this.mouthAnimRaf);
      this.mouthAnimRaf = null;
    }
    this.options.onMouthLevel?.(0);
    if (this.activeSourceNode) {
      try {
        this.activeSourceNode.stop();
        this.activeSourceNode.disconnect();
      } catch {}
      this.activeSourceNode = null;
    }
    this.activeAnalyserNode = null;
  }

  public setMuted(muted: boolean) {
    this.options.isMuted = muted;
  }

  public setKeepChatting(enabled: boolean) {
    this.options.keepChatting = enabled;
  }

  public stop() {
    this.isRunning = false;
    this.stopPlayback();
    this.pauseCapture();

    if (this.stream) {
      try {
        this.stream.getTracks().forEach((track) => track.stop());
      } catch {}
      this.stream = null;
    }

    if (this.ctx && this.ctx.state !== 'closed') {
      try {
        this.ctx.close();
      } catch {}
      this.ctx = null;
    }

    this.setState('idle');
    this.options.onLiveLevel?.(0);
    this.options.onMouthLevel?.(0);
  }

  public destroy() {
    if (typeof window !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
    this.stop();
  }
}

export const voiceEchoService = new VoiceEchoManager();
