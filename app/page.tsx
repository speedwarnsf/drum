export default function Home() {
  return (
    <main className="shell">
      <header className="shell-header">
        <div className="shell-head">
          <div>
            <div className="kicker">RepoDrum</div>
            <h1 className="title" style={{ fontSize: "clamp(1.8rem, 5vw, 2.8rem)", lineHeight: 1.1 }}>
              Master the 40 Essential Rudiments
            </h1>
            <p className="sub" style={{ maxWidth: 520, fontSize: "1.05rem", lineHeight: 1.6 }}>
              A focused practice system for drummers who want structure, not noise.
              Built-in metronome, spaced repetition, progress tracking, and honest
              feedback loops — all in your browser.
            </p>
            <div className="row" style={{ marginTop: 20, gap: 10 }}>
              <a className="btn" href="/drum" style={{ fontSize: "1rem", padding: "12px 28px" }}>
                Start Practicing
              </a>
              <a className="btn btn-ghost" href="/drum/rudiments" style={{ fontSize: "1rem", padding: "12px 28px" }}>
                Browse Rudiments
              </a>
            </div>
            <p className="tiny" style={{ marginTop: 12 }}>Free. No account required. Works offline.</p>
          </div>
        </div>
      </header>

      {/* Key features */}
      <section className="grid" style={{ marginTop: 24 }}>
        <article className="card">
          <div className="kicker" style={{ marginBottom: 6 }}>40 Rudiments</div>
          <h2 className="card-title">Every PAS Essential Rudiment</h2>
          <p>
            Color-coded sticking, accent patterns, notation display, and difficulty ratings.
            Learn them in order or jump to what you need.
          </p>
        </article>
        <article className="card">
          <div className="kicker" style={{ marginBottom: 6 }}>Smart Practice</div>
          <h2 className="card-title">Spaced repetition + routines</h2>
          <p>
            The system tracks what you practiced, when, and how it went.
            It surfaces what needs work so you spend time where it matters.
          </p>
        </article>
        <article className="card">
          <div className="kicker" style={{ marginBottom: 6 }}>Metronome</div>
          <h2 className="card-title">Built-in tempo tools</h2>
          <p>
            Pendulum metronome, gap drills, tempo goals, and count-ins.
            No extra apps needed. Practice with precision.
          </p>
        </article>
        <article className="card">
          <div className="kicker" style={{ marginBottom: 6 }}>Progress</div>
          <h2 className="card-title">Streaks, stats, and achievements</h2>
          <p>
            Practice calendar, session history, achievement badges, CSV export.
            See exactly how far you have come.
          </p>
        </article>
        <article className="card">
          <div className="kicker" style={{ marginBottom: 6 }}>Adaptive</div>
          <h2 className="card-title">Responds to your feedback</h2>
          <p>
            After each session, report what broke. The next session adapts.
            No sensors, no gimmicks — just your honest assessment.
          </p>
        </article>
        <article className="card">
          <div className="kicker" style={{ marginBottom: 6 }}>Offline-Ready</div>
          <h2 className="card-title">Works without internet</h2>
          <p>
            Install as a PWA on any device. Practice in the shed, on the bus,
            wherever you have your pad and sticks.
          </p>
        </article>
      </section>

      {/* How it works */}
      <section style={{ marginTop: 32 }}>
        <div className="card" style={{ padding: "28px 20px" }}>
          <div className="kicker" style={{ marginBottom: 12 }}>How it works</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: "1.5rem", marginBottom: 4 }}>1</div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Pick a rudiment</div>
              <div style={{ fontSize: "0.9rem", color: "var(--ink-muted)" }}>
                Browse all 40, use the random button, or let the system suggest what needs work.
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "1.5rem", marginBottom: 4 }}>2</div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Practice with focus</div>
              <div style={{ fontSize: "0.9rem", color: "var(--ink-muted)" }}>
                Set your tempo, start the metronome, follow the notation. Short, deliberate blocks.
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "1.5rem", marginBottom: 4 }}>3</div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Log and reflect</div>
              <div style={{ fontSize: "0.9rem", color: "var(--ink-muted)" }}>
                Note what broke, how it felt, and any observations. The system adapts next time.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ marginTop: 24, marginBottom: 32, textAlign: "center" }}>
        <div className="card" style={{ padding: "32px 20px" }}>
          <h2 className="card-title" style={{ fontSize: "1.3rem" }}>Ready to build real chops?</h2>
          <p className="sub" style={{ maxWidth: 400, margin: "8px auto 0" }}>
            No signup. No payment. Just open it and start.
          </p>
          <a className="btn" href="/drum" style={{ marginTop: 16, fontSize: "1rem", padding: "12px 32px" }}>
            Open RepoDrum
          </a>
        </div>
      </section>
    </main>
  );
}
