/**
 * Advanced tap detection system for drum practice
 * Features: Low-latency onset detection, dynamic threshold, beat tracking
 */

export type TapEvent = {
  timestamp: number;
  intensity: number;
  frequency: number;
  confidence: number;
  type: 'kick' | 'snare' | 'hihat' | 'crash' | 'general';
};

export type BeatAnalysis = {
  expectedTime: number;
  actualTime?: number;
  error: number; // ms difference
  accuracy: 'early' | 'late' | 'perfect' | 'missed';
  intensity: number;
};

export class TapDetector {
  private audioContext: AudioContext | null = null;
  private analyzer: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private isActive = false;
  private animationFrame: number | null = null;

  // Detection parameters
  private threshold = 30; // Base threshold for onset detection
  private adaptiveThreshold = 30; // Dynamic threshold that adapts to noise floor
  private noiseFloor = 0;
  private lastDetectionTime = 0;
  private minTimeBetweenTaps = 50; // Minimum ms between detected taps

  // Audio analysis buffers
  private fftSize = 2048;
  private frequencyData: Uint8Array | null = null;
  private timeData: Uint8Array | null = null;
  private previousFrequencyData: Uint8Array | null = null;
  private spectralFlux: Float32Array | null = null;

  // Calibration data
  private calibrationSamples: number[] = [];
  private isCalibrating = false;

  // Event handling
  private onTapDetected?: (tap: TapEvent) => void;
  private tapHistory: TapEvent[] = [];
  private maxHistoryLength = 100;

  constructor() {
    this.initializeAudio = this.initializeAudio.bind(this);
    this.analyze = this.analyze.bind(this);
  }

  async initialize(): Promise<void> {
    try {
      await this.initializeAudio();
      this.setupAnalyzer();
      this.isActive = true;
      this.startAnalysis();
    } catch (error) {
      console.error("Failed to initialize tap detector:", error);
      throw new Error("Could not access microphone for tap detection");
    }
  }

