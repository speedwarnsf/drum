"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-stone-900 text-white flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="text-6xl mb-6">🥁</div>
        <h1 className="text-2xl font-semibold mb-3">Missed a beat</h1>
        <p className="text-stone-400 mb-6">
          Something went wrong. Let&apos;s pick it up from the top.
        </p>
        {error.digest && (
          <p className="text-xs text-stone-600 mb-6 font-mono">
            Error ID: {error.digest}
          </p>
        )}
        <button
          onClick={() => reset()}
          className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-amber-400"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
