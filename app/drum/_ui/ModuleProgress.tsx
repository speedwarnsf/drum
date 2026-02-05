"use client";

import { useState } from "react";
import { MODULE_INFO, advanceModule } from "../_lib/drumMvp";

type ModuleProgressProps = {
  currentModule: number;
  sessionsInModule: number;
  compact?: boolean;
  onAdvance?: (newModule: number) => void;
};

export default function ModuleProgress({
  currentModule,
  sessionsInModule,
  compact = false,
  onAdvance,
}: ModuleProgressProps) {
  const [showAdvancePrompt, setShowAdvancePrompt] = useState(false);
  const [advancing, setAdvancing] = useState(false);

  const canAdvance = currentModule < 4 && sessionsInModule >= 14;
  const moduleInfo = MODULE_INFO[currentModule - 1];

  async function handleAdvance() {
    setAdvancing(true);
    const newModule = await advanceModule();
    setAdvancing(false);
    setShowAdvancePrompt(false);
    if (newModule && onAdvance) {
      onAdvance(newModule);
    }
  }

  if (compact) {
    return (
      <div className="module-progress-compact">
        <div className="module-dots">
          {MODULE_INFO.map((m) => (
            <div
              key={m.id}
              className={`module-dot ${m.id < currentModule ? "module-dot-complete" : ""} ${m.id === currentModule ? "module-dot-current" : ""}`}
              title={`Module ${m.id}: ${m.title}`}
            />
          ))}
        </div>
        <span className="module-label">
          Module {currentModule}: {moduleInfo.title}
        </span>
        {canAdvance && (
          <button
            className="module-advance-hint"
            onClick={() => setShowAdvancePrompt(true)}
          >
            Ready to advance →
          </button>
        )}
        {showAdvancePrompt && (
          <div className="module-advance-modal">
            <div className="module-advance-content">
              <h3>Advance to Module {currentModule + 1}?</h3>
              <p className="sub">
                You&apos;ve completed {sessionsInModule} sessions in this module.
                Ready to move on to <strong>{MODULE_INFO[currentModule].title}</strong>?
              </p>
              <div className="row">
                <button
                  className="btn"
                  onClick={handleAdvance}
                  disabled={advancing}
                >
                  {advancing ? "Advancing..." : "Yes, advance"}
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => setShowAdvancePrompt(false)}
                >
                  Not yet
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="module-progress">
      <div className="module-progress-header">
        <span className="kicker">Your Progress</span>
      </div>
      <div className="module-grid">
        {MODULE_INFO.map((m) => {
          const isComplete = m.id < currentModule;
          const isCurrent = m.id === currentModule;
          const isFuture = m.id > currentModule;

          return (
            <div
              key={m.id}
              className={`module-card ${isComplete ? "module-card-complete" : ""} ${isCurrent ? "module-card-current" : ""} ${isFuture ? "module-card-future" : ""}`}
            >
              <div className="module-card-header">
                <span className="module-number">
                  {isComplete ? "✓" : m.id}
                </span>
                <span className="module-duration">{m.duration}</span>
              </div>
              <h3 className="module-title">{m.title}</h3>
              <p className="module-focus">{m.focus}</p>
              {isCurrent && (
                <div className="module-current-badge">
                  <span className="module-sessions">
                    {sessionsInModule} session{sessionsInModule !== 1 ? "s" : ""} completed
                  </span>
                  {canAdvance && (
                    <button
                      className="btn module-advance-btn"
                      onClick={() => setShowAdvancePrompt(true)}
                    >
                      Advance →
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showAdvancePrompt && (
        <div className="module-advance-modal">
          <div className="module-advance-content">
            <h3>Advance to Module {currentModule + 1}?</h3>
            <p className="sub">
              You&apos;ve completed {sessionsInModule} sessions in Module {currentModule}: {moduleInfo.title}.
            </p>
            <p className="sub" style={{ marginTop: 8 }}>
              Next up: <strong>{MODULE_INFO[currentModule].title}</strong> — {MODULE_INFO[currentModule].focus}
            </p>
            <div className="row">
              <button
                className="btn"
                onClick={handleAdvance}
                disabled={advancing}
              >
                {advancing ? "Advancing..." : "Yes, advance"}
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setShowAdvancePrompt(false)}
              >
                Stay in current module
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
