"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-900 text-white flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-6" style={{ display: "flex", justifyContent: "center" }}><svg viewBox="0 0 24 24" width="64" height="64" fill="currentColor" aria-hidden="true"><path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2ZM11,7a1,1,0,0,1,2,0v6a1,1,0,0,1-2,0Zm1,12a1.5,1.5,0,1,1,1.5-1.5A1.5,1.5,0,0,1,12,19Z"/></svg></div>
          <h1 className="text-2xl font-semibold mb-3">Critical Error</h1>
          <p className="text-stone-400 mb-6">
            Something went seriously wrong. Please try refreshing the page.
          </p>
          {error.digest && (
            <p className="text-xs text-stone-600 mb-6 font-mono">
              Error ID: {error.digest}
            </p>
          )}
          <button
            onClick={() => reset()}
            className="bg-amber-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-amber-400"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
