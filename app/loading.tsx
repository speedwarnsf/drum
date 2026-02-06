export default function Loading() {
  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-bounce">
          <div className="text-4xl mb-4">🥁</div>
          <p className="text-stone-400 text-sm">Loading your practice session...</p>
        </div>
      </div>
    </div>
  );
}