  private async initializeAudio(): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        latency: 0.01, // Request low latency
      },
    });

    const AudioContextClass = window.AudioContext || 
      (window as any).webkitAudioContext as typeof AudioContext;
    
    this.audioContext = new AudioContextClass({
      latencyHint: "interactive",
      sampleRate: 44100,
    });

    // Resume context if suspended
    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }

    this.mediaStream = stream;
  }

  private setupAnalyzer(): void {
    if (!this.audioContext || !this.mediaStream) return;

    this.analyzer = this.audioContext.createAnalyser();
    this.analyzer.fftSize = this.fftSize;
    this.analyzer.smoothingTimeConstant = 0.2; // Faster response for onset detection
    this.analyzer.minDecibels = -90;
    this.analyzer.maxDecibels = -10;

    const source = this.audioContext.createMediaStreamSource(this.mediaStream);
    source.connect(this.analyzer);

    // Initialize data arrays
    this.frequencyData = new Uint8Array(this.analyzer.frequencyBinCount);
    this.timeData = new Uint8Array(this.analyzer.frequencyBinCount);
    this.previousFrequencyData = new Uint8Array(this.analyzer.frequencyBinCount);
    this.spectralFlux = new Float32Array(this.analyzer.frequencyBinCount);
  }

  private startAnalysis(): void {
    this.analyze();
  }

  private analyze(): void {
    if (!this.isActive || !this.analyzer || !this.frequencyData || !this.timeData) {
      return;
    }

    this.analyzer.getByteFrequencyData(this.frequencyData);
    this.analyzer.getByteTimeDomainData(this.timeData);

    // Calculate spectral flux for onset detection
    if (this.previousFrequencyData) {
      this.calculateSpectralFlux();
    }

    // Update noise floor estimation
    this.updateNoiseFloor();

    // Detect onsets
    this.detectOnsets();

    // Store current frequency data for next frame
    if (this.previousFrequencyData) {
      this.previousFrequencyData.set(this.frequencyData);
    }

    this.animationFrame = requestAnimationFrame(this.analyze);
  }

  private calculateSpectralFlux(): void {
    if (!this.frequencyData || !this.previousFrequencyData || !this.spectralFlux) return;

    for (let i = 0; i < this.frequencyData.length; i++) {
      const diff = this.frequencyData[i] - this.previousFrequencyData[i];
      this.spectralFlux[i] = Math.max(0, diff); // Only positive differences (energy increases)
    }
  }

  private updateNoiseFloor(): void {
    if (!this.frequencyData) return;

    // Calculate current energy level
    let energy = 0;
    for (let i = 0; i < this.frequencyData.length; i++) {
      energy += this.frequencyData[i];
    }
    energy /= this.frequencyData.length;

    // Smooth noise floor estimation
    this.noiseFloor = this.noiseFloor * 0.99 + energy * 0.01;

    // Adaptive threshold based on noise floor
    this.adaptiveThreshold = Math.max(this.threshold, this.noiseFloor + 20);
  }

  private detectOnsets(): void {
    if (!this.spectralFlux || !this.frequencyData) return;

    const currentTime = this.audioContext?.currentTime || Date.now() / 1000;
    
    // Calculate spectral flux sum
    let fluxSum = 0;
    for (let i = 0; i < this.spectralFlux.length; i++) {
      fluxSum += this.spectralFlux[i];
    }

    // Check if we have an onset
    if (fluxSum > this.adaptiveThreshold) {
      const timeSinceLastDetection = (currentTime * 1000) - this.lastDetectionTime;
      
      if (timeSinceLastDetection > this.minTimeBetweenTaps) {
        const tap = this.analyzeTap(currentTime * 1000, fluxSum);
        this.lastDetectionTime = currentTime * 1000;
        this.addTapToHistory(tap);
        this.onTapDetected?.(tap);
      }
    }
  }

  private analyzeTap(timestamp: number, intensity: number): TapEvent {
    if (!this.frequencyData) {
      throw new Error("No frequency data available");
    }

    // Analyze frequency characteristics to classify drum type
    const lowEnergy = this.getEnergyInRange(0, 200);      // Kick drum range
    const midEnergy = this.getEnergyInRange(200, 2000);   // Snare range  
    const highEnergy = this.getEnergyInRange(2000, 8000); // Hi-hat range
    const crashEnergy = this.getEnergyInRange(8000, 16000); // Crash range

    let type: TapEvent['type'] = 'general';
    let dominantFreq = 1000;

    // Simple classification based on energy distribution
    if (lowEnergy > midEnergy && lowEnergy > highEnergy) {
      type = 'kick';
      dominantFreq = 60;
    } else if (midEnergy > lowEnergy && midEnergy > highEnergy) {
      type = 'snare';
      dominantFreq = 200;
    } else if (highEnergy > midEnergy && highEnergy > lowEnergy) {
      type = 'hihat';
      dominantFreq = 8000;
    } else if (crashEnergy > highEnergy) {
      type = 'crash';
      dominantFreq = 12000;
    }

    // Calculate confidence based on clarity of frequency distribution
    const totalEnergy = lowEnergy + midEnergy + highEnergy + crashEnergy;
    const maxEnergy = Math.max(lowEnergy, midEnergy, highEnergy, crashEnergy);
    const confidence = totalEnergy > 0 ? maxEnergy / totalEnergy : 0;

    return {
      timestamp,
      intensity: Math.min(100, intensity / this.adaptiveThreshold * 100),
      frequency: dominantFreq,
      confidence,
      type,
    };
  }

  private getEnergyInRange(minFreq: number, maxFreq: number): number {
    if (!this.frequencyData || !this.audioContext) return 0;

    const nyquist = this.audioContext.sampleRate / 2;
    const minBin = Math.floor((minFreq / nyquist) * this.frequencyData.length);
    const maxBin = Math.floor((maxFreq / nyquist) * this.frequencyData.length);

    let energy = 0;
    for (let i = minBin; i < maxBin && i < this.frequencyData.length; i++) {
      energy += this.frequencyData[i];
    }

    return energy / (maxBin - minBin);
  }

  private addTapToHistory(tap: TapEvent): void {
    this.tapHistory.push(tap);
    if (this.tapHistory.length > this.maxHistoryLength) {
      this.tapHistory.shift();
    }
  }

  // Public interface
  onTap(callback: (tap: TapEvent) => void): void {
    this.onTapDetected = callback;
  }

  startCalibration(durationMs: number = 5000): Promise<void> {
    return new Promise((resolve) => {
      this.isCalibrating = true;
      this.calibrationSamples = [];

      setTimeout(() => {
        this.finishCalibration();
        resolve();
      }, durationMs);
    });
  }

  private finishCalibration(): void {
    this.isCalibrating = false;
    
    if (this.calibrationSamples.length > 0) {
      // Calculate appropriate threshold from calibration samples
      this.calibrationSamples.sort((a, b) => a - b);
      const median = this.calibrationSamples[Math.floor(this.calibrationSamples.length / 2)];
      const q75 = this.calibrationSamples[Math.floor(this.calibrationSamples.length * 0.75)];
      
      this.threshold = Math.max(30, median + (q75 - median) * 2);
      this.adaptiveThreshold = this.threshold;
    }
  }

  adjustSensitivity(sensitivity: number): void {
    // sensitivity: 0.1 (less sensitive) to 2.0 (more sensitive)
    this.threshold = this.threshold / sensitivity;
    this.adaptiveThreshold = this.adaptiveThreshold / sensitivity;
  }

  getTapHistory(): TapEvent[] {
    return [...this.tapHistory];
  }

  getLatency(): number {
    return this.audioContext?.outputLatency || 0;
  }

  cleanup(): void {
    this.isActive = false;
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
    }

    if (this.audioContext) {
      this.audioContext.close();
    }

    this.audioContext = null;
    this.analyzer = null;
    this.mediaStream = null;
  }

  isInitialized(): boolean {
    return this.isActive;
  }
}

