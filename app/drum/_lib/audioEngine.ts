/**
 * Production-grade audio engine for drum practice
 * Features: Multiple click sounds, low-latency scheduling, Web Audio API optimization
 */

export type ClickSound = "classic" | "woodblock" | "rim" | "digital" | "cowbell" | "hihat";
export type Subdivision = "quarter" | "eighth" | "sixteenth" | "triplet";
export type AccentPattern = number[]; // Array of volumes (0-1) per beat in the pattern, e.g. [1, 0.5, 0.7, 0.5] for 4/4

export const ACCENT_PATTERNS: Record<string, { name: string; pattern: AccentPattern }> = {
  none: { name: "None (flat)", pattern: [1] },
  "4-4-standard": { name: "4/4 Standard", pattern: [1, 0.5, 0.7, 0.5] },
  "3-4-waltz": { name: "3/4 Waltz", pattern: [1, 0.5, 0.5] },
  "6-8-compound": { name: "6/8 Compound", pattern: [1, 0.4, 0.4, 0.7, 0.4, 0.4] },
  "2-4-march": { name: "2/4 March", pattern: [1, 0.5] },
  "5-4-odd": { name: "5/4 (3+2)", pattern: [1, 0.4, 0.4, 0.8, 0.4] },
  "7-8-odd": { name: "7/8 (3+2+2)", pattern: [1, 0.4, 0.4, 0.8, 0.4, 0.8, 0.4] },
};

export type AudioConfig = {
  clickSound: ClickSound;
  volume: number; // 0.0 to 1.0
  lookAhead: number; // milliseconds
  scheduleAheadTime: number; // seconds
  subdivision: Subdivision;
  accentPattern?: AccentPattern;
};

export class DrumAudioEngine {
  private audioContext: AudioContext | null = null;
  private isPlaying = false;
  private startTime = 0;
  private currentBeat = 0;
  private nextBeatTime = 0;
  private timerID: number | null = null;
  private config: AudioConfig;
  
  // Click sound generators
  private clickGenerators: Record<ClickSound, (ctx: AudioContext, time: number, config: AudioConfig) => void>;

  constructor(config: Partial<AudioConfig> = {}) {
    this.config = {
      clickSound: "classic",
      volume: 0.7,
      lookAhead: 25.0, // 25ms lookahead
      scheduleAheadTime: 0.1, // 100ms scheduling window
      subdivision: "quarter",
      ...config
    };

    this.clickGenerators = {
      classic: this.generateClassicClick,
      woodblock: this.generateWoodblockClick,
      rim: this.generateRimClick,  
      digital: this.generateDigitalClick,
      cowbell: this.generateCowbellClick,
      hihat: this.generateHihatClick,
    };
  }

