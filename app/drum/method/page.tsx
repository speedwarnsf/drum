import Shell from "../_ui/Shell";

export default function DrumMethodPage() {
  return (
    <Shell
      title="Method + Syllabus"
      subtitle="Text-first training that builds time, touch, and listening faster."
    >
      <section className="card">
        <h2 className="card-title">Why text + audio</h2>
        <p>
          Video can hide timing problems. Text, a metronome, and a timer force you
          to internalize the pulse and hear yourself honestly.
        </p>
      </section>

      <section className="grid">
        <article className="card">
          <h3 className="card-title">Vocabulary of movement</h3>
          <p>
            We use metaphors and named motions to bridge notation to feel (for
            example, &quot;hold the stick like a small bird&quot;).
          </p>
        </article>
        <article className="card">
          <h3 className="card-title">Metronome as instructor</h3>
          <p>
            The click is the feedback. Off-beat and gap drills teach internal
            time instead of chasing the beat.
          </p>
        </article>
        <article className="card">
          <h3 className="card-title">Embodied time</h3>
          <p>
            You step and sing the groove before you play it. Big motions steady
            the tempo, then transfer to your hands.
          </p>
        </article>
        <article className="card">
          <h3 className="card-title">Self-audit</h3>
          <p>
            Short recordings + a quick checklist train you to hear flams, drag,
            and uneven spacing.
          </p>
        </article>
      </section>

      <section className="card">
        <h2 className="card-title">Text-based 80/20 syllabus</h2>
        <ol style={{ marginTop: 0, paddingLeft: "1.2rem" }}>
          <li>
            <strong>Module 1: Clean sound (2 weeks)</strong> — unison strikes,
            grip comfort, even tone. Stop on flams.
          </li>
          <li>
            <strong>Module 2: Internal clock (2 weeks)</strong> — walk and sing,
            off-beat clicks, gap drills.
          </li>
          <li>
            <strong>Module 3: Vocabulary + flow (2 weeks)</strong> — singles,
            doubles, paradiddles, and short scripted loops.
          </li>
          <li>
            <strong>Module 4: The audit (ongoing)</strong> — record 30 seconds,
            listen for alignment and consistency.
          </li>
        </ol>
      </section>
    </Shell>
  );
}
