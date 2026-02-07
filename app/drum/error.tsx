"use client";

import { useEffect } from "react";
import { Icon } from "./_ui/Icon";

export default function DrumError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for debugging
    console.error("[Drum Practice] Route error:", error);
  }, [error]);

  return (
    <main className="shell shell-tight">
      <div className="shell-header">
        <h1 className="title">Something went off-beat</h1>
        <p className="sub">
          Even the best drummers drop a stick sometimes. Let&apos;s get you back on track.
        </p>
      </div>

      <section className="card error-page-card">
        <div className="error-page-icon"><Icon name="drum" size={48} /></div>
        <h2 className="card-title">Don&apos;t worry</h2>
        <p>Your practice data is safe. This was just a temporary hiccup.</p>
        
        <div className="row" style={{ marginTop: 20 }}>
          <button onClick={reset} className="btn">
            Try again
          </button>
          <a href="/drum/today" className="btn btn-ghost">
            Back to today&apos;s practice
          </a>
        </div>

        {process.env.NODE_ENV === "development" && (
          <details className="error-page-details">
            <summary>Technical details (dev only)</summary>
            <pre className="error-page-stack">
              {error.message}
              {error.digest && `\nDigest: ${error.digest}`}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </section>

      <section className="card">
        <h2 className="card-title">Quick links</h2>
        <div className="row">
          <a href="/drum" className="btn btn-ghost">Home</a>
          <a href="/drum/history" className="btn btn-ghost">History</a>
          <a href="/drum/progress" className="btn btn-ghost">Progress</a>
        </div>
      </section>
    </main>
  );
}
