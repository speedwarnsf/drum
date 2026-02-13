import { AuthHomeButtons, AuthSetupButton } from "./_ui/AuthControls";

export default async function DrumHome() {
  return (
    <div className="shell">
      <header className="shell-header">
        <div className="shell-head">
          <div>
            <div className="kicker">RepoDrum</div>
            <h1 className="title">Your daily practice system</h1>
            <p className="sub">
              Deliberate practice blocks with clear stop points.
              No video dependency. Just you, a pad, and honest feedback.
            </p>
            <div className="row" style={{ marginTop: 16 }}>
              <a className="btn" href="/drum/today">
                Start practicing
              </a>
              <AuthSetupButton />
              <AuthHomeButtons />
            </div>
          </div>
        </div>
      </header>

      <section className="grid" style={{ marginTop: 8 }}>
        <article className="card">
          <div className="kicker" style={{ marginBottom: 6 }}>Structure</div>
          <h2 className="card-title">Focused blocks</h2>
          <p>
            Each block has a purpose and a stop cue. Short sessions
            that reduce decision fatigue and build trust in the process.
          </p>
        </article>
        <article className="card">
          <div className="kicker" style={{ marginBottom: 6 }}>Method</div>
          <h2 className="card-title">Text + audio only</h2>
          <p>
            No video loops. You develop your internal clock, listening,
            and clean sound faster when you rely on your ears.
          </p>
        </article>
        <article className="card">
          <div className="kicker" style={{ marginBottom: 6 }}>Adaptation</div>
          <h2 className="card-title">Honest feedback loop</h2>
          <p>
            Report what broke. The next card responds. No sensors needed --
            just your assessment of what happened.
          </p>
        </article>
        <article className="card">
          <div className="kicker" style={{ marginBottom: 6 }}>Tools</div>
          <h2 className="card-title">Metronome + drills + tracking</h2>
          <p>
            Built-in metronome with gap drills, 40 PAS rudiments,
            spaced repetition, and practice streaks.
          </p>
        </article>
      </section>

      <section style={{ marginTop: 24 }}>
        <div className="card" style={{ textAlign: "center", padding: "24px 18px" }}>
          <div className="kicker" style={{ marginBottom: 8 }}>Quick links</div>
          <div className="row" style={{ justifyContent: "center" }}>
            <a className="btn btn-ghost" href="/drum/warmup">Warm-up</a>
            <a className="btn btn-ghost" href="/drum/drills">Drills</a>
            <a className="btn btn-ghost" href="/drum/patterns">Patterns</a>
            <a className="btn btn-ghost" href="/drum/method">Method</a>
            <a className="btn btn-ghost" href="/drum/journal">Log</a>
          </div>
        </div>
      </section>
    </div>
  );
}
