"use client";

import React, { useState, useEffect, useCallback } from "react";
import Shell from "../_ui/Shell";
import Link from "next/link";
import EnhancedMetronome from "../_ui/EnhancedMetronome";
import {
  PracticeRoutine,
  RoutineStep,
  loadRoutines,
  createRoutine,
  updateRoutine,
  deleteRoutine,
  recordPractice,
} from "../_lib/practiceTracker";
import { ESSENTIAL_RUDIMENTS } from "../_lib/rudimentLibrary";

type ViewMode = "list" | "create" | "play";

export default function RoutinesPage() {
  const [routines, setRoutines] = useState<PracticeRoutine[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [activeRoutine, setActiveRoutine] = useState<PracticeRoutine | null>(null);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [stepTimer, setStepTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Create form state
  const [newName, setNewName] = useState("");
  const [newSteps, setNewSteps] = useState<RoutineStep[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setRoutines(loadRoutines());
  }, []);

  // Timer for active step
  useEffect(() => {
    if (!isPlaying || !activeRoutine) return;
    const interval = setInterval(() => {
      setStepTimer((prev) => {
        const step = activeRoutine.steps[currentStepIdx];
        if (!step) return prev;
        const target = step.durationMinutes * 60;
        if (prev + 1 >= target) {
          // Auto-advance to next step
          handleNextStep();
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, activeRoutine, currentStepIdx]);

  const handleNextStep = useCallback(() => {
    if (!activeRoutine) return;
    const step = activeRoutine.steps[currentStepIdx];
    if (step) {
      // Record practice for completed step
      recordPractice({
        rudimentId: step.rudimentId,
        date: new Date().toISOString().slice(0, 10),
        durationSeconds: stepTimer > 0 ? stepTimer : step.durationMinutes * 60,
        bpm: step.targetBpm,
      });
    }
    if (currentStepIdx + 1 < activeRoutine.steps.length) {
      setCurrentStepIdx(currentStepIdx + 1);
      setStepTimer(0);
    } else {
      // Routine complete
      setIsPlaying(false);
      setViewMode("list");
      setActiveRoutine(null);
    }
  }, [activeRoutine, currentStepIdx, stepTimer]);

  const handlePlayRoutine = (routine: PracticeRoutine) => {
    setActiveRoutine(routine);
    setCurrentStepIdx(0);
    setStepTimer(0);
    setIsPlaying(true);
    setViewMode("play");
  };

  const handleAddStep = () => {
    const rudimentIds = Object.keys(ESSENTIAL_RUDIMENTS);
    const defaultId = rudimentIds[0];
    const r = ESSENTIAL_RUDIMENTS[defaultId];
    setNewSteps([
      ...newSteps,
      {
        id: `step-${Date.now()}`,
        rudimentId: defaultId,
        rudimentName: r.name,
        targetBpm: r.pattern.suggestedTempo.target,
        durationMinutes: 3,
        notes: "",
      },
    ]);
  };

  const handleStepChange = (idx: number, field: keyof RoutineStep, value: string | number) => {
    const updated = [...newSteps];
    if (field === "rudimentId") {
      const r = ESSENTIAL_RUDIMENTS[value as string];
      if (r) {
        updated[idx] = {
          ...updated[idx],
          rudimentId: value as string,
          rudimentName: r.name,
          targetBpm: r.pattern.suggestedTempo.target,
        };
      }
    } else {
      (updated[idx] as any)[field] = value;
    }
    setNewSteps(updated);
  };

  const handleRemoveStep = (idx: number) => {
    setNewSteps(newSteps.filter((_, i) => i !== idx));
  };

  const handleMoveStep = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= newSteps.length) return;
    const updated = [...newSteps];
    [updated[idx], updated[target]] = [updated[target], updated[idx]];
    setNewSteps(updated);
  };

  const handleSaveRoutine = () => {
    if (!newName.trim() || newSteps.length === 0) return;
    if (editingId) {
      updateRoutine(editingId, { name: newName.trim(), steps: newSteps });
    } else {
      createRoutine(newName.trim(), newSteps);
    }
    setRoutines(loadRoutines());
    setNewName("");
    setNewSteps([]);
    setEditingId(null);
    setViewMode("list");
  };

  const handleEditRoutine = (routine: PracticeRoutine) => {
    setEditingId(routine.id);
    setNewName(routine.name);
    setNewSteps([...routine.steps]);
    setViewMode("create");
  };

  const handleDeleteRoutine = (id: string) => {
    if (!confirm("Delete this routine?")) return;
    deleteRoutine(id);
    setRoutines(loadRoutines());
  };

  const rudimentOptions = Object.values(ESSENTIAL_RUDIMENTS).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // --- PLAY MODE ---
  if (viewMode === "play" && activeRoutine) {
    const step = activeRoutine.steps[currentStepIdx];
    const rudiment = step ? ESSENTIAL_RUDIMENTS[step.rudimentId] : null;
    const totalSteps = activeRoutine.steps.length;
    const progress = ((currentStepIdx + stepTimer / (step?.durationMinutes * 60 || 1)) / totalSteps) * 100;

    return (
      <Shell title={activeRoutine.name} subtitle={`Step ${currentStepIdx + 1} of ${totalSteps}`}>
        {/* Overall progress */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: "0.85rem" }}>
            <span>Routine Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div style={{ height: 6, background: "var(--stroke)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: "var(--ink)", transition: "width 0.5s" }} />
          </div>
        </div>

        {step && rudiment && (
          <>
            {/* Current step card */}
            <section className="card" style={{ borderLeft: "4px solid var(--ink)" }}>
              <div className="kicker">Current Step</div>
              <h2 className="card-title" style={{ margin: "4px 0" }}>{rudiment.name}</h2>
              <div style={{ fontFamily: "monospace", fontSize: "1.3rem", margin: "8px 0", letterSpacing: 2 }}>
                {rudiment.pattern.stickingPattern}
              </div>
              <div style={{ display: "flex", gap: 16, fontSize: "0.9rem", color: "var(--ink-muted)" }}>
                <span>Target: {step.targetBpm} BPM</span>
                <span>Duration: {step.durationMinutes} min</span>
              </div>
              {step.notes && <p style={{ marginTop: 8, fontSize: "0.85rem" }}>{step.notes}</p>}

              {/* Step timer */}
              <div style={{ marginTop: 16, textAlign: "center" }}>
                <div style={{ fontSize: "2rem", fontWeight: 700, fontFamily: "monospace" }}>
                  {formatTime(stepTimer)}
                </div>
                <div style={{ height: 4, background: "var(--stroke)", marginTop: 8, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${(stepTimer / (step.durationMinutes * 60)) * 100}%`,
                      background: "var(--ink)",
                      transition: "width 1s linear",
                    }}
                  />
                </div>
              </div>
            </section>

            {/* Metronome */}
            <EnhancedMetronome
              bpm={step.targetBpm}
              onBpmChange={() => {}}
              showGapControls={false}
              showTempoTrainer={false}
              showSoundOptions={true}
              showVisualPulse={true}
            />

            {/* Controls */}
            <section className="card">
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setIsPlaying(!isPlaying);
                  }}
                >
                  {isPlaying ? "Pause" : "Resume"}
                </button>
                <button className="btn" onClick={handleNextStep}>
                  {currentStepIdx + 1 < totalSteps ? "Next Step" : "Finish"}
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setIsPlaying(false);
                    setViewMode("list");
                    setActiveRoutine(null);
                  }}
                >
                  Exit
                </button>
              </div>
            </section>

            {/* Step list */}
            <section className="card">
              <div className="kicker">Steps</div>
              {activeRoutine.steps.map((s, i) => (
                <div
                  key={s.id}
                  style={{
                    padding: "8px 0",
                    borderBottom: "1px solid var(--stroke)",
                    opacity: i < currentStepIdx ? 0.5 : 1,
                    fontWeight: i === currentStepIdx ? 700 : 400,
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <span style={{ minWidth: 24, textAlign: "center", fontSize: "0.85rem" }}>
                    {i < currentStepIdx ? "[done]" : i === currentStepIdx ? ">" : `${i + 1}`}
                  </span>
                  <span style={{ flex: 1 }}>{s.rudimentName}</span>
                  <span style={{ fontSize: "0.8rem", color: "var(--ink-muted)" }}>
                    {s.targetBpm} BPM / {s.durationMinutes}m
                  </span>
                </div>
              ))}
            </section>
          </>
        )}
      </Shell>
    );
  }

  // --- CREATE/EDIT MODE ---
  if (viewMode === "create") {
    const totalMinutes = newSteps.reduce((s, step) => s + step.durationMinutes, 0);
    return (
      <Shell
        title={editingId ? "Edit Routine" : "Create Routine"}
        subtitle={`${newSteps.length} steps, ${totalMinutes} min total`}
      >
        <section className="card">
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
            Routine Name
          </label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g., Morning Warm-Up"
            style={{
              width: "100%",
              padding: "10px",
              background: "var(--bg)",
              border: "2px solid var(--stroke)",
              fontSize: "1rem",
              color: "var(--ink)",
            }}
          />
        </section>

        {/* Steps */}
        {newSteps.map((step, idx) => (
          <section className="card" key={step.id} style={{ position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontWeight: 700 }}>Step {idx + 1}</span>
              <div style={{ display: "flex", gap: 4 }}>
                <button className="btn btn-ghost btn-small" onClick={() => handleMoveStep(idx, -1)} disabled={idx === 0}>
                  Up
                </button>
                <button className="btn btn-ghost btn-small" onClick={() => handleMoveStep(idx, 1)} disabled={idx === newSteps.length - 1}>
                  Down
                </button>
                <button className="btn btn-ghost btn-small" onClick={() => handleRemoveStep(idx)}>
                  Remove
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 4 }}>
                  Rudiment
                </label>
                <select
                  value={step.rudimentId}
                  onChange={(e) => handleStepChange(idx, "rudimentId", e.target.value)}
                  style={{
                    width: "100%",
                    padding: 8,
                    background: "var(--bg)",
                    border: "1px solid var(--stroke)",
                    color: "var(--ink)",
                  }}
                >
                  {rudimentOptions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 4 }}>
                  BPM
                </label>
                <input
                  type="number"
                  min={30}
                  max={300}
                  value={step.targetBpm}
                  onChange={(e) => handleStepChange(idx, "targetBpm", parseInt(e.target.value) || 80)}
                  style={{
                    width: "100%",
                    padding: 8,
                    background: "var(--bg)",
                    border: "1px solid var(--stroke)",
                    color: "var(--ink)",
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 4 }}>
                Duration (minutes)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={step.durationMinutes}
                onChange={(e) => handleStepChange(idx, "durationMinutes", parseInt(e.target.value) || 3)}
                style={{
                  width: 80,
                  padding: 8,
                  background: "var(--bg)",
                  border: "1px solid var(--stroke)",
                  color: "var(--ink)",
                }}
              />
            </div>

            <div style={{ marginTop: 8 }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: 4 }}>
                Notes (optional)
              </label>
              <input
                type="text"
                value={step.notes}
                onChange={(e) => handleStepChange(idx, "notes", e.target.value)}
                placeholder="Focus on even dynamics..."
                style={{
                  width: "100%",
                  padding: 8,
                  background: "var(--bg)",
                  border: "1px solid var(--stroke)",
                  color: "var(--ink)",
                }}
              />
            </div>
          </section>
        ))}

        <section className="card" style={{ textAlign: "center" }}>
          <button className="btn btn-ghost" onClick={handleAddStep}>
            + Add Step
          </button>
        </section>

        <section className="card">
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button
              className="btn"
              onClick={handleSaveRoutine}
              disabled={!newName.trim() || newSteps.length === 0}
            >
              {editingId ? "Save Changes" : "Create Routine"}
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => {
                setViewMode("list");
                setEditingId(null);
                setNewName("");
                setNewSteps([]);
              }}
            >
              Cancel
            </button>
          </div>
        </section>
      </Shell>
    );
  }

  // --- LIST MODE ---
  return (
    <Shell title="Practice Routines" subtitle="Build and run custom practice sequences">
      <section className="card" style={{ textAlign: "center" }}>
        <p style={{ marginBottom: 12, color: "var(--ink-muted)" }}>
          Create sequences of rudiments with target tempos and durations.
          Run them with a built-in timer and metronome.
        </p>
        <button
          className="btn"
          onClick={() => {
            setEditingId(null);
            setNewName("");
            setNewSteps([]);
            setViewMode("create");
          }}
        >
          + New Routine
        </button>
      </section>

      {routines.length === 0 && (
        <section className="card" style={{ textAlign: "center", padding: "32px 16px" }}>
          <h2 className="card-title">No routines yet</h2>
          <p style={{ color: "var(--ink-muted)", marginTop: 8 }}>
            Create your first practice routine to get started.
            Each routine is a sequence of rudiments with tempos and timers.
          </p>
        </section>
      )}

      {/* Starter templates */}
      {routines.length === 0 && (
        <section className="card">
          <div className="kicker">Quick Start Templates</div>
          {[
            {
              name: "Beginner Warm-Up (15 min)",
              steps: [
                { id: "t1", rudimentId: "single-stroke-roll", rudimentName: "Single Stroke Roll", targetBpm: 80, durationMinutes: 5, notes: "Focus on even strokes" },
                { id: "t2", rudimentId: "double-stroke-roll", rudimentName: "Double Stroke Roll", targetBpm: 70, durationMinutes: 5, notes: "Let the stick bounce" },
                { id: "t3", rudimentId: "single-paradiddle", rudimentName: "Single Paradiddle", targetBpm: 70, durationMinutes: 5, notes: "Accent the first note" },
              ],
            },
            {
              name: "Flam Focus (20 min)",
              steps: [
                { id: "t4", rudimentId: "single-stroke-roll", rudimentName: "Single Stroke Roll", targetBpm: 90, durationMinutes: 3, notes: "Warm-up" },
                { id: "t5", rudimentId: "flam", rudimentName: "Flam", targetBpm: 70, durationMinutes: 5, notes: "Tight grace notes" },
                { id: "t6", rudimentId: "flam-accent", rudimentName: "Flam Accent", targetBpm: 65, durationMinutes: 5, notes: "" },
                { id: "t7", rudimentId: "flam-tap", rudimentName: "Flam Tap", targetBpm: 60, durationMinutes: 4, notes: "" },
                { id: "t8", rudimentId: "flamacue", rudimentName: "Flamacue", targetBpm: 55, durationMinutes: 3, notes: "" },
              ],
            },
            {
              name: "Speed Builder (15 min)",
              steps: [
                { id: "t9", rudimentId: "single-stroke-roll", rudimentName: "Single Stroke Roll", targetBpm: 100, durationMinutes: 3, notes: "Start here" },
                { id: "t10", rudimentId: "single-stroke-roll", rudimentName: "Single Stroke Roll", targetBpm: 120, durationMinutes: 3, notes: "Push tempo" },
                { id: "t11", rudimentId: "single-stroke-roll", rudimentName: "Single Stroke Roll", targetBpm: 140, durationMinutes: 3, notes: "Near max" },
                { id: "t12", rudimentId: "double-stroke-roll", rudimentName: "Double Stroke Roll", targetBpm: 100, durationMinutes: 3, notes: "Apply to doubles" },
                { id: "t13", rudimentId: "double-stroke-roll", rudimentName: "Double Stroke Roll", targetBpm: 120, durationMinutes: 3, notes: "Push doubles" },
              ],
            },
          ].map((template) => (
            <button
              key={template.name}
              className="btn btn-ghost"
              style={{ display: "block", width: "100%", textAlign: "left", marginBottom: 8, padding: "12px" }}
              onClick={() => {
                createRoutine(template.name, template.steps);
                setRoutines(loadRoutines());
              }}
            >
              <strong>{template.name}</strong>
              <div style={{ fontSize: "0.8rem", color: "var(--ink-muted)", marginTop: 2 }}>
                {template.steps.length} steps --{" "}
                {template.steps.map((s) => s.rudimentName).join(", ")}
              </div>
            </button>
          ))}
        </section>
      )}

      {/* Routine list */}
      {routines.map((routine) => {
        const totalMin = routine.steps.reduce((s, step) => s + step.durationMinutes, 0);
        return (
          <section className="card" key={routine.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h2 className="card-title" style={{ margin: 0 }}>{routine.name}</h2>
                <div style={{ fontSize: "0.85rem", color: "var(--ink-muted)", marginTop: 4 }}>
                  {routine.steps.length} steps -- {totalMin} min
                </div>
              </div>
              <button className="btn" onClick={() => handlePlayRoutine(routine)}>
                Play
              </button>
            </div>

            {/* Steps preview */}
            <div style={{ marginTop: 12 }}>
              {routine.steps.map((step, i) => (
                <div
                  key={step.id}
                  style={{
                    padding: "6px 0",
                    borderBottom: i < routine.steps.length - 1 ? "1px solid var(--stroke)" : "none",
                    display: "flex",
                    gap: 8,
                    fontSize: "0.9rem",
                  }}
                >
                  <span style={{ minWidth: 20, color: "var(--ink-muted)" }}>{i + 1}.</span>
                  <span style={{ flex: 1 }}>{step.rudimentName}</span>
                  <span style={{ color: "var(--ink-muted)" }}>
                    {step.targetBpm} BPM / {step.durationMinutes}m
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button className="btn btn-ghost btn-small" onClick={() => handleEditRoutine(routine)}>
                Edit
              </button>
              <button className="btn btn-ghost btn-small" onClick={() => handleDeleteRoutine(routine.id)}>
                Delete
              </button>
            </div>
          </section>
        );
      })}

      <section className="card">
        <div className="row">
          <Link href="/drum/today" className="btn btn-ghost">Back to Today</Link>
          <Link href="/drum/rudiments" className="btn btn-ghost">Rudiments</Link>
        </div>
      </section>
    </Shell>
  );
}
