"use client";

import React from "react";

interface SkeletonCardProps {
  lines?: number;
  showTitle?: boolean;
  showMeta?: boolean;
  className?: string;
}

export function SkeletonCard({
  lines = 3,
  showTitle = true,
  showMeta = false,
  className = "",
}: SkeletonCardProps) {
  return (
    <div className={`card skeleton-card ${className}`}>
      {showMeta && <div className="skeleton skeleton-meta" />}
      {showTitle && <div className="skeleton skeleton-title" />}
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton skeleton-line"
          style={{ width: `${85 - i * 10}%` }}
        />
      ))}
    </div>
  );
}

// Skeleton for practice block cards
export function SkeletonPracticeBlock() {
  return (
    <article className="card skeleton-card">
      <div className="skeleton-header">
        <div className="skeleton skeleton-title" style={{ width: "60%" }} />
        <div className="skeleton skeleton-meta" style={{ width: "15%" }} />
      </div>
      <div className="skeleton skeleton-timer" />
      <div className="skeleton-list">
        <div className="skeleton skeleton-line" style={{ width: "90%" }} />
        <div className="skeleton skeleton-line" style={{ width: "75%" }} />
        <div className="skeleton skeleton-line" style={{ width: "85%" }} />
      </div>
    </article>
  );
}

// Skeleton for the full today page
export function SkeletonTodayPage() {
  return (
    <>
      {/* Coach line card */}
      <SkeletonCard lines={2} showTitle={false} showMeta />
      
      {/* Setup guide skeleton */}
      <div className="setup-guide skeleton-setup">
        <div className="skeleton skeleton-line" style={{ width: "40%" }} />
      </div>
      
      {/* Metronome skeleton */}
      <div className="card skeleton-card">
        <div className="skeleton skeleton-title" style={{ width: "30%" }} />
        <div className="skeleton skeleton-meta" style={{ width: "50%" }} />
      </div>
      
      {/* Practice blocks */}
      <SkeletonPracticeBlock />
      <SkeletonPracticeBlock />
      <SkeletonPracticeBlock />
    </>
  );
}

// Skeleton for session history list
export function SkeletonSessionList({ count = 3 }: { count?: number }) {
  return (
    <div className="skeleton-list">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-session-item">
          <div className="skeleton skeleton-line" style={{ width: "70%" }} />
          <div className="skeleton skeleton-meta" style={{ width: "40%" }} />
        </div>
      ))}
    </div>
  );
}

// Skeleton for stats cards
export function SkeletonStatsCard() {
  return (
    <div className="card skeleton-card">
      <div className="stats-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton-stat">
            <div className="skeleton skeleton-stat-value" />
            <div className="skeleton skeleton-stat-label" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton for calendar heatmap
export function SkeletonCalendar() {
  return (
    <div className="card skeleton-card">
      <div className="skeleton skeleton-title" style={{ width: "35%" }} />
      <div className="skeleton skeleton-calendar" />
    </div>
  );
}

export default SkeletonCard;
