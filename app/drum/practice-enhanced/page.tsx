"use client";

import React, { Suspense, useEffect, useState } from "react";
import Shell from "../_ui/Shell";
import EnhancedMetronome from "../_ui/EnhancedMetronome";
import WaveformVisualizer, { BeatAccuracyVisualizer } from "../_ui/WaveformVisualizer";
import DrumTapPad from "../_ui/DrumTapPad";
import RudimentNotation, { CompactRudimentNotation } from "../_ui/RudimentNotation";
import { CompactProgressDashboard } from "../_ui/ProgressDashboard";
import { RudimentProgression, generateRudimentPracticeSession, ESSENTIAL_RUDIMENTS } from "../_lib/rudimentLibrary";
import { AchievementTracker, AchievementNotificationManager } from "../_lib/achievementSystem";
import { TapEvent, BeatTracker } from "../_lib/tapDetection";
import { ErrorBoundary } from "../_ui/ErrorBoundary";

export default function EnhancedPracticePage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PracticePageSkeleton />}>
        <EnhancedPracticeInner />
      </Suspense>
    </ErrorBoundary>
  );
}

function PracticePageSkeleton() {
  return (
    <Shell title="Loading Enhanced Practice..." subtitle="Setting up your production-grade experience">
      <div className="enhanced-practice-skeleton">
        <div className="skeleton-card">Loading metronome...</div>
        <div className="skeleton-card">Preparing audio visualization...</div>
        <div className="skeleton-card">Setting up tap detection...</div>
      </div>
    </Shell>
  );
}

