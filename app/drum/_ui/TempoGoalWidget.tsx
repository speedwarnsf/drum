"use client";

import React, { useState, useEffect } from "react";
import {
  getTempoProgressSummary,
  setTempoGoal,
  removeTempoGoal,
  recordTempoProgress,
} from "../_lib/tempoGoals";

type Props = {
  rudimentId: string;
  rudimentName: string;
  suggestedMax: number;
  currentSessionBpm?: number;
};

export default function TempoGoalWidget({ rudimentId, rudimentName, suggestedMax, currentSessionBpm }: Props) {
  const [summary, setSummary] = useState(getTempoProgressSummary(rudimentId));
  const [editing, setEditing] = useState(false);
  const [targetInput, setTargetInput] = useState(summary.goal?.targetBpm ?? suggestedMax);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    setSummary(getTempoProgressSummary(rudimentId));
  }, [rudimentId]);

  // Auto-record progress when session BPM changes
  useEffect(() => {
    if (currentSessionBpm && currentSessionBpm > 0) {
      recordTempoProgress(rudimentId, currentSessionBpm);
      setSummary(getTempoProgressSummary(rudimentId));
    }
  }, [currentSessionBpm, rudimentId]);

  const handleSetGoal = () => {
    setTempoGoal(rudimentId, targetInput);
    setSummary(getTempoProgressSummary(rudimentId));
    setEditing(false);
  };

  const handleRemoveGoal = () => {
    removeTempoGoal(rudimentId);
    setSummary(getTempoProgressSummary(rudimentId));
  };

  const { goal, history, peakBpm, progressPercent } = summary;

  return (
    <div className="tempo-goal-widget">
      <div className="tempo-goal-header">
        <div className="kicker">Tempo Goal</div>
        {goal && !goal.achievedAt && (
          <span className="tempo-goal-target">{goal.targetBpm} BPM target</span>
        )}
        {goal?.achievedAt && (
          <span className="tempo-goal-achieved">Goal reached!</span>
        )}
      </div>

      {!goal && !editing && (
        <div style={{ textAlign: "center", padding: "12px 0" }}>
          <p style={{ fontSize: "0.85rem", color: "var(--ink-muted)", marginBottom: 12 }}>
            Set a target BPM to track your progress over time.
          </p>
          <button className="btn" onClick={() => setEditing(true)}>
            Set Tempo Goal
          </button>
        </div>
      )}

      {editing && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "12px 0" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>
            Target BPM: {targetInput}
          </label>
          <input
            type="range"
            min={40}
            max={300}
            value={targetInput}
            onChange={(e) => setTargetInput(parseInt(e.target.value))}
            style={{ width: "100%" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--ink-muted)" }}>
            <span>40</span>
            <span>300</span>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button className="btn" onClick={handleSetGoal}>Save Goal</button>
            <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      )}

      {goal && !editing && (
        <>
          {/* Progress bar */}
          <div style={{ margin: "12px 0" }}>
            <div style={{
              height: 12,
              background: "var(--stroke)",
              overflow: "hidden",
              position: "relative",
            }}>
              <div style={{
                height: "100%",
                width: `${progressPercent}%`,
                background: goal.achievedAt ? "#27ae60" : "var(--ink)",
                transition: "width 0.3s ease",
              }} />
            </div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.8rem",
              marginTop: 4,
              color: "var(--ink-muted)",
            }}>
              <span>Peak: {peakBpm} BPM</span>
              <span>{progressPercent}% of {goal.targetBpm} BPM</span>
            </div>
          </div>

          {/* Mini chart */}
          {history.length > 1 && (
            <div style={{ margin: "12px 0" }}>
              <button
                className="btn btn-ghost"
                onClick={() => setShowHistory(!showHistory)}
                style={{ fontSize: "0.8rem", padding: "4px 8px" }}
              >
                {showHistory ? "Hide History" : `Show History (${history.length} entries)`}
              </button>

              {showHistory && (
                <div style={{ marginTop: 12 }}>
                  <div style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 2,
                    height: 60,
                    borderBottom: "1px solid var(--stroke)",
                    paddingBottom: 4,
                  }}>
                    {history.slice(-20).map((p, i) => {
                      const maxBpm = Math.max(goal.targetBpm, ...history.map(h => h.bpm));
                      const heightPercent = (p.bpm / maxBpm) * 100;
                      const isGoalMet = p.bpm >= goal.targetBpm;
                      return (
                        <div
                          key={i}
                          style={{
                            flex: 1,
                            height: `${heightPercent}%`,
                            background: isGoalMet ? "#27ae60" : "var(--ink)",
                            minWidth: 4,
                            opacity: 0.8,
                          }}
                          title={`${p.date}: ${p.bpm} BPM`}
                        />
                      );
                    })}
                  </div>
                  {/* Goal line indicator */}
                  <div style={{
                    fontSize: "0.7rem",
                    color: "var(--ink-muted)",
                    marginTop: 4,
                    display: "flex",
                    justifyContent: "space-between",
                  }}>
                    <span>{history[Math.max(0, history.length - 20)]?.date}</span>
                    <span>{history[history.length - 1]?.date}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 8 }}>
            <button className="btn btn-ghost" onClick={() => setEditing(true)} style={{ fontSize: "0.8rem" }}>
              Edit Goal
            </button>
            <button className="btn btn-ghost" onClick={handleRemoveGoal} style={{ fontSize: "0.8rem" }}>
              Remove
            </button>
          </div>
        </>
      )}
    </div>
  );
}
