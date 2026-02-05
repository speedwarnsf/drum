"use client";

import React from "react";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  message?: string;
  className?: string;
}

export function LoadingSpinner({
  size = "medium",
  message,
  className = "",
}: LoadingSpinnerProps) {
  const sizeClass = `loading-spinner-${size}`;
  
  return (
    <div className={`loading-spinner-container ${className}`}>
      <div className={`loading-spinner ${sizeClass}`}>
        <div className="loading-spinner-dot" />
        <div className="loading-spinner-dot" />
        <div className="loading-spinner-dot" />
      </div>
      {message && <p className="loading-spinner-message">{message}</p>}
    </div>
  );
}

// Inline spinner for buttons/small areas
export function InlineSpinner({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-spinner ${className}`}>
      <span className="inline-spinner-dot" />
      <span className="inline-spinner-dot" />
      <span className="inline-spinner-dot" />
    </span>
  );
}

// Full page loading overlay
export function LoadingOverlay({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="loading-overlay">
      <div className="loading-overlay-content">
        <div className="loading-spinner loading-spinner-large">
          <div className="loading-spinner-dot" />
          <div className="loading-spinner-dot" />
          <div className="loading-spinner-dot" />
        </div>
        <p className="loading-overlay-message">{message}</p>
      </div>
    </div>
  );
}

// Loading state for AI generation with progress indication
export function AILoadingState({ stage = "thinking" }: { stage?: "thinking" | "generating" | "finalizing" }) {
  const messages = {
    thinking: "Quiet Master is thinking...",
    generating: "Crafting your practice plan...",
    finalizing: "Almost ready...",
  };

  return (
    <div className="ai-loading">
      <div className="ai-loading-icon">🧘</div>
      <div className="ai-loading-content">
        <p className="ai-loading-message">{messages[stage]}</p>
        <div className="ai-loading-bar">
          <div className="ai-loading-bar-fill" />
        </div>
        <p className="ai-loading-hint">
          {stage === "thinking" && "Reviewing your recent sessions..."}
          {stage === "generating" && "Tailoring exercises to your level..."}
          {stage === "finalizing" && "Adding finishing touches..."}
        </p>
      </div>
    </div>
  );
}

export default LoadingSpinner;
