"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { TapDetector, TapEvent, BeatTracker } from "../_lib/tapDetection";

type TapPadProps = {
  isActive?: boolean;
  showVisualFeedback?: boolean;
  enableHapticFeedback?: boolean;
  onTap?: (tap: TapEvent) => void;
  metronomeBeats?: number[];
  bpm?: number;
  practice?: {
    pattern: string;
    targetAccuracy: number;
  };
  layout?: 'standard' | 'compact' | 'practice';
};

type PadConfig = {
  id: string;
  label: string;
  color: string;
  sound: string;
  position: { x: number; y: number; width: number; height: number };
  type: 'kick' | 'snare' | 'hihat' | 'crash' | 'tom' | 'cymbal';
};

const DRUM_LAYOUTS = {
  standard: [
    { id: 'crash1', label: 'Crash', color: '#FFD700', sound: 'crash', position: { x: 0, y: 0, width: 30, height: 25 }, type: 'crash' as const },
    { id: 'hihat', label: 'Hi-Hat', color: '#C0C0C0', sound: 'hihat', position: { x: 70, y: 0, width: 30, height: 25 }, type: 'hihat' as const },
    { id: 'tom1', label: 'Tom 1', color: '#8B4513', sound: 'tom', position: { x: 35, y: 15, width: 30, height: 25 }, type: 'tom' as const },
    { id: 'snare', label: 'Snare', color: '#FF6B6B', sound: 'snare', position: { x: 0, y: 40, width: 40, height: 35 }, type: 'snare' as const },
    { id: 'tom2', label: 'Tom 2', color: '#8B4513', sound: 'tom', position: { x: 60, y: 40, width: 40, height: 35 }, type: 'tom' as const },
    { id: 'kick', label: 'Kick', color: '#4ECDC4', sound: 'kick', position: { x: 25, y: 80, width: 50, height: 20 }, type: 'kick' as const },
  ],
  compact: [
    { id: 'hihat', label: 'HH', color: '#C0C0C0', sound: 'hihat', position: { x: 0, y: 0, width: 50, height: 33 }, type: 'hihat' as const },
    { id: 'snare', label: 'Snare', color: '#FF6B6B', sound: 'snare', position: { x: 50, y: 0, width: 50, height: 33 }, type: 'snare' as const },
    { id: 'kick', label: 'Kick', color: '#4ECDC4', sound: 'kick', position: { x: 0, y: 33, width: 100, height: 67 }, type: 'kick' as const },
  ],
  practice: [
    { id: 'click', label: 'Practice Pad', color: '#f4ba34', sound: 'click', position: { x: 0, y: 0, width: 100, height: 100 }, type: 'snare' as const },
  ],
};

