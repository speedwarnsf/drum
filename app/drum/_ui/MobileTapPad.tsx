"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Icon } from "./Icon";

interface TapPadProps {
  pattern?: string;
  onTap?: (pad: 'kick' | 'snare' | 'hihat') => void;
  disabled?: boolean;
}

type TapEvent = {
  pad: 'kick' | 'snare' | 'hihat';
  timestamp: number;
  accuracy?: number; // Timing accuracy if metronome is running
};

export default function MobileTapPad({ pattern, onTap, disabled = false }: TapPadProps) {
  const [tapHistory, setTapHistory] = useState<TapEvent[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  
  const kickRef = useRef<HTMLButtonElement>(null);
  const snareRef = useRef<HTMLButtonElement>(null);
  const hihatRef = useRef<HTMLButtonElement>(null);

  const handleTap = useCallback((pad: 'kick' | 'snare' | 'hihat') => {
    if (disabled) return;

    const timestamp = Date.now();
    const newTap: TapEvent = { pad, timestamp };
    
    // Add visual feedback
    const refs = { kick: kickRef, snare: snareRef, hihat: hihatRef };
    const ref = refs[pad];
    if (ref.current) {
      ref.current.classList.add('tap-active');
      setTimeout(() => {
        ref.current?.classList.remove('tap-active');
      }, 150);
    }

    // Haptic feedback on mobile devices
    if ('vibrate' in navigator) {
      // Different vibration patterns for different drums
      const patterns = {
        kick: [50],
        snare: [30, 30, 30],
        hihat: [20]
      };
      navigator.vibrate(patterns[pad]);
    }

    setTapHistory(prev => [...prev.slice(-19), newTap]); // Keep last 20 taps
    onTap?.(pad);

    // Show brief feedback
    setFeedback(`${pad.toUpperCase()}`);
    setTimeout(() => setFeedback(null), 300);
  }, [disabled, onTap]);

  // Touch event handlers with better mobile support
  const createTouchHandler = (pad: 'kick' | 'snare' | 'hihat') => ({
    onTouchStart: (e: React.TouchEvent) => {
      e.preventDefault(); // Prevent double-tap zoom
      handleTap(pad);
    },
    onClick: () => handleTap(pad), // Fallback for non-touch devices
  });

  const clearHistory = () => {
    setTapHistory([]);
    setFeedback("Cleared!");
    setTimeout(() => setFeedback(null), 1000);
  };

  const getLastTapsDisplay = () => {
    if (tapHistory.length === 0) return "Start tapping!";
    
    return tapHistory
      .slice(-8) // Show last 8 taps
      .map(tap => {
        switch (tap.pad) {
          case 'kick': return 'K';
          case 'snare': return 'S'; 
          case 'hihat': return 'H';
        }
      })
      .join('-');
  };

  // Auto-clear feedback after patterns
  useEffect(() => {
    if (feedback && feedback !== "Cleared!") {
      const timer = setTimeout(() => setFeedback(null), 300);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  return (
    <div className="mobile-tap-pad">
      <div className="tap-pad-header">
        <h3 className="tap-pad-title">Practice Pad</h3>
        {pattern && (
          <p className="tap-pad-pattern">
            Pattern: <span className="font-mono">{pattern}</span>
          </p>
        )}
      </div>

      <div className="tap-feedback-area">
        {feedback && (
          <div className="tap-feedback animate-bounce">
            {feedback}
          </div>
        )}
        <div className="tap-history">
          {getLastTapsDisplay()}
        </div>
      </div>

      <div className="tap-pads-grid">
        {/* Hi-Hat */}
        <button
          ref={hihatRef}
          className="tap-pad tap-pad-hihat"
          {...createTouchHandler('hihat')}
          disabled={disabled}
          aria-label="Hi-hat"
        >
          <div className="tap-pad-icon"><Icon name="music" size={32} /></div>
          <div className="tap-pad-label">Hi-Hat</div>
          <div className="tap-pad-key">H</div>
        </button>

        {/* Snare */}
        <button
          ref={snareRef}
          className="tap-pad tap-pad-snare"
          {...createTouchHandler('snare')}
          disabled={disabled}
          aria-label="Snare drum"
        >
          <div className="tap-pad-icon">🥁</div>
          <div className="tap-pad-label">Snare</div>
          <div className="tap-pad-key">S</div>
        </button>

        {/* Kick */}
        <button
          ref={kickRef}
          className="tap-pad tap-pad-kick"
          {...createTouchHandler('kick')}
          disabled={disabled}
          aria-label="Kick drum"
        >
          <div className="tap-pad-icon"><Icon name="drum" size={32} /></div>
          <div className="tap-pad-label">Kick</div>
          <div className="tap-pad-key">K</div>
        </button>
      </div>

      <div className="tap-pad-controls">
        <button
          onClick={clearHistory}
          className="btn btn-sm btn-secondary"
          disabled={disabled || tapHistory.length === 0}
        >
          Clear History
        </button>
        <div className="tap-count">
          Taps: {tapHistory.length}
        </div>
      </div>
    </div>
  );
}

// Add CSS styles for the tap pad (would go in globals.css)
export const TAP_PAD_STYLES = `
.mobile-tap-pad {
  background: var(--panel);
  border: 1px solid var(--stroke);
  border-radius: 16px;
  padding: 16px;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}

.tap-pad-header {
  text-align: center;
  margin-bottom: 16px;
}

.tap-pad-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

.tap-pad-pattern {
  font-size: 14px;
  color: var(--ink-muted);
}

.tap-feedback-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  min-height: 60px;
  justify-content: center;
}

.tap-feedback {
  font-size: 24px;
  font-weight: bold;
  color: var(--ink);
  background: var(--bg);
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid var(--stroke);
}

.tap-history {
  font-family: var(--font-dm-mono), monospace;
  font-size: 16px;
  color: var(--ink-muted);
  background: var(--bg);
  padding: 8px 12px;
  border-radius: 8px;
  min-height: 32px;
  display: flex;
  align-items: center;
  border: 1px solid var(--stroke);
}

.tap-pads-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
  aspect-ratio: 1;
  max-width: 300px;
  margin-left: auto;
  margin-right: auto;
}

.tap-pad-hihat {
  grid-column: 1 / -1;
  grid-row: 1;
}

.tap-pad-snare {
  grid-column: 1;
  grid-row: 2;
}

.tap-pad-kick {
  grid-column: 2;
  grid-row: 2;
}

.tap-pad {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--panel-deep);
  border: 2px solid var(--stroke);
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  cursor: pointer;
  transition: all 150ms ease;
  min-height: 80px;
  position: relative;
  overflow: hidden;
}

.tap-pad:active,
.tap-pad.tap-active {
  transform: scale(0.95);
  background: var(--bg-deep);
  border-color: var(--ink);
}

.tap-pad:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tap-pad-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.tap-pad-label {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 2px;
}

.tap-pad-key {
  font-size: 10px;
  opacity: 0.6;
  font-family: var(--font-dm-mono), monospace;
}

.tap-pad-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tap-count {
  font-size: 14px;
  color: var(--ink-muted);
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .tap-pads-grid {
    gap: 16px;
    max-width: 280px;
  }
  
  .tap-pad {
    min-height: 70px;
  }
  
  .tap-pad-hihat {
    min-height: 60px;
  }
}

/* Add ripple effect on tap */
.tap-pad::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: var(--ink);
  opacity: 0.3;
  transform: translate(-50%, -50%);
  transition: width 0.3s, height 0.3s;
}

.tap-pad.tap-active::before {
  width: 120px;
  height: 120px;
}
`;