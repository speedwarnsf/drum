export default function Loading() {
  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-bounce">
          <div className="text-4xl mb-4" style={{ display: "flex", justifyContent: "center" }}><svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor" aria-hidden="true"><ellipse cx="12" cy="14" rx="8" ry="5" stroke="currentColor" strokeWidth="2" fill="none"/><line x1="4" y1="14" x2="4" y2="9" stroke="currentColor" strokeWidth="2"/><line x1="20" y1="14" x2="20" y2="9" stroke="currentColor" strokeWidth="2"/><ellipse cx="12" cy="9" rx="8" ry="5" stroke="currentColor" strokeWidth="2" fill="none"/></svg></div>
          <p className="text-stone-400 text-sm">Loading your practice session...</p>
        </div>
      </div>
    </div>
  );
}