export default function DrumTapPad({
  isActive = false,
  showVisualFeedback = true,
  enableHapticFeedback = true,
  onTap,
  metronomeBeats = [],
  bpm = 120,
  practice,
  layout = 'standard',
}: TapPadProps) {
  const [taps, setTaps] = useState<TapEvent[]>([]);
  const [beatTracker] = useState(() => new BeatTracker(50)); // 50ms tolerance
  const [tapDetector] = useState(() => new TapDetector());
  const [recentTaps, setRecentTaps] = useState<Map<string, number>>(new Map());
  const [isDetectorReady, setIsDetectorReady] = useState(false);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [isPracticing, setIsPracticing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const pads = DRUM_LAYOUTS[layout];

  // Initialize tap detector when active
  useEffect(() => {
    if (isActive && !isDetectorReady) {
      tapDetector.initialize()
        .then(() => {
          setIsDetectorReady(true);
          tapDetector.onTap(handleTapDetected);
        })
        .catch(console.error);
    } else if (!isActive && isDetectorReady) {
      tapDetector.cleanup();
      setIsDetectorReady(false);
    }

    return () => {
      tapDetector.cleanup();
    };
  }, [isActive, isDetectorReady]);

  // Update beat tracker with metronome beats
  useEffect(() => {
    if (metronomeBeats.length > 0) {
      beatTracker.setExpectedBeats(metronomeBeats);
    }
  }, [metronomeBeats, beatTracker]);

  // Handle detected taps from audio
  const handleTapDetected = useCallback((tap: TapEvent) => {
    setTaps(prev => [...prev.slice(-20), tap]); // Keep last 20 taps
    beatTracker.addDetectedBeat(tap);
    onTap?.(tap);

    // Update accuracy if practicing
    if (isPracticing && metronomeBeats.length > 0) {
      const stats = beatTracker.getTimingStats();
      setAccuracy(stats.accuracyPercentage);
    }

    // Visual feedback for detected tap
    if (showVisualFeedback) {
      const padId = getPadForTapType(tap.type);
      if (padId) {
        triggerPadAnimation(padId);
      }
    }

    // Haptic feedback
    if (enableHapticFeedback && 'vibrate' in navigator) {
      const intensity = Math.round(tap.intensity / 100 * 50); // Scale to 50ms max
      navigator.vibrate(Math.max(10, intensity));
    }
  }, [onTap, showVisualFeedback, enableHapticFeedback, isPracticing, metronomeBeats, beatTracker]);

  // Handle manual tap on pad
  const handlePadTap = useCallback((padId: string, pad: PadConfig, event: React.TouchEvent | React.MouseEvent) => {
    event.preventDefault();
    
    const timestamp = Date.now();
    const manualTap: TapEvent = {
      timestamp,
      intensity: 100,
      frequency: getFrequencyForPadType(pad.type),
      confidence: 1.0,
      type: pad.type === 'tom' ? 'snare' : pad.type === 'cymbal' ? 'crash' : pad.type, // Map tom→snare, cymbal→crash
    };

    setTaps(prev => [...prev.slice(-20), manualTap]);
    beatTracker.addDetectedBeat(manualTap);
    onTap?.(manualTap);

    // Visual feedback
    triggerPadAnimation(padId);

    // Haptic feedback
    if (enableHapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(30);
    }

    // Play sound feedback
    playPadSound(pad.sound);
  }, [onTap, enableHapticFeedback, beatTracker]);

  // Utility functions
  const getPadForTapType = (type: TapEvent['type']): string | null => {
    const pad = pads.find(p => p.type === type);
    return pad?.id || null;
  };

  const getFrequencyForPadType = (type: PadConfig['type']): number => {
    const frequencies = {
      kick: 60,
      snare: 200,
      hihat: 8000,
      crash: 12000,
      tom: 150,
      cymbal: 10000,
    };
    return frequencies[type] || 1000;
  };

  const triggerPadAnimation = (padId: string) => {
    setRecentTaps(prev => new Map(prev.set(padId, Date.now())));
    
    // Clear animation after duration
    setTimeout(() => {
      setRecentTaps(prev => {
        const newMap = new Map(prev);
        newMap.delete(padId);
        return newMap;
      });
    }, 150);
  };

  const playPadSound = (soundType: string) => {
    // Simple Web Audio API sound for immediate feedback
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      const frequencies = {
        kick: 60,
        snare: 200,
        hihat: 8000,
        crash: 12000,
        tom: 150,
        click: 1200,
      };

      oscillator.frequency.setValueAtTime(frequencies[soundType as keyof typeof frequencies] || 1000, audioContext.currentTime);
      oscillator.type = soundType === 'hihat' ? 'sawtooth' : 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.warn('Could not play pad sound:', error);
    }
  };

  // Practice session controls
  const startPracticeSession = () => {
    setIsPracticing(true);
    setTaps([]);
    beatTracker.clear();
  };

  const stopPracticeSession = () => {
    setIsPracticing(false);
    const stats = beatTracker.getTimingStats();
    setAccuracy(stats.accuracyPercentage);
  };

  // Gesture handling for better mobile experience
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling and zooming
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling
  }, []);

  return (
    <div className="drum-tap-pad" ref={containerRef}>
      <div className="tap-pad-header">
        <div>
          <h3>Drum Tap Pad</h3>
          <div className="tap-pad-status">
            {isDetectorReady ? (
              <span className="status-active">🎙️ Listening</span>
            ) : isActive ? (
              <span className="status-initializing">⏳ Initializing...</span>
            ) : (
              <span className="status-inactive">⏸️ Inactive</span>
            )}
          </div>
        </div>

        {practice && (
          <div className="practice-controls">
            <div className="practice-info">
              <span>Pattern: {practice.pattern}</span>
              <span>Target: {practice.targetAccuracy}%</span>
              <span className={`accuracy ${accuracy >= practice.targetAccuracy ? 'good' : 'needs-work'}`}>
                Current: {accuracy.toFixed(1)}%
              </span>
            </div>
            <button
              onClick={isPracticing ? stopPracticeSession : startPracticeSession}
              className={`btn ${isPracticing ? 'btn-danger' : 'btn-success'}`}
            >
              {isPracticing ? 'Stop Practice' : 'Start Practice'}
            </button>
          </div>
        )}
      </div>

      <div 
        className={`drum-kit drum-kit-${layout}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {pads.map(pad => {
          const isRecentlyTapped = recentTaps.has(pad.id);
          const timeSinceTap = isRecentlyTapped ? Date.now() - (recentTaps.get(pad.id) || 0) : Infinity;
          const animationIntensity = Math.max(0, 1 - (timeSinceTap / 150));

          return (
            <button
              key={pad.id}
              className={`drum-pad drum-pad-${pad.type} ${isRecentlyTapped ? 'drum-pad-active' : ''}`}
              style={{
                left: `${pad.position.x}%`,
                top: `${pad.position.y}%`,
                width: `${pad.position.width}%`,
                height: `${pad.position.height}%`,
                backgroundColor: pad.color,
                transform: isRecentlyTapped ? `scale(${1 + animationIntensity * 0.1})` : 'scale(1)',
                boxShadow: isRecentlyTapped 
                  ? `0 0 ${animationIntensity * 20}px ${pad.color}80` 
                  : 'none',
              }}
              onTouchEnd={(e) => handlePadTap(pad.id, pad, e)}
              onMouseDown={(e) => handlePadTap(pad.id, pad, e)}
              aria-label={`${pad.label} drum pad`}
              data-pad-type={pad.type}
            >
              <span className="drum-pad-label">{pad.label}</span>
            </button>
          );
        })}
      </div>

      {/* Recent taps display */}
      {showVisualFeedback && taps.length > 0 && (
        <div className="recent-taps">
          <h4>Recent Taps</h4>
          <div className="tap-list">
            {taps.slice(-5).reverse().map((tap, index) => (
              <div key={`${tap.timestamp}-${index}`} className="tap-item">
                <span className="tap-type">{tap.type}</span>
                <span className="tap-intensity">{tap.intensity.toFixed(0)}%</span>
                <span className="tap-confidence">
                  {(tap.confidence * 100).toFixed(0)}% conf
                </span>
                <span className="tap-time">
                  {new Date(tap.timestamp).toLocaleTimeString([], { 
                    hour12: false, 
                    minute: '2-digit', 
                    second: '2-digit', 
                    fractionalSecondDigits: 1 
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="tap-pad-settings">
        <div className="setting-group">
          <label>
            <input
              type="checkbox"
              checked={showVisualFeedback}
              onChange={(e) => showVisualFeedback = e.target.checked}
            />
            Visual feedback
          </label>
        </div>
        
        <div className="setting-group">
          <label>
            <input
              type="checkbox"
              checked={enableHapticFeedback}
              onChange={(e) => enableHapticFeedback = e.target.checked}
              disabled={!('vibrate' in navigator)}
            />
            Haptic feedback
            {!('vibrate' in navigator) && <small> (not supported)</small>}
          </label>
        </div>

        <div className="setting-group">
          <label htmlFor="sensitivity">Detection sensitivity:</label>
          <input
            id="sensitivity"
            type="range"
            min="0.1"
            max="2.0"
            step="0.1"
            defaultValue="1.0"
            onChange={(e) => {
              if (isDetectorReady) {
                tapDetector.adjustSensitivity(parseFloat(e.target.value));
              }
            }}
            className="sensitivity-slider"
          />
        </div>
      </div>

      {/* Latency info */}
      {isDetectorReady && (
        <div className="latency-info">
          <small>Audio latency: ~{(tapDetector.getLatency() * 1000).toFixed(1)}ms</small>
        </div>
      )}
    </div>
  );
}