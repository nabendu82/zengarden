/**
 * Procedural Web Audio API sound engine for Zen Garden.
 * ZERO external audio files — 100% synthesized in real-time.
 */

class ZenAudioEngine {
  private ctx: AudioContext | null = null;
  private windGain: GainNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private windLfo: OscillatorNode | null = null;
  private isWindPlaying = false;
  private isMuted = false;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.windGain && this.ctx) {
      this.windGain.gain.setTargetAtTime(muted ? 0 : 0.12, this.ctx.currentTime, 0.2);
    }
  }

  public startWind() {
    const ctx = this.getContext();
    if (!ctx || this.isWindPlaying) return;

    try {
      // Create 5-second noise buffer for ambient wind
      const bufferSize = ctx.sampleRate * 5;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Lowpass filter for deep wind sound
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 280;
      filter.Q.value = 3.0;

      // LFO to slowly swell wind filter cutoff (gusts)
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.15; // Slow breath
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 140;

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();

      const gain = ctx.createGain();
      gain.gain.value = this.isMuted ? 0 : 0.12;

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();

      this.windGain = gain;
      this.windFilter = filter;
      this.windLfo = lfo;
      this.isWindPlaying = true;
    } catch (e) {
      console.warn("Audio Context init error:", e);
    }
  }

  public stopWind() {
    if (this.windGain && this.ctx) {
      this.windGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3);
    }
    this.isWindPlaying = false;
  }

  /**
   * Deep, resonant bronze temple gong / singing bowl sound.
   */
  public playGong() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const duration = 5.0;

    // Harmonically rich frequencies for bronze bell resonance
    const freqs = [108, 216, 324, 485, 650];
    const gains = [0.45, 0.3, 0.2, 0.12, 0.05];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = idx === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, now);

      // Pitch pitch-drop / warm wobble
      osc.frequency.exponentialRampToValueAtTime(freq * 0.992, now + duration);

      const maxGain = gains[idx] || 0.1;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(maxGain, now + 0.03); // Quick strike attack
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration); // Long ring decay

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.1);
    });
  }

  /**
   * Crisp wooden bell / chime sound.
   */
  public playBell() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(784, now); // G5 note
    osc.frequency.exponentialRampToValueAtTime(780, now + 1.2);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 1.3);
  }

  /**
   * Soft gravel step sound.
   */
  public playFootstep() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.08;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1200 + Math.random() * 400, now);
    filter.Q.setValueAtTime(2.0, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
  }
}

export const zenAudio = new ZenAudioEngine();
