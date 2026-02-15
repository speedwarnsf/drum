import { AuthHomeButtons, AuthSetupButton } from "./_ui/AuthControls";
import RandomRudimentButton from "./_ui/RandomRudimentButton";
import { WhatsNewButton } from "./_ui/WhatsNew";

export default async function DrumHome() {
  return (
    <div className="shell">
      <header className="shell-header">
        <div className="shell-head">
          <div>
            <div className="kicker">RepoDrum</div>
            <h1 className="title" style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)", lineHeight: 1.15 }}>
              Your daily practice system
            </h1>
            <p className="sub" style={{ maxWidth: 480, lineHeight: 1.6 }}>
              Deliberate practice blocks with clear stop points.
              No video dependency. Just you, a pad, and honest feedback.
            </p>
            <div className="row" style={{ marginTop: 16, gap: 8 }}>
              <a className="btn" href="/drum/today">
                Start practicing
              </a>
              <AuthSetupButton />
              <AuthHomeButtons />
            </div>
          </div>
        </div>
      </header>

      {/* Quick actions */}
      <section className="card" style={{ padding: "16px 18px" }}>
        <div className="kicker" style={{ marginBottom: 8 }}>Quick start</div>
        <div className="row" style={{ justifyContent: "flex-start", gap: 8, flexWrap: "wrap" }}>
          <a className="btn btn-ghost" href="/drum/warmup">Warm-up</a>
          <a className="btn btn-ghost" href="/drum/drills">Drills</a>
          <a className="btn btn-ghost" href="/drum/rudiments">All Rudiments</a>
          <RandomRudimentButton />
          <a className="btn btn-ghost" href="/drum/practice-log">Practice Log</a>
        </div>
      </section>

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
          <div className="kicker" style={{ marginBottom: 6 }}>40 Rudiments</div>
          <h2 className="card-title">Complete PAS library</h2>
          <p>
            Every essential rudiment with notation, sticking patterns, accent maps,
            and difficulty levels. Track your mastery of each one.
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
            Built-in metronome with gap drills, spaced repetition,
            practice streaks, achievements, and CSV export.
          </p>
        </article>
      </section>

      {/* Feature highlights */}
      <section style={{ marginTop: 12 }}>
        <div className="card" style={{ textAlign: "center", padding: "24px 18px" }}>
          <div className="kicker" style={{ marginBottom: 8 }}>Explore</div>
          <div className="row" style={{ justifyContent: "center", flexWrap: "wrap", gap: 8 }}>
            <a className="btn btn-ghost" href="/drum/patterns">Patterns</a>
            <a className="btn btn-ghost" href="/drum/method">Method</a>
            <a className="btn btn-ghost" href="/drum/progress">Progress</a>
            <a className="btn btn-ghost" href="/drum/profile">Achievements</a>
            <a className="btn btn-ghost" href="/drum/relationships">Rudiment Map</a>
            <WhatsNewButton />
          </div>
        </div>
      </section>
    </div>
  );
}