function EnhancedPracticeInner() {
  // Core state
  const [bpm, setBpm] = useState(120);
  const [isRecording, setIsRecording] = useState(false);
  const [isPracticing, setIsPracticing] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  
  // Audio and visual feedback
  const [showWaveform, setShowWaveform] = useState(true);
  const [showTapPad, setShowTapPad] = useState(true);
  const [showBeatAccuracy, setShowBeatAccuracy] = useState(true);
  
  // Practice tracking
  const [expectedBeats, setExpectedBeats] = useState<number[]>([]);
  const [actualBeats, setActualBeats] = useState<number[]>([]);
  const [beatTracker] = useState(() => new BeatTracker(50));
  const [currentAccuracy, setCurrentAccuracy] = useState(0);
  
  // Rudiments and progression
  const [rudimentProgression] = useState(() => new RudimentProgression());
  const [currentRudiment, setCurrentRudiment] = useState(() => 
    Object.values(ESSENTIAL_RUDIMENTS)[0]
  );
  const [practiceSession, setPracticeSession] = useState(() => 
    generateRudimentPracticeSession(new RudimentProgression(), 20, 'mixed')
  );
  
  // Achievements
  const [achievementTracker] = useState(() => new AchievementTracker());
  const [notificationManager] = useState(() => new AchievementNotificationManager());

  // Practice mode selection
  const [practiceMode, setPracticeMode] = useState<'free' | 'rudiment' | 'tempo_trainer'>('free');

  // Initialize achievement notifications
  useEffect(() => {
    achievementTracker.onAchievementUnlocked((achievement) => {
      notificationManager.showNotification(achievement);
    });
  }, [achievementTracker, notificationManager]);

  // Generate expected beats based on BPM when practicing
  useEffect(() => {
    if (isPracticing && sessionStartTime) {
      const interval = (60 / bpm) * 1000; // milliseconds per beat
      const beats = [];
      const startTime = sessionStartTime.getTime();
      
      // Generate 32 beats (8 measures in 4/4)
      for (let i = 0; i < 32; i++) {
        beats.push(startTime + (i * interval));
      }
      
      setExpectedBeats(beats);
      beatTracker.setExpectedBeats(beats);
    }
  }, [isPracticing, sessionStartTime, bpm, beatTracker]);

  // Handle tap detection
  const handleTapDetected = (tap: TapEvent) => {
    setActualBeats(prev => [...prev.slice(-31), tap.timestamp]); // Keep last 32
    beatTracker.addDetectedBeat(tap);
    
    // Update accuracy in real-time
    if (isPracticing && expectedBeats.length > 0) {
      const stats = beatTracker.getTimingStats();
      setCurrentAccuracy(stats.accuracyPercentage);
    }
  };

  // Start practice session
  const startPracticeSession = () => {
    const now = new Date();
    setIsPracticing(true);
    setSessionStartTime(now);
    setIsRecording(true);
    setActualBeats([]);
    beatTracker.clear();
    
    // Track session start
    achievementTracker.recordPracticeSession({
      durationMinutes: 0,
      sessionDate: now,
    });
  };

  // End practice session
  const endPracticeSession = () => {
    if (sessionStartTime) {
      const durationMinutes = (Date.now() - sessionStartTime.getTime()) / (1000 * 60);
      
      // Record complete session
      const newAchievements = achievementTracker.recordPracticeSession({
        durationMinutes,
        accuracy: currentAccuracy,
        tempo: bpm,
        sessionDate: new Date(),
      });

      // Show any newly unlocked achievements
      newAchievements.forEach(achievement => {
        notificationManager.showNotification(achievement);
      });
    }
    
    setIsPracticing(false);
    setIsRecording(false);
    setSessionStartTime(null);
  };

  // Change practice mode
  const handleModeChange = (mode: typeof practiceMode) => {
    if (isPracticing) {
      endPracticeSession();
    }
    setPracticeMode(mode);
    
    // Update rudiment if switching to rudiment mode
    if (mode === 'rudiment') {
      const recommended = rudimentProgression.getRecommendedRudiments(1);
      if (recommended.length > 0) {
        setCurrentRudiment(recommended[0]);
      }
    }
  };

  // Practice configuration based on mode
  const practiceConfig = {
    free: {
      title: "Free Practice",
      subtitle: "Practice at your own pace with full audio feedback",
      showRudiment: false,
      showTempoTrainer: false,
    },
    rudiment: {
      title: "Rudiment Practice",
      subtitle: `Master the ${currentRudiment.name}`,
      showRudiment: true,
      showTempoTrainer: false,
    },
    tempo_trainer: {
      title: "Tempo Training",
      subtitle: "Build speed gradually with automatic BPM increases",
      showRudiment: false,
      showTempoTrainer: true,
    },
  };

  const config = practiceConfig[practiceMode];

  return (
    <Shell title={config.title} subtitle={config.subtitle}>
      {/* Import production styles */}
      <style jsx global>{`
        @import url('./styles/production.css');
      `}</style>

      {/* Practice Mode Selection */}
      <section className="card practice-mode-selector">
        <h3>Practice Mode</h3>
        <div className="mode-buttons">
          {Object.entries(practiceConfig).map(([mode, modeConfig]) => (
            <button
              key={mode}
              className={`btn ${practiceMode === mode ? '' : 'btn-ghost'}`}
              onClick={() => handleModeChange(mode as typeof practiceMode)}
              disabled={isPracticing}
            >
              {modeConfig.title}
            </button>
          ))}
        </div>
      </section>

      {/* Progress Dashboard */}
      <CompactProgressDashboard />

      {/* Enhanced Metronome */}
      <EnhancedMetronome
        bpm={bpm}
        onBpmChange={setBpm}
        showGapControls={practiceMode === 'free'}
        showTempoTrainer={config.showTempoTrainer}
        showSoundOptions={true}
        showVisualPulse={isPracticing}
      />

      {/* Rudiment Notation (when in rudiment mode) */}
      {config.showRudiment && (
        <div className="rudiment-section">
          <RudimentNotation
            rudiment={currentRudiment}
            showVariations={true}
            showPlayhead={isPracticing}
            currentBeat={0} // This would be calculated based on metronome
            interactive={false}
          />
          
          <div className="rudiment-controls">
            <button
              className="btn btn-ghost"
              onClick={() => {
                const recommended = rudimentProgression.getRecommendedRudiments(5);
                const currentIndex = recommended.findIndex(r => r.id === currentRudiment.id);
                const nextIndex = (currentIndex + 1) % recommended.length;
                setCurrentRudiment(recommended[nextIndex]);
              }}
              disabled={isPracticing}
            >
              Next Rudiment
            </button>
            
            <button
              className="btn"
              onClick={() => {
                rudimentProgression.markCompleted(currentRudiment.id, 4);
                achievementTracker.recordRudimentMastery(currentRudiment.id);
              }}
              disabled={isPracticing}
            >
              Mark as Mastered
            </button>
          </div>
        </div>
      )}

      {/* Practice Session Controls */}
      <section className="card practice-controls">
        <div className="practice-header">
          <h3>Practice Session</h3>
          {isPracticing && sessionStartTime && (
            <div className="session-timer">
              <SessionTimer startTime={sessionStartTime} />
            </div>
          )}
        </div>
        
        {isPracticing && (
          <div className="live-stats">
            <div className="stat">
              <span className="stat-label">Accuracy:</span>
              <span className={`stat-value ${currentAccuracy >= 80 ? 'good' : 'needs-work'}`}>
                {Math.round(currentAccuracy)}%
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">BPM:</span>
              <span className="stat-value">{bpm}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Beats:</span>
              <span className="stat-value">{actualBeats.length}/{expectedBeats.length}</span>
            </div>
          </div>
        )}

        <div className="session-buttons">
          {!isPracticing ? (
            <button
              className="btn btn-primary btn-large"
              onClick={startPracticeSession}
            >
              Start Practice Session
            </button>
          ) : (
            <button
              className="btn btn-danger btn-large"
              onClick={endPracticeSession}
            >
              ⏹️ End Session
            </button>
          )}
        </div>
      </section>

      {/* Audio Visualization */}
      {showWaveform && (
        <WaveformVisualizer
          isRecording={isRecording}
          showFrequencyAnalysis={false}
          beatTimes={actualBeats}
          width={800}
          height={150}
          showGrid={true}
        />
      )}

      {/* Drum Tap Pad */}
      {showTapPad && (
        <DrumTapPad
          isActive={isPracticing}
          showVisualFeedback={true}
          enableHapticFeedback={true}
          onTap={handleTapDetected}
          metronomeBeats={expectedBeats}
          bpm={bpm}
          practice={practiceMode === 'rudiment' ? {
            pattern: currentRudiment.name,
            targetAccuracy: 85,
          } : undefined}
          layout={practiceMode === 'rudiment' ? 'practice' : 'standard'}
        />
      )}

      {/* Beat Accuracy Analysis */}
      {showBeatAccuracy && actualBeats.length > 0 && expectedBeats.length > 0 && (
        <BeatAccuracyVisualizer
          expectedBeats={expectedBeats.slice(0, actualBeats.length)}
          actualBeats={actualBeats}
          toleranceMs={50}
          width={800}
          height={120}
        />
      )}

      {/* Display Options */}
      <section className="card display-options">
        <h3>Display Options</h3>
        <div className="option-checkboxes">
          <label>
            <input
              type="checkbox"
              checked={showWaveform}
              onChange={(e) => setShowWaveform(e.target.checked)}
            />
            Show Waveform Visualization
          </label>
          <label>
            <input
              type="checkbox"
              checked={showTapPad}
              onChange={(e) => setShowTapPad(e.target.checked)}
            />
            Show Drum Tap Pad
          </label>
          <label>
            <input
              type="checkbox"
              checked={showBeatAccuracy}
              onChange={(e) => setShowBeatAccuracy(e.target.checked)}
            />
            Show Beat Accuracy Analysis
          </label>
        </div>
      </section>

      {/* Practice Session Summary */}
      {practiceSession && (
        <section className="card session-summary">
          <h3>Today's Recommended Practice</h3>
          
          <div className="practice-sections">
            <div className="practice-section">
              <h4>Warm-Up ({practiceSession.warmUp.length} rudiments)</h4>
              <div className="rudiment-list">
                {practiceSession.warmUp.map(rudiment => (
                  <CompactRudimentNotation 
                    key={rudiment.id} 
                    rudiment={rudiment} 
                    size="mini"
                  />
                ))}
              </div>
            </div>
            
            <div className="practice-section">
              <h4>Main Practice ({practiceSession.main.length} rudiments)</h4>
              <div className="rudiment-list">
                {practiceSession.main.map(rudiment => (
                  <CompactRudimentNotation 
                    key={rudiment.id} 
                    rudiment={rudiment} 
                    size="small"
                  />
                ))}
              </div>
            </div>
            
            <div className="practice-section">
              <h4>Review ({practiceSession.review.length} rudiments)</h4>
              <div className="rudiment-list">
                {practiceSession.review.map(rudiment => (
                  <CompactRudimentNotation 
                    key={rudiment.id} 
                    rudiment={rudiment} 
                    size="mini"
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Quick Navigation */}
      <section className="card quick-nav">
        <h3>Quick Access</h3>
        <div className="nav-buttons">
          <a href="/drum/today" className="btn btn-ghost">
            Today's AI Card
          </a>
          <a href="/drum/progress" className="btn btn-ghost">
            Full Progress Dashboard
          </a>
          <a href="/drum/patterns" className="btn btn-ghost">
            Pattern Library
          </a>
          <a href="/drum/journal" className="btn btn-ghost">
            Practice Journal
          </a>
        </div>
      </section>
    </Shell>
  );
}

// Session Timer Component
function SessionTimer({ startTime }: { startTime: Date }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Date.now() - startTime.getTime());
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const minutes = Math.floor(elapsed / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);

  return (
    <div className="session-timer">
      <span className="timer-icon"></span>
      <span className="timer-text">
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
}

// Additional styles for the enhanced practice page
const styles = `
.practice-mode-selector {
  margin-bottom: 20px;
}

.mode-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 15px;
}

.practice-controls {
  background: linear-gradient(135deg, var(--ink, #3c3c3c) 0%, var(--ink-muted, #5a5040) 100%);
  color: white;
}

.practice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.session-timer {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.2rem;
  font-weight: 600;
  color: #f4ba34;
}

.timer-icon {
  font-size: 1.5rem;
}

.live-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.stat {
  text-align: center;
  padding: 15px;
  background: rgba(255,255,255,0.1);
  border-radius: 0;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 5px;
}

.stat-value {
  display: block;
  font-size: 1.8rem;
  font-weight: 700;
}

.stat-value.good {
  color: #4ecdc4;
}

.stat-value.needs-work {
  color: #f4ba34;
}

.session-buttons {
  text-align: center;
  margin-top: 20px;
}

.btn-large {
  padding: 15px 30px;
  font-size: 1.1rem;
  font-weight: 600;
}

.display-options {
  background: #f8f9fa;
}

.option-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 15px;
}

.option-checkboxes label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.rudiment-section {
  margin: 20px 0;
}

.rudiment-controls {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 15px;
}

.session-summary {
  background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
  color: white;
}

.practice-sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
}

.practice-section h4 {
  margin-bottom: 15px;
  font-size: 1.1rem;
}

.rudiment-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.quick-nav {
  background: #34495e;
  color: white;
}

.nav-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  margin-top: 15px;
}

.enhanced-practice-skeleton {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.skeleton-card {
  height: 120px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-weight: 600;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@media (max-width: 768px) {
  .mode-buttons {
    flex-direction: column;
  }
  
  .live-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .rudiment-controls {
    flex-direction: column;
  }
  
  .nav-buttons {
    grid-template-columns: 1fr;
  }
  
  .practice-sections {
    gap: 15px;
  }
  
  .rudiment-list {
    grid-template-columns: 1fr;
  }
}
`;

export { styles };