// Beat tracking and analysis utilities
export class BeatTracker {
  private expectedBeats: number[] = [];
  private detectedBeats: TapEvent[] = [];
  private toleranceMs: number;

  constructor(toleranceMs: number = 50) {
    this.toleranceMs = toleranceMs;
  }

  setExpectedBeats(beats: number[]): void {
    this.expectedBeats = [...beats];
  }

  addDetectedBeat(tap: TapEvent): void {
    this.detectedBeats.push(tap);
  }

  analyzeBeatAccuracy(): BeatAnalysis[] {
    const analysis: BeatAnalysis[] = [];

    this.expectedBeats.forEach(expectedTime => {
      // Find closest detected beat
      let closestBeat: TapEvent | null = null;
      let minTimeDiff = Infinity;

      this.detectedBeats.forEach(beat => {
        const timeDiff = Math.abs(beat.timestamp - expectedTime);
        if (timeDiff < minTimeDiff) {
          minTimeDiff = timeDiff;
          closestBeat = beat;
        }
      });

      let accuracy: BeatAnalysis['accuracy'] = 'missed';
      let error = 0;
      let actualTime: number | undefined;

      if (closestBeat && minTimeDiff <= this.toleranceMs) {
        actualTime = closestBeat.timestamp;
        error = closestBeat.timestamp - expectedTime;

        if (Math.abs(error) <= 10) {
          accuracy = 'perfect';
        } else if (error > 0) {
          accuracy = 'late';
        } else {
          accuracy = 'early';
        }
      } else {
        error = minTimeDiff;
      }

      analysis.push({
        expectedTime,
        actualTime,
        error,
        accuracy,
        intensity: closestBeat?.intensity || 0,
      });
    });

    return analysis;
  }

  getTimingStats(): {
    averageError: number;
    standardDeviation: number;
    accuracyPercentage: number;
    consistencyScore: number;
  } {
    const analysis = this.analyzeBeatAccuracy();
    const accurateBeats = analysis.filter(beat => beat.accuracy !== 'missed');
    
    if (accurateBeats.length === 0) {
      return {
        averageError: 0,
        standardDeviation: 0,
        accuracyPercentage: 0,
        consistencyScore: 0,
      };
    }

    const errors = accurateBeats.map(beat => Math.abs(beat.error));
    const averageError = errors.reduce((sum, error) => sum + error, 0) / errors.length;
    
    const variance = errors.reduce((sum, error) => sum + Math.pow(error - averageError, 2), 0) / errors.length;
    const standardDeviation = Math.sqrt(variance);
    
    const accuracyPercentage = (accurateBeats.length / this.expectedBeats.length) * 100;
    
    // Consistency score: lower standard deviation = higher consistency
    const consistencyScore = Math.max(0, 100 - standardDeviation * 2);

    return {
      averageError,
      standardDeviation,
      accuracyPercentage,
      consistencyScore,
    };
  }

  clear(): void {
    this.expectedBeats = [];
    this.detectedBeats = [];
  }

  setTolerance(ms: number): void {
    this.toleranceMs = ms;
  }
}