  async initialize(): Promise<void> {
    try {
      // Enhanced audio context initialization
      const AudioContextClass = window.AudioContext || 
        (window as any).webkitAudioContext as typeof AudioContext;
      
      if (!AudioContextClass) {
        throw new Error("AudioContext not supported");
      }

      this.audioContext = new AudioContextClass({
        latencyHint: "interactive",
        sampleRate: 44100
      });

      // Resume context if suspended
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }
    } catch (error) {
      console.error("Failed to initialize audio engine:", error);
      throw error;
    }
  }

  start(bpm: number): void {
    if (!this.audioContext) {
      throw new Error("Audio engine not initialized");
    }

    this.isPlaying = true;
    this.currentBeat = 0;
    this.startTime = this.audioContext.currentTime;
    this.nextBeatTime = this.startTime;
    this.schedule(bpm);
  }

  stop(): void {
    this.isPlaying = false;
    if (this.timerID) {
      clearTimeout(this.timerID);
      this.timerID = null;
    }
  }

  updateConfig(newConfig: Partial<AudioConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  private getSubdivisionMultiplier(): number {
    switch (this.config.subdivision) {
      case "eighth": return 2;
      case "sixteenth": return 4;
      case "triplet": return 3;
      default: return 1;
    }
  }

  private schedule(bpm: number): void {
    if (!this.audioContext || !this.isPlaying) return;

    const subdivMult = this.getSubdivisionMultiplier();
    const secondsPerSubdiv = 60.0 / (bpm * subdivMult);
    const lookAheadTime = this.config.lookAhead / 1000;

    // Schedule beats within the lookahead window
    while (this.nextBeatTime < this.audioContext.currentTime + this.config.scheduleAheadTime) {
      const isDownbeat = this.currentBeat % subdivMult === 0;
      const quarterBeatIdx = Math.floor(this.currentBeat / subdivMult);
      this.scheduleClick(this.nextBeatTime, isDownbeat, quarterBeatIdx);
      this.nextBeatTime += secondsPerSubdiv;
      this.currentBeat++;
    }

    // Continue scheduling
    this.timerID = window.setTimeout(() => this.schedule(bpm), lookAheadTime);
  }

  private scheduleClick(time: number, isDownbeat: boolean = true, quarterBeatIdx: number = 0): void {
    if (!this.audioContext) return;
    
    const generator = this.clickGenerators[this.config.clickSound];
    const accentPattern = this.config.accentPattern;

    let volumeScale = 1;
    if (!isDownbeat) {
      volumeScale = 0.45; // Subdivision clicks are softer
    } else if (accentPattern && accentPattern.length > 0) {
      volumeScale = accentPattern[quarterBeatIdx % accentPattern.length];
    }

    const adjustedConfig = { ...this.config, volume: this.config.volume * volumeScale };
    generator.call(this, this.audioContext, time, adjustedConfig);
  }

  // Click sound generators
  private generateClassicClick(ctx: AudioContext, time: number, config: AudioConfig): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.frequency.value = 1200;
    osc.type = "square";
    
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.exponentialRampToValueAtTime(config.volume, time + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(time);
    osc.stop(time + 0.06);
  }

  private generateWoodblockClick(ctx: AudioContext, time: number, config: AudioConfig): void {
    // Simulate woodblock with filtered noise burst
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate noise burst
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
    }
    
    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    
    source.buffer = buffer;
    filter.type = "bandpass";
    filter.frequency.value = 800;
    filter.Q.value = 10;
    
    gain.gain.setValueAtTime(config.volume * 0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
    
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    source.start(time);
  }

  private generateRimClick(ctx: AudioContext, time: number, config: AudioConfig): void {
    // Sharp, percussive click
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc1.frequency.value = 2400;
    osc1.type = "square";
    osc2.frequency.value = 800;
    osc2.type = "triangle";
    
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.exponentialRampToValueAtTime(config.volume * 0.6, time + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.02);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    
    osc1.start(time);
    osc1.stop(time + 0.025);
    osc2.start(time);
    osc2.stop(time + 0.025);
  }

  private generateDigitalClick(ctx: AudioContext, time: number, config: AudioConfig): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.frequency.value = 1000;
    osc.type = "sine";
    
    gain.gain.setValueAtTime(config.volume, time);
    gain.gain.setValueAtTime(0, time + 0.01);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(time);
    osc.stop(time + 0.015);
  }

  private generateCowbellClick(ctx: AudioContext, time: number, config: AudioConfig): void {
    // Metallic ring sound
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc1.frequency.value = 800;
    osc1.type = "square";
    osc2.frequency.value = 540;
    osc2.type = "sawtooth";
    
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.exponentialRampToValueAtTime(config.volume * 0.7, time + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    
    osc1.start(time);
    osc1.stop(time + 0.25);
    osc2.start(time);
    osc2.stop(time + 0.25);
  }

  private generateHihatClick(ctx: AudioContext, time: number, config: AudioConfig): void {
    // High-frequency noise burst
    const bufferSize = ctx.sampleRate * 0.05;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate high-freq noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    
    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    
    source.buffer = buffer;
    filter.type = "highpass";
    filter.frequency.value = 8000;
    
    gain.gain.setValueAtTime(config.volume * 0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
    
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    source.start(time);
  }

  // Utility methods
  getCurrentBeat(): number {
    return this.currentBeat;
  }

  isActive(): boolean {
    return this.isPlaying;
  }

  getLatency(): number {
    return this.audioContext?.outputLatency || 0;
  }

  cleanup(): void {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// Tempo trainer utility
export class TempoTrainer {
  private currentBpm: number;
  private targetBpm: number;
  private stepSize: number;
  private stepInterval: number; // seconds
  private onBpmChange?: (bpm: number) => void;
  private timer: number | null = null;

  constructor(startBpm: number, targetBpm: number, stepSize = 5, stepInterval = 30) {
    this.currentBpm = startBpm;
    this.targetBpm = targetBpm;
    this.stepSize = stepSize;
    this.stepInterval = stepInterval;
  }

  start(onBpmChange: (bpm: number) => void): void {
    this.onBpmChange = onBpmChange;
    this.scheduleNextStep();
  }

  stop(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private scheduleNextStep(): void {
    if (this.currentBpm >= this.targetBpm) {
      return; // Target reached
    }

    this.timer = window.setTimeout(() => {
      this.currentBpm = Math.min(this.currentBpm + this.stepSize, this.targetBpm);
      this.onBpmChange?.(this.currentBpm);
      
      if (this.currentBpm < this.targetBpm) {
        this.scheduleNextStep();
      }
    }, this.stepInterval * 1000);
  }

  getCurrentBpm(): number {
    return this.currentBpm;
  }

  getProgress(): number {
    return this.currentBpm / this.targetBpm;
  }
}