"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { DrumAudioEngine, TempoTrainer, ClickSound, AudioConfig, Subdivision } from "../_lib/audioEngine";
import GapDrillControls, { GapPreset, GapSettings, GAP_PRESETS } from "./GapDrillControls";

type EnhancedMetronomeProps = {
  bpm: number;
  onBpmChange?: (bpm: number) => void;
  showGapControls?: boolean;
  showTempoTrainer?: boolean;
  showSoundOptions?: boolean;
  compact?: boolean;
  showVisualPulse?: boolean;
  initialConfig?: Partial<AudioConfig>;
};

type BeatState = {
  beat: number;
  inGap: boolean;
  cyclePosition: number;
  totalCycle: number;
  isPulse: boolean;
};

export default function EnhancedMetronome({
  bpm,
  onBpmChange,
  showGapControls = false,
  showTempoTrainer = false,
  showSoundOptions = true,
  compact = false,
  showVisualPulse = false,
  initialConfig,
}: EnhancedMetronomeProps) {
  const [metroOn, setMetroOn] = useState(false);
  const [gapEnabled, setGapEnabled] = useState(false);
  const [gapPreset, setGapPreset] = useState<GapPreset>("medium");
  const [currentBpm, setCurrentBpm] = useState(bpm);
  const [tempoTrainerActive, setTempoTrainerActive] = useState(false);
  const [targetBpm, setTargetBpm] = useState(bpm + 20);
  const [subdivision, setSubdivision] = useState<Subdivision>("quarter");
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const [audioConfig, setAudioConfig] = useState<AudioConfig>({
    clickSound: "classic",
    volume: 0.7,
    lookAhead: 25.0,
    scheduleAheadTime: 0.1,
    subdivision: "quarter",
    ...initialConfig,
  });
  const [gapSettings, setGapSettings] = useState<GapSettings>({
    beatsOn: GAP_PRESETS.medium.beatsOn,
    beatsOff: GAP_PRESETS.medium.beatsOff,
    offBeatMode: false,
  });
  const [beatState, setBeatState] = useState<BeatState>({
    beat: 0,
    inGap: false,
    cyclePosition: 0,
    totalCycle: gapSettings.beatsOn + gapSettings.beatsOff,
    isPulse: false,
  });
  const [engineReady, setEngineReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioEngineRef = useRef<DrumAudioEngine | null>(null);
  const tempoTrainerRef = useRef<TempoTrainer | null>(null);
  const beatCounterRef = useRef<number>(0);
  const animationRef = useRef<number | null>(null);

  // Initialize audio engine
  useEffect(() => {
    const initEngine = async () => {
      try {
        audioEngineRef.current = new DrumAudioEngine(audioConfig);
        await audioEngineRef.current.initialize();
        setEngineReady(true);
        setError(null);
      } catch (err) {
        setError("Failed to initialize audio engine. Please check your browser permissions.");
        console.error("Audio engine init failed:", err);
      }
    };

    initEngine();

    return () => {
      if (audioEngineRef.current) {
        audioEngineRef.current.cleanup();
      }
      if (tempoTrainerRef.current) {
        tempoTrainerRef.current.stop();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Update audio config when settings change
  useEffect(() => {
    if (audioEngineRef.current) {
      audioEngineRef.current.updateConfig(audioConfig);
    }
  }, [audioConfig]);

  // Handle BPM sync with parent component
  useEffect(() => {
    if (!tempoTrainerActive && currentBpm !== bpm) {
      setCurrentBpm(bpm);
    }
  }, [bpm, tempoTrainerActive, currentBpm]);

  // Beat visualization update loop
  const updateBeatVisualization = useCallback(() => {
    if (!audioEngineRef.current || !metroOn) {
      animationRef.current = requestAnimationFrame(updateBeatVisualization);
      return;
    }

    const currentBeat = audioEngineRef.current.getCurrentBeat();
    if (gapEnabled) {
      const totalCycle = gapSettings.beatsOn + gapSettings.beatsOff;
      const cyclePosition = currentBeat % totalCycle;
      const inGap = cyclePosition >= gapSettings.beatsOn;
      
      setBeatState({
        beat: (cyclePosition % (inGap ? gapSettings.beatsOff : gapSettings.beatsOn)) + 1,
        inGap,
        cyclePosition: cyclePosition + 1,
        totalCycle,
        isPulse: !inGap && (currentBeat % 4 === 0), // Flash on strong beats
      });
    } else {
      setBeatState({
        beat: (currentBeat % 4) + 1,
        inGap: false,
        cyclePosition: currentBeat + 1,
        totalCycle: 4,
        isPulse: currentBeat % 4 === 0,
      });
    }

    animationRef.current = requestAnimationFrame(updateBeatVisualization);
  }, [metroOn, gapEnabled, gapSettings]);

  useEffect(() => {
    if (metroOn) {
      animationRef.current = requestAnimationFrame(updateBeatVisualization);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setBeatState({
        beat: 0,
        inGap: false,
        cyclePosition: 0,
        totalCycle: gapSettings.beatsOn + gapSettings.beatsOff,
        isPulse: false,
      });
    }
  }, [metroOn, updateBeatVisualization, gapSettings]);

  const startMetronome = useCallback(() => {
    if (!audioEngineRef.current || !engineReady) return;

    try {
      beatCounterRef.current = 0;
      audioEngineRef.current.start(currentBpm);
      setMetroOn(true);
      setError(null);
    } catch (err) {
      setError("Failed to start metronome");
      console.error("Metronome start failed:", err);
    }
  }, [currentBpm, engineReady]);

  const stopMetronome = useCallback(() => {
    if (audioEngineRef.current) {
      audioEngineRef.current.stop();
    }
    setMetroOn(false);
  }, []);

  const toggleMetronome = useCallback(() => {
    if (metroOn) {
      stopMetronome();
    } else {
      startMetronome();
    }
  }, [metroOn, startMetronome, stopMetronome]);

  // Tempo trainer controls
  const startTempoTrainer = useCallback(() => {
    if (tempoTrainerRef.current) {
      tempoTrainerRef.current.stop();
    }

    tempoTrainerRef.current = new TempoTrainer(currentBpm, targetBpm, 5, 30);
    tempoTrainerRef.current.start((newBpm) => {
      setCurrentBpm(newBpm);
      onBpmChange?.(newBpm);
      
      // Update metronome if running
      if (metroOn && audioEngineRef.current) {
        audioEngineRef.current.stop();
        audioEngineRef.current.start(newBpm);
      }
    });

    setTempoTrainerActive(true);
  }, [currentBpm, targetBpm, metroOn, onBpmChange]);

  const stopTempoTrainer = useCallback(() => {
    if (tempoTrainerRef.current) {
      tempoTrainerRef.current.stop();
      tempoTrainerRef.current = null;
    }
    setTempoTrainerActive(false);
  }, []);

  // Manual BPM adjustment
  const adjustBpm = useCallback((delta: number) => {
    if (tempoTrainerActive) return;
    
    const newBpm = Math.max(30, Math.min(300, currentBpm + delta));
    setCurrentBpm(newBpm);
    onBpmChange?.(newBpm);

    // Update metronome if running
    if (metroOn && audioEngineRef.current) {
      audioEngineRef.current.stop();
      audioEngineRef.current.start(newBpm);
    }
  }, [currentBpm, metroOn, tempoTrainerActive, onBpmChange]);

  // Subdivision change
  const handleSubdivisionChange = useCallback((sub: Subdivision) => {
    setSubdivision(sub);
    setAudioConfig(prev => ({ ...prev, subdivision: sub }));
    
    // Restart metronome if running to apply subdivision
    if (metroOn && audioEngineRef.current) {
      audioEngineRef.current.stop();
      audioEngineRef.current.updateConfig({ subdivision: sub });
      audioEngineRef.current.start(currentBpm);
    }
  }, [metroOn, currentBpm]);

  // Tap tempo
  const handleTapTempo = useCallback(() => {
    const now = performance.now();
    setTapTimes(prev => {
      const recent = [...prev, now].filter(t => now - t < 3000); // Keep taps within 3 seconds
      if (recent.length >= 2) {
        const intervals = [];
        for (let i = 1; i < recent.length; i++) {
          intervals.push(recent[i] - recent[i - 1]);
        }
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const tappedBpm = Math.round(60000 / avgInterval);
        const clampedBpm = Math.max(30, Math.min(300, tappedBpm));
        
        if (!tempoTrainerActive) {
          setCurrentBpm(clampedBpm);
          onBpmChange?.(clampedBpm);
          
          if (metroOn && audioEngineRef.current) {
            audioEngineRef.current.stop();
            audioEngineRef.current.start(clampedBpm);
          }
        }
      }
      return recent;
    });
  }, [metroOn, tempoTrainerActive, onBpmChange]);

  // BPM slider change
  const handleBpmSlider = useCallback((value: number) => {
    if (tempoTrainerActive) return;
    setCurrentBpm(value);
    onBpmChange?.(value);
    
    if (metroOn && audioEngineRef.current) {
      audioEngineRef.current.stop();
      audioEngineRef.current.start(value);
    }
  }, [metroOn, tempoTrainerActive, onBpmChange]);

  const subdivisionOptions: { value: Subdivision; label: string; icon: string }[] = [
    { value: "quarter", label: "♩", icon: "Quarter" },
    { value: "eighth", label: "♫", icon: "8ths" },
    { value: "triplet", label: "𝅘𝅥𝅮³", icon: "Triplets" },
    { value: "sixteenth", label: "𝅘𝅥𝅮𝅘𝅥𝅮", icon: "16ths" },
  ];

  const soundOptions: { value: ClickSound; label: string }[] = [
    { value: "classic", label: "Classic" },
    { value: "woodblock", label: "Wood Block" },
    { value: "rim", label: "Rim Shot" },
    { value: "digital", label: "Digital" },
    { value: "cowbell", label: "Cowbell" },
    { value: "hihat", label: "Hi-hat" },
  ];

  const tempoTrainerProgress = tempoTrainerActive && tempoTrainerRef.current 
    ? tempoTrainerRef.current.getProgress() 
    : 0;

  return (
    <section className="card enhanced-metronome">
      <div className="metronome-header">
        <div>
          <div className="kicker">Enhanced Metronome</div>
          <div className="metronome-title">
            {currentBpm} BPM
            {tempoTrainerActive && <span className="tempo-trainer-badge">→ {targetBpm}</span>}
          </div>
          <div className="metronome-sub">
            {gapEnabled 
              ? `${gapSettings.beatsOn} on, ${gapSettings.beatsOff} off • ${audioConfig.clickSound}`
              : `${subdivision === "quarter" ? "Quarter notes" : subdivision === "eighth" ? "8th notes" : subdivision === "triplet" ? "Triplets" : "16th notes"} • ${audioConfig.clickSound}`
            }
          </div>
        </div>

        <div className="metronome-controls">
          <button
            type="button"
            className={`btn touch-target ${metroOn ? "" : "btn-ghost"}`}
            onClick={toggleMetronome}
            disabled={!engineReady}
            aria-pressed={metroOn}
            aria-label={metroOn ? "Stop metronome" : "Start metronome"}
          >
            {metroOn ? "Stop" : "Start"}
          </button>
        </div>
      </div>

      {error && (
        <div className="metronome-error" role="alert">
          {error}
        </div>
      )}

      {/* BPM Controls */}
      {!compact && (
        <div className="bpm-controls-enhanced">
          <div className="bpm-buttons-row">
            <button type="button" className="btn btn-small" onClick={() => adjustBpm(-5)} disabled={tempoTrainerActive} aria-label="Decrease BPM by 5">-5</button>
            <button type="button" className="btn btn-small" onClick={() => adjustBpm(-1)} disabled={tempoTrainerActive} aria-label="Decrease BPM by 1">-1</button>
            <span className="bpm-display">{currentBpm}</span>
            <button type="button" className="btn btn-small" onClick={() => adjustBpm(1)} disabled={tempoTrainerActive} aria-label="Increase BPM by 1">+1</button>
            <button type="button" className="btn btn-small" onClick={() => adjustBpm(5)} disabled={tempoTrainerActive} aria-label="Increase BPM by 5">+5</button>
          </div>
          
          {/* BPM Slider */}
          <div className="bpm-slider-row">
            <span className="bpm-slider-label">30</span>
            <input
              type="range"
              min="30"
              max="300"
              value={currentBpm}
              onChange={(e) => handleBpmSlider(parseInt(e.target.value))}
              disabled={tempoTrainerActive}
              className="bpm-slider"
              aria-label="BPM slider"
            />
            <span className="bpm-slider-label">300</span>
          </div>

          {/* Tap Tempo */}
          <button
            type="button"
            className="btn tap-tempo-btn"
            onClick={handleTapTempo}
            disabled={tempoTrainerActive}
            aria-label="Tap tempo"
          >
            Tap Tempo
          </button>
        </div>
      )}

      {/* Subdivision Selector */}
      {!compact && (
        <div className="subdivision-controls">
          <label className="subdivision-label">Subdivision:</label>
          <div className="subdivision-buttons">
            {subdivisionOptions.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`btn btn-small subdivision-btn ${subdivision === opt.value ? "subdivision-btn-active" : "btn-ghost"}`}
                onClick={() => handleSubdivisionChange(opt.value)}
                aria-label={opt.icon}
                aria-pressed={subdivision === opt.value}
              >
                <span className="subdivision-icon">{opt.label}</span>
                <span className="subdivision-text">{opt.icon}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sound Selection */}
      {showSoundOptions && !compact && (
        <div className="sound-controls">
          <label htmlFor="click-sound">Click Sound:</label>
          <select
            id="click-sound"
            value={audioConfig.clickSound}
            onChange={(e) =>
              setAudioConfig(prev => ({ ...prev, clickSound: e.target.value as ClickSound }))
            }
            className="sound-select"
          >
            {soundOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <label htmlFor="volume">Volume:</label>
          <input
            id="volume"
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={audioConfig.volume}
            onChange={(e) =>
              setAudioConfig(prev => ({ ...prev, volume: parseFloat(e.target.value) }))
            }
            className="volume-slider"
          />
          <span className="volume-display">{Math.round(audioConfig.volume * 100)}%</span>
        </div>
      )}

      {/* Tempo Trainer */}
      {showTempoTrainer && !compact && (
        <div className="tempo-trainer">
          <h3>Tempo Trainer</h3>
          <div className="tempo-trainer-controls">
            <div>
              <label htmlFor="target-bpm">Target BPM:</label>
              <input
                id="target-bpm"
                type="number"
                min={currentBpm + 5}
                max="300"
                value={targetBpm}
                onChange={(e) => setTargetBpm(parseInt(e.target.value) || targetBpm)}
                disabled={tempoTrainerActive}
                className="tempo-input"
              />
            </div>
            <button
              type="button"
              className={`btn ${tempoTrainerActive ? "btn-danger" : ""}`}
              onClick={tempoTrainerActive ? stopTempoTrainer : startTempoTrainer}
              disabled={!engineReady || targetBpm <= currentBpm}
            >
              {tempoTrainerActive ? "Stop Trainer" : "Start Trainer"}
            </button>
          </div>
          
          {tempoTrainerActive && (
            <div className="tempo-progress">
              <div className="tempo-progress-bar">
                <div 
                  className="tempo-progress-fill"
                  style={{ width: `${tempoTrainerProgress * 100}%` }}
                />
              </div>
              <div className="tempo-progress-text">
                Progress: {Math.round(tempoTrainerProgress * 100)}%
              </div>
            </div>
          )}
        </div>
      )}

      {/* Visual Pulse */}
      {showVisualPulse && metroOn && (
        <div className="visual-metronome" role="img" aria-label={`Beat ${beatState.beat}`}>
          <div className="visual-metronome-beat-indicator">
            {gapEnabled && beatState.inGap ? "—" : beatState.beat || "—"}
          </div>
          <div
            className={`visual-metronome-circle ${
              beatState.isPulse ? "visual-metronome-circle-pulse" : ""
            } ${gapEnabled && beatState.inGap ? "visual-metronome-circle-gap" : ""}`}
          />
          <div className="visual-metronome-status">
            {gapEnabled ? (beatState.inGap ? "GAP" : "CLICK") : "QUARTER"}
          </div>
        </div>
      )}

      {/* Gap visualization for gap drills */}
      {metroOn && gapEnabled && (
        <div className="gap-visual" role="img" aria-label={`Gap drill: ${beatState.inGap ? "silent gap" : "clicking"}`}>
          <div className="gap-visual-bar">
            <div
              className={`gap-visual-fill ${beatState.inGap ? "gap-visual-fill-gap" : "gap-visual-fill-click"}`}
              style={{
                width: `${(beatState.cyclePosition / beatState.totalCycle) * 100}%`,
              }}
            />
            <div className="gap-visual-markers" aria-hidden="true">
              {Array.from({ length: beatState.totalCycle }).map((_, i) => (
                <div
                  key={i}
                  className={`gap-visual-marker ${
                    i < gapSettings.beatsOn ? "gap-visual-marker-click" : "gap-visual-marker-gap"
                  } ${i === beatState.cyclePosition - 1 ? "gap-visual-marker-active" : ""}`}
                />
              ))}
            </div>
          </div>
          <div className="gap-visual-info">
            <span className={`gap-visual-status ${beatState.inGap ? "gap-visual-status-gap" : "gap-visual-status-click"}`}>
              {beatState.inGap ? "GAP" : "CLICK"}
            </span>
            <span className="gap-visual-beat">
              Beat {beatState.beat} of {beatState.inGap ? gapSettings.beatsOff : gapSettings.beatsOn}
            </span>
          </div>
        </div>
      )}

      {/* Simple LED indicator */}
      {!gapEnabled && (
        <div 
          className={`metronome-led ${metroOn ? "metronome-led-on" : ""}`} 
          role="img" 
          aria-label={metroOn ? "Metronome active" : "Metronome inactive"} 
        />
      )}

      {/* Gap drill controls */}
      {showGapControls && (
        <GapDrillControls
          enabled={gapEnabled}
          onEnabledChange={setGapEnabled}
          settings={gapSettings}
          onSettingsChange={setGapSettings}
          preset={gapPreset}
          onPresetChange={setGapPreset}
          compact={compact}
        />
      )}

      {/* Latency indicator for debugging */}
      {!compact && engineReady && (
        <div className="metronome-debug">
          <small>Audio latency: {audioEngineRef.current?.getLatency().toFixed(2)}ms</small>
        </div>
      )}
    </section>
  );
}