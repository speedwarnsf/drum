"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from "react";
import Shell from "../_ui/Shell";
import {
  loadProfile,
  loadProfileFromSupabase,
  saveLog,
  loadLogs,
  clearAllLocal,
  loadLastPlan,
  saveProfile,
  getModuleProgress,
  Profile,
} from "../_lib/drumMvp";
import ReflectionJournal, { ReflectionEntry } from "../_ui/ReflectionJournal";
import { ErrorBoundary } from "../_ui/ErrorBoundary";
import { LoadingSpinner, InlineSpinner } from "../_ui/LoadingSpinner";
import { OfflineIndicator, useOnlineStatus } from "../_ui/OfflineIndicator";

export default function DrumJournalPage() {
  return (
    <ErrorBoundary>
      <JournalPageInner />
      <OfflineIndicator />
    </ErrorBoundary>
  );
}

function JournalPageInner() {
  const { isOnline } = useOnlineStatus();
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentModule, setCurrentModule] = useState(1);
  
  const [broke, setBroke] = useState<
    "time" | "control" | "coordination" | "feel" | "nothing"
  >("time");
  const [felt, setFelt] = useState<"easier" | "right" | "harder">("right");
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState<string | null>(null);
  const [reflection, setReflection] = useState<ReflectionEntry | null>(null);

  const [count, setCount] = useState(0);
  const [sessionId] = useState(() => `session_${Date.now()}`);

  useEffect(() => {
    const p = loadProfile();
    if (p) {
      setProfile(p);
      setCount(loadLogs().length);
      setReady(true);
      // Load module progress for reflection prompts
      getModuleProgress().then((data) => {
        if (data) setCurrentModule(data.currentModule);
      });
      return;
    }
    
    if (isOnline) {
      loadProfileFromSupabase()
        .then((remote) => {
          if (remote) {
            saveProfile(remote);
            setProfile(remote);
            setCount(loadLogs().length);
            setReady(true);
            getModuleProgress().then((data) => {
              if (data) setCurrentModule(data.currentModule);
            });
            return;
          }
          window.location.href = "/drum/start";
        })
        .catch((err) => {
          console.error("[Drum] Failed to load profile:", err);
          window.location.href = "/drum/start";
        });
    } else {
      // Offline with no local profile
      window.location.href = "/drum/start";
    }
  }, [isOnline]);

  const validateNote = (value: string) => {
    if (value.length > 140) {
      setNoteError("Note is too long (max 140 characters)");
      return false;
    }
    setNoteError(null);
    return true;
  };

  const handleReflectionSave = (entry: ReflectionEntry) => {
    setReflection(entry);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate
    if (!validateNote(note)) {
      return;
    }
    
    setSaving(true);
    try {
      const plan = loadLastPlan();
      
      // Combine regular note with reflection data if available
      let combinedNote = note.trim();
      if (reflection) {
        const reflectionSummary = [
          reflection.stop && `STOP: ${reflection.stop}`,
          reflection.start && `START: ${reflection.start}`,
          reflection.continue && `CONTINUE: ${reflection.continue}`,
        ].filter(Boolean).join(" | ");
        
        if (reflectionSummary) {
          combinedNote = combinedNote 
            ? `${combinedNote} [${reflectionSummary}]` 
            : reflectionSummary;
        }
      }
      
      saveLog({
        broke,
        felt,
        note: combinedNote || undefined,
      }, plan ?? undefined);
      
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/drum/today";
      }, 500);
    } catch (err) {
      console.error("[Drum] Failed to save log:", err);
      setError("Failed to save your log. Please try again.");
      setSaving(false);
    }
  };

  if (!ready) {
    return (
      <Shell title="Log today" subtitle="Loading...">
        <section className="card">
          <LoadingSpinner message="Loading..." />
        </section>
      </Shell>
    );
  }

  return (
    <Shell title="Log today" subtitle="This is how the system adapts: simple and honest.">
      {/* Quick Assessment */}
      <section className="card">
        <div className="kicker">Quick Assessment</div>
        {error && (
          <div className="form-error">
            <span className="form-error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="form-success">
            <span className="form-success-icon">✓</span>
            <span>Session logged! Redirecting...</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="form-grid">
          <Field label="What broke first?">
            <select
              value={broke}
              onChange={(e) => setBroke(e.target.value as typeof broke)}
            >
              <option value="time">Time</option>
              <option value="control">Control</option>
              <option value="coordination">Coordination</option>
              <option value="feel">Feel</option>
              <option value="nothing">Nothing major</option>
            </select>
          </Field>

          <Field label="How did it feel?">
            <select
              value={felt}
              onChange={(e) => setFelt(e.target.value as typeof felt)}
            >
              <option value="easier">Easier than expected</option>
              <option value="right">About right</option>
              <option value="harder">Harder than expected</option>
            </select>
          </Field>

          <Field label="Quick note (optional)">
            <input
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                validateNote(e.target.value);
              }}
              maxLength={140}
              placeholder="e.g., left hand got tense at 60 BPM"
              className={noteError ? "field-error" : ""}
            />
            {noteError && (
              <span className="field-error-message">
                <span className="field-error-icon">⚠️</span>
                {noteError}
              </span>
            )}
            <span className="tiny" style={{ marginTop: 4 }}>
              {note.length}/140 characters
            </span>
          </Field>

          {/* Stop-Start-Continue Reflection */}
          <ReflectionJournal
            sessionId={sessionId}
            moduleId={currentModule}
            onSave={handleReflectionSave}
            compact
          />

          <button type="submit" className="btn" disabled={saving || success} style={{ marginTop: 16 }}>
            {saving ? (
              <>
                Saving
                <InlineSpinner />
              </>
            ) : success ? (
              "✓ Saved!"
            ) : (
              "Save Session Log"
            )}
          </button>

          <p className="tiny">
            Logs so far: {count}
            {!isOnline && " (Offline - will sync when connected)"}
          </p>
        </form>
      </section>

      <section className="card">
        <h2 className="card-title">Admin</h2>
        <p className="sub">
          Reset local progress on this device (profile + logs). Useful for testing.
        </p>
        <button
          type="button"
          onClick={() => {
            clearAllLocal();
            window.location.href = "/drum/start";
          }}
          className="btn btn-ghost"
        >
          Reset local progress
        </button>
      </section>
    </Shell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
/* eslint-enable react-hooks/set-state-in-effect */
