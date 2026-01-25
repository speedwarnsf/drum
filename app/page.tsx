export default function Home() {
  return (
    <main className="shell">
      <header className="shell-header">
        <div className="shell-head">
          <div>
            <div className="kicker">Dyork Music</div>
            <h1 className="title">Drum Practice System</h1>
            <p className="sub">
              Calm, tactile practice cards for absolute beginners. Designed to
              feel like a trusted, analog teacher.
            </p>
            <div className="row">
              <a className="btn" href="/login">
                Log in
              </a>
              <a className="btn btn-ghost" href="/drum">
                Go to /drum
              </a>
            </div>
            <p className="tiny">Private beta for dyorkmusic.com/drum</p>
          </div>
        </div>
      </header>

      <section className="grid">
        <article className="card">
          <h2 className="card-title">Daily practice card</h2>
          <p>
            Clear focus, time box, and stop cues. No noise, no endless videos.
          </p>
        </article>
        <article className="card">
          <h2 className="card-title">Teacher-like logic</h2>
          <p>
            The plan adjusts based on what breaks first so the system stays
            calm and useful.
          </p>
        </article>
        <article className="card">
          <h2 className="card-title">Built for e-kits</h2>
          <p>
            Designed around a Roland e-kit workflow: quiet, consistent, and
            repeatable.
          </p>
        </article>
      </section>
    </main>
  );
}
