"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  getPatternsDueForReview,
  recordPatternPractice,
  getPatternStats,
  PatternWithMemory,
  SIMPLE_RATINGS,
  DRUM_PATTERNS,
} from "../_lib/spacedRepetition";
import { getSupabaseClient } from "../_lib/supabaseClient";
import LoadingSpinner from "./LoadingSpinner";

type MaintenanceState = "loading" | "ready" | "practicing" | "complete" | "no-auth";

type Stats = {
  totalPatterns: number;
  learnedPatterns: number;
  dueToday: number;
  averageEase: number;
  longestInterval: number;
  streakPatterns: number;
};

export default function MaintenanceMode() {
  const [state, setState] = useState<MaintenanceState>("loading");
  const [userId, setUserId] = useState<string | null>(null);
  const [duePatterns, setDuePatterns] = useState<PatternWithMemory[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stats, setStats] = useState<Stats | null>(null);
  const [completedToday, setCompletedToday] = useState<string[]>([]);
  const [showDescription, setShowDescription] = useState(false);

  // Load user and patterns
  useEffect(() => {
    async function init() {
      const supabase = getSupabaseClient();
      if (!supabase) {
        setState("no-auth");
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) {
        setState("no-auth");
        return;
      }

      setUserId(user.id);

      // Load patterns and stats
      const [patterns, patternStats] = await Promise.all([
        getPatternsDueForReview(user.id),
        getPatternStats(user.id),
      ]);

      const due = patterns.filter((p) => p.isDue);
      setDuePatterns(due);
      setStats(patternStats);
      setState(due.length > 0 ? "ready" : "complete");
    }

    init();
  }, []);

  const currentPattern = duePatterns[currentIndex];

  const handleRating = useCallback(async (quality: number) => {
    if (!userId || !currentPattern) return;

    // Record the practice
    await recordPatternPractice(userId, currentPattern.pattern.id, quality);
    setCompletedToday((prev) => [...prev, currentPattern.pattern.id]);

    // Move to next pattern or complete
    if (currentIndex < duePatterns.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowDescription(false);
    } else {
      // Refresh stats
      const newStats = await getPatternStats(userId);
      setStats(newStats);
      setState("complete");
    }
  }, [userId, currentPattern, currentIndex, duePatterns.length]);

  const handleStartPractice = () => {
    setState("practicing");
    setCurrentIndex(0);
    setShowDescription(false);
  };

  const handleSkip = () => {
    if (currentIndex < duePatterns.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowDescription(false);
    } else {
      setState("complete");
    }
  };

  // Loading state
  if (state === "loading") {
    return (
      <section className="card maintenance-card">
        <div className="maintenance-loading">
          <LoadingSpinner />
          <p className="sub">Gathering your patterns...</p>
        </div>
      </section>
    );
  }

  // Not authenticated
  if (state === "no-auth") {
    return (
      <section className="card maintenance-card">
        <div className="kicker">Maintenance Mode</div>
        <h2 className="card-title">The Quiet Work</h2>
        <p className="sub">
          Sign in to track your pattern memory. The body remembers what the mind forgets.
        </p>
        <div className="row" style={{ marginTop: 16 }}>
          <a href="/drum/login" className="btn">Sign In</a>
        </div>
      </section>
    );
  }

  // Complete state
  if (state === "complete") {
    return (
      <section className="card maintenance-card maintenance-complete">
        <div className="maintenance-complete-icon">✓</div>
        <div className="kicker">Maintenance Complete</div>
        <h2 className="card-title">
          {completedToday.length > 0 
            ? "Patterns Reinforced" 
            : "Nothing Due Today"}
        </h2>
        
        {completedToday.length > 0 && (
          <p className="maintenance-complete-count">
            {completedToday.length} pattern{completedToday.length !== 1 ? "s" : ""} reviewed
          </p>
        )}

        {stats && (
          <div className="maintenance-stats">
            <div className="maintenance-stat">
              <span className="maintenance-stat-value">{stats.learnedPatterns}/{stats.totalPatterns}</span>
              <span className="maintenance-stat-label">Patterns Learned</span>
            </div>
            <div className="maintenance-stat">
              <span className="maintenance-stat-value">{stats.streakPatterns}</span>
              <span className="maintenance-stat-label">Locked In</span>
            </div>
            <div className="maintenance-stat">
              <span className="maintenance-stat-value">{stats.longestInterval}d</span>
              <span className="maintenance-stat-label">Longest Interval</span>
            </div>
          </div>
        )}

        <p className="sub" style={{ marginTop: 16 }}>
          Return tomorrow. The spacing matters.
        </p>

        <div className="row" style={{ marginTop: 16 }}>
          <a href="/drum/today" className="btn">Back to Practice</a>
          <a href="/drum/progress" className="btn btn-ghost">View Progress</a>
        </div>
      </section>
    );
  }

  // Ready state - show overview
  if (state === "ready") {
    return (
      <section className="card maintenance-card">
        <div className="kicker">Maintenance Mode</div>
        <h2 className="card-title">The Quiet Work</h2>
        <p>
          {duePatterns.length} pattern{duePatterns.length !== 1 ? "s" : ""} due for review.
          Quick recall check—no kit required.
        </p>

        <div className="maintenance-due-list">
          {duePatterns.slice(0, 5).map((p) => (
            <div key={p.pattern.id} className="maintenance-due-item">
              <span className="maintenance-due-name">{p.pattern.name}</span>
              <span className="maintenance-due-module">Module {p.pattern.module}</span>
            </div>
          ))}
          {duePatterns.length > 5 && (
            <div className="maintenance-due-more">
              +{duePatterns.length - 5} more
            </div>
          )}
        </div>

        {stats && (
          <div className="maintenance-preview-stats">
            <span>{stats.learnedPatterns} learned</span>
            <span>·</span>
            <span>{stats.streakPatterns} locked in</span>
          </div>
        )}

        <div className="row" style={{ marginTop: 20 }}>
          <button className="btn" onClick={handleStartPractice}>
            Begin Review
          </button>
          <a href="/drum/today" className="btn btn-ghost">
            Skip for Now
          </a>
        </div>
      </section>
    );
  }

  // Practicing state
  if (state === "practicing" && currentPattern) {
    const progress = ((currentIndex + 1) / duePatterns.length) * 100;
    const patternInfo = DRUM_PATTERNS.find((p) => p.id === currentPattern.pattern.id);

    return (
      <section className="card maintenance-card maintenance-practice">
        {/* Progress bar */}
        <div className="maintenance-progress">
          <div 
            className="maintenance-progress-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="maintenance-progress-text">
          {currentIndex + 1} of {duePatterns.length}
        </div>

        {/* Pattern card */}
        <div className="maintenance-pattern">
          <div className="maintenance-pattern-module">Module {currentPattern.pattern.module}</div>
          <h2 className="maintenance-pattern-name">{currentPattern.pattern.name}</h2>
          
          <button 
            className="maintenance-reveal-btn"
            onClick={() => setShowDescription(!showDescription)}
          >
            {showDescription ? "Hide" : "Show"} Description
          </button>

          {showDescription && (
            <p className="maintenance-pattern-desc">
              {patternInfo?.description}
            </p>
          )}

          {currentPattern.memory && (
            <div className="maintenance-pattern-memory">
              <span>Last: {currentPattern.memory.last_quality !== null 
                ? SIMPLE_RATINGS.find(r => r.quality >= (currentPattern.memory?.last_quality ?? 0))?.label 
                : "New"}</span>
              <span>·</span>
              <span>Interval: {currentPattern.memory.interval_days}d</span>
            </div>
          )}
        </div>

        {/* Prompt */}
        <div className="maintenance-prompt">
          <p className="maintenance-prompt-text">
            Can you execute this pattern cleanly, right now?
          </p>
          <p className="maintenance-prompt-sub">
            Visualize it. Feel it in your hands. How solid is it?
          </p>
        </div>

        {/* Rating buttons */}
        <div className="maintenance-ratings">
          {SIMPLE_RATINGS.map((rating) => (
            <button
              key={rating.quality}
              className="maintenance-rating-btn"
              onClick={() => handleRating(rating.quality)}
            >
              <span className="maintenance-rating-emoji">{rating.emoji}</span>
              <span className="maintenance-rating-label">{rating.label}</span>
              <span className="maintenance-rating-desc">{rating.description}</span>
            </button>
          ))}
        </div>

        {/* Skip option */}
        <button className="maintenance-skip" onClick={handleSkip}>
          Skip this pattern
        </button>
      </section>
    );
  }

  return null;
}
