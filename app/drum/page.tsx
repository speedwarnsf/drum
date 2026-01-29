export default async function DrumHome() {
  return (
    <main className="shell">
      <header className="shell-header">
        <div className="shell-head">
          <div>
            <div className="kicker">Drum Practice System</div>
            <h1 className="title">Daily practice cards</h1>
            <p className="sub">
              Built for absolute beginners on an electronic kit. Calm structure
              with clear stop points.
            </p>
            <div className="row">
              <a className="btn" href="/drum/start">
                Start setup
              </a>
              <a className="btn btn-ghost" href="/drum/today">
                {"Today's card"}
              </a>
              <a className="btn btn-ghost" href="/drum/login">
                Login
              </a>
              <a className="btn btn-ghost" href="/drum/signup">
                Sign up
              </a>
              <a className="btn btn-ghost" href="/drum/method">
                Method + syllabus
              </a>
              <a className="btn btn-ghost" href="/drum/journal">
                Log
              </a>
            </div>
          </div>
        </div>
      </header>

      <section className="grid">
        <article className="card">
          <h2 className="card-title">Focused practice</h2>
          <p>
            A small number of deliberate blocks. Each block has a purpose and a
            stop cue.
          </p>
        </article>
        <article className="card">
          <h2 className="card-title">Text + audio method</h2>
          <p>
            No video dependency. You develop your internal clock, listening,
            and clean sound faster.
          </p>
        </article>
        <article className="card">
          <h2 className="card-title">Adaptation</h2>
          <p>
            You report what broke first, the next card responds. No sensors,
            just honest input.
          </p>
        </article>
        <article className="card">
          <h2 className="card-title">Built for consistency</h2>
          <p>
            Short, repeatable sessions that reduce decision fatigue and build
            trust.
          </p>
        </article>
      </section>
    </main>
  );
}
