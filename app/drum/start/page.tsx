"use client";

/* eslint-disable react-hooks-set-state-in-effect */
import React, { useEffect, useState } from "react";
import Shell from "../_ui/Shell";
import { Profile, loadProfile, loadProfileFromSupabase, saveProfile } from "../_lib/drumMvp";
import { ErrorBoundary } from "../_ui/ErrorBoundary";
import { LoadingSpinner, InlineSpinner } from "../_ui/LoadingSpinner";
import { OfflineIndicator, useOnlineStatus } from "../_ui/OfflineIndicator";

export default function DrumStartPage() {
  return (
    <ErrorBoundary>
      <StartPageInner />
      <OfflineIndicator />
    </ErrorBoundary>
  );
}

function StartPageInner() {
  const { isOnline } = useOnlineStatus();
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [level, setLevel] = useState<Profile["level"]>("true_beginner");
  const [kit, setKit] = useState<Profile["kit"]>("roland_edrum");
  const [minutes, setMinutes] = useState<Profile["minutes"]>(15);
  const [goal, setGoal] = useState<Profile["goal"]>("comfort_time");

  useEffect(() => {
    const local = loadProfile();
    if (local) {
      setLevel(local.level);
      setKit(local.kit);
      setMinutes(local.minutes);
      setGoal(local.goal);
    }
    
    if (isOnline) {
      loadProfileFromSupabase()
        .then((remote) => {
          if (!remote) return;
          setLevel(remote.level);
          setKit(remote.kit);
          setMinutes(remote.minutes);
          setGoal(remote.goal);
          saveProfile(remote);
        })
        .catch((err) => {
          console.error("[Drum] Failed to load remote profile:", err);
          // Continue with local or defaults
        })
        .finally(() => setReady(true));
    } else {
      setReady(true);
    }
  }, [isOnline]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate
    if (!level || !kit || !goal) {
      setError("Please fill in all fields");
      return;
    }
    
    if (minutes < 5 || minutes > 60) {
      setError("Practice time should be between 5 and 60 minutes");
      return;
    }
    
    setSaving(true);
    try {
      saveProfile({ level, kit, minutes, goal });
      window.location.href = "/drum/today";
    } catch (err) {
      console.error("[Drum] Failed to save profile:", err);
      setError("Failed to save your profile. Please try again.");
      setSaving(false);
    }
  };

  if (!ready) {
    return (
      <Shell title="Setup" subtitle="Loading your profile...">
        <section className="card">
          <LoadingSpinner message="Loading profile..." />
        </section>
      </Shell>
    );
  }

  return (
    <Shell title="Setup" subtitle="60 seconds. This is intentionally simple.">
      <section className="card">
        {error && (
          <div className="form-error">
            <span className="form-error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="form-grid">
          <Field label="Experience">
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as Profile["level"])}
            >
              <option value="true_beginner">Barely ever drummed</option>
              <option value="beginner">Beginner</option>
              <option value="rusty">Rusty</option>
            </select>
          </Field>

          <Field label="Kit">
            <select
              value={kit}
              onChange={(e) => setKit(e.target.value as Profile["kit"])}
            >
              <option value="roland_edrum">Roland e-drum kit</option>
              <option value="other_edrum">Other electronic kit</option>
              <option value="acoustic">Acoustic kit</option>
            </select>
          </Field>

          <Field label="Daily practice time">
            <select
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
            >
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={20}>20 minutes</option>
              <option value={30}>30 minutes</option>
            </select>
          </Field>

          <Field label="Primary goal">
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value as Profile["goal"])}
            >
              <option value="comfort_time">Comfort + steady time</option>
              <option value="basic_grooves">Basic grooves</option>
              <option value="play_music">Play along to songs</option>
            </select>
          </Field>

          <button type="submit" className="btn" disabled={saving}>
            {saving ? (
              <>
                Saving
                <InlineSpinner />
              </>
            ) : (
              "Save and go to today's card"
            )}
          </button>

          <p className="tiny">
            Profile is saved once and kept in sync with your account as you progress.
            {!isOnline && " (Currently offline - data will sync when connected)"}
          </p>
        </form>
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
