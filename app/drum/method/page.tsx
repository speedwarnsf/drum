import Shell from "../_ui/Shell";

export default function DrumMethodPage() {
  return (
    <Shell
      title="The Method"
      subtitle="Research-backed drum instruction that works. No video needed."
    >
      {/* The 80/20 Philosophy */}
      <section className="card">
        <h2 className="card-title">The 80/20 Philosophy</h2>
        <p style={{ marginBottom: 16 }}>
          After studying decades of drum pedagogy research, we found that 80% of drumming problems 
          come from just <strong>three areas</strong>. Master these, and everything else follows.
        </p>
        
        <div className="method-pillars">
          <article className="method-pillar">
            <div className="pillar-number">1</div>
            <h3>Playing Clean</h3>
            <p className="pillar-subtitle">The &quot;Personal Drum Troupe&quot;</p>
            <p>
              When all your limbs sound like <strong>one drummer</strong>, you have a &quot;Personal Drum Troupe.&quot; 
              Most beginners don&apos;t realize their kick and snare hit at slightly different times—creating 
              a &quot;flam&quot; instead of a unified &quot;thud.&quot;
            </p>
            <div className="pillar-test">
              <strong>Test yourself:</strong> Play kick + snare together 20 times. Record it. 
              Does it sound like &quot;Thud&quot; (good) or &quot;Ka-Thunk&quot; (flam)?
            </div>
          </article>
          
          <article className="method-pillar">
            <div className="pillar-number">2</div>
            <h3>Playing in Time</h3>
            <p className="pillar-subtitle">Metric Projection</p>
            <p>
              Most drummers <strong>react</strong> to the metronome. They wait for the click, then hit. 
              Great drummers <strong>project</strong> the beat—the metronome confirms their time, 
              it doesn&apos;t create it.
            </p>
            <div className="pillar-test">
              <strong>The difference:</strong> In gap drills (click goes silent), projectors stay steady. 
              Reactors speed up or slow down. Which are you?
            </div>
          </article>
          
          <article className="method-pillar">
            <div className="pillar-number">3</div>
            <h3>Having Options</h3>
            <p className="pillar-subtitle">Real World Vocabulary</p>
            <p>
              Vocabulary isn&apos;t about playing complex fills. It&apos;s about having <strong>options</strong> 
              when the music calls for something different. Singles, doubles, paradiddles—these are 
              your words. Patterns are your sentences.
            </p>
            <div className="pillar-test">
              <strong>Goal:</strong> Can you play 4 bars singles → 4 bars doubles → 4 bars paradiddles 
              without stopping? That&apos;s flow.
            </div>
          </article>
        </div>
      </section>

      {/* Why Text + Audio */}
      <section className="card">
        <h2 className="card-title">Why text + audio (no video)</h2>
        <p>
          Video can <strong>hide</strong> timing problems. You watch, you mimic, you <em>think</em> you&apos;ve 
          got it—but you can&apos;t hear your own flams or rushing.
        </p>
        <p>
          Text, a metronome, and a recording force you to <strong>internalize</strong> the pulse 
          and <strong>hear yourself honestly</strong>. There&apos;s no one to copy. Just you and the click.
        </p>
      </section>

      {/* Rhythm Syllables */}
      <section className="card">
        <h2 className="card-title">Rhythm Syllables (Audiation)</h2>
        <p>
          Instead of counting &quot;1-2-3-4,&quot; we use <strong>Gordon rhythm syllables</strong>. 
          These help you <em>hear</em> the rhythm in your head before you play it (audiation).
        </p>
        
        <div className="syllable-grid">
          <div className="syllable-item">
            <span className="syllable-name">Quarter notes</span>
            <span className="syllable-value">Du</span>
          </div>
          <div className="syllable-item">
            <span className="syllable-name">Eighth notes</span>
            <span className="syllable-value">Du-De</span>
          </div>
          <div className="syllable-item">
            <span className="syllable-name">Sixteenth notes</span>
            <span className="syllable-value">Du-Ta-De-Ta</span>
          </div>
        </div>
        
        <p style={{ marginTop: 16 }}>
          We also use <strong>onomatopoeia</strong> for groove feel:
        </p>
        <div className="syllable-grid">
          <div className="syllable-item">
            <span className="syllable-name">Kick</span>
            <span className="syllable-value">Boom</span>
          </div>
          <div className="syllable-item">
            <span className="syllable-name">Snare</span>
            <span className="syllable-value">Chack</span>
          </div>
          <div className="syllable-item">
            <span className="syllable-name">Hi-hat</span>
            <span className="syllable-value">Tss</span>
          </div>
        </div>
        
        <p className="method-tip" style={{ marginTop: 16 }}>
          <strong>Try it:</strong> Sing &quot;Boom-Chack-Tss-Chack&quot; for 4 bars before you play it. 
          This is audiation—hearing the music internally before executing.
        </p>
      </section>

      {/* Haptic Metaphors */}
      <section className="card">
        <h2 className="card-title">Vocabulary of Movement</h2>
        <p>
          Since we can&apos;t show you video, we use <strong>haptic metaphors</strong>—physical imagery 
          that transfers the <em>feeling</em> of correct technique.
        </p>
        
        <ul className="method-metaphors">
          <li>
            <strong>Grip:</strong> &quot;Hold the stick like a small bird—secure, but never squeezing.&quot;
          </li>
          <li>
            <strong>Rebound:</strong> &quot;Let the stick bounce like a ball on pavement.&quot;
          </li>
          <li>
            <strong>Moeller Stroke:</strong> &quot;Shaking water off your fingertips—whip from the wrist.&quot;
          </li>
          <li>
            <strong>Flow:</strong> &quot;Moving through honey—constant resistance, constant motion.&quot;
          </li>
          <li>
            <strong>Backbeat Weight:</strong> &quot;Heavier on 2 and 4, like a confident stride.&quot;
          </li>
        </ul>
      </section>

      {/* Staged Motor Learning */}
      <section className="card">
        <h2 className="card-title">Staged Motor Learning</h2>
        <p>
          We never throw a full groove at you on day one. Motor learning research shows that 
          skill acquisition happens in <strong>three phases</strong>:
        </p>
        
        <ol className="method-phases">
          <li>
            <strong>Cognitive:</strong> Understanding what to do. Slow, deliberate, requires full attention.
          </li>
          <li>
            <strong>Associative:</strong> Refining the movement. Less conscious effort, fewer errors.
          </li>
          <li>
            <strong>Autonomous:</strong> It just happens. You don&apos;t think—you play.
          </li>
        </ol>
        
        <p style={{ marginTop: 12 }}>
          We also follow the <strong>&quot;degrees of freedom&quot;</strong> principle: isolate each limb 
          before combining. Right hand alone. Left hand alone. Both hands together. Then add feet.
        </p>
      </section>

      {/* Gap Drills */}
      <section className="card">
        <h2 className="card-title">Gap Drills: Why They Work</h2>
        <p>
          Gap drills are the <strong>secret weapon</strong> for developing internal time. Here&apos;s why:
        </p>
        
        <p>
          When the click is playing, you can <em>react</em> to it. You hear it, you hit. But when the 
          click goes <strong>silent</strong>, you have no external reference. You must <strong>project</strong> 
          the beat from inside.
        </p>
        
        <p>
          Think of silence as <strong>distance to travel</strong>, not emptiness to fill. The gap between 
          beats has a physical length. You cross that distance with your internal clock.
        </p>
        
        <div className="method-tip">
          <strong>Pro tip:</strong> During the silent gap, visualize the beats as stepping stones. 
          You&apos;re walking across them, not waiting for them to appear.
        </div>
      </section>

      {/* Self-Audit */}
      <section className="card">
        <h2 className="card-title">Self-Audit (Formative Evaluation)</h2>
        <p>
          Every session ends with <strong>reflection</strong>—not to judge yourself, but to 
          <em>learn faster</em>. We use two research-backed methods:
        </p>
        
        <div className="audit-methods">
          <article className="audit-method">
            <h3>Stop-Start-Continue</h3>
            <ul>
              <li><strong>STOP:</strong> What habit should you stop? (e.g., tensing shoulders)</li>
              <li><strong>START:</strong> What should you start doing? (e.g., counting aloud)</li>
              <li><strong>CONTINUE:</strong> What&apos;s working? (e.g., steady kick)</li>
            </ul>
          </article>
          
          <article className="audit-method">
            <h3>Minute Paper</h3>
            <p>
              In one sentence: What was the most important thing you learned today?
            </p>
            <p className="sub">
              This forces synthesis—you can&apos;t write one sentence without identifying the core lesson.
            </p>
          </article>
        </div>
        
        <p style={{ marginTop: 16 }}>
          <strong>Recording yourself</strong> is also essential. Your ears catch what your body misses. 
          Play 30 seconds, stop, listen immediately. No editing, no excuses.
        </p>
      </section>

      {/* The Syllabus */}
      <section className="card">
        <h2 className="card-title">Text-based 80/20 Syllabus</h2>
        <ol className="method-syllabus">
          <li>
            <strong>Module 1: Clean Sound</strong> <span className="module-duration">(2 weeks)</span>
            <p>The Personal Drum Troupe. Unison strikes, grip comfort, even tone. Stop on flams.</p>
          </li>
          <li>
            <strong>Module 2: Internal Clock</strong> <span className="module-duration">(2 weeks)</span>
            <p>Metric Projection. Walk and sing, off-beat clicks, gap drills. Project, don&apos;t react.</p>
          </li>
          <li>
            <strong>Module 3: Vocabulary + Flow</strong> <span className="module-duration">(2 weeks)</span>
            <p>Real World Options. Singles, doubles, paradiddles, short scripted loops.</p>
          </li>
          <li>
            <strong>Module 4: The Audit</strong> <span className="module-duration">(Ongoing)</span>
            <p>Self-Evaluation Loop. Record 30 seconds, listen for alignment and consistency.</p>
          </li>
        </ol>
      </section>

      <style jsx>{`
        .method-pillars {
          display: flex;
          flex-direction: column;
          gap: 24px;
          margin-top: 20px;
        }
        
        .method-pillar {
          position: relative;
          padding: 20px;
          padding-left: 60px;
          background: var(--surface);
          border-radius: 12px;
          border: 1px solid var(--border);
        }
        
        .pillar-number {
          position: absolute;
          left: 16px;
          top: 20px;
          width: 32px;
          height: 32px;
          background: var(--accent);
          color: var(--bg);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.1rem;
        }
        
        .method-pillar h3 {
          margin: 0 0 4px 0;
          font-size: 1.2rem;
        }
        
        .pillar-subtitle {
          font-size: 0.9rem;
          color: var(--muted);
          margin: 0 0 12px 0;
          font-style: italic;
        }
        
        .pillar-test {
          margin-top: 12px;
          padding: 12px;
          background: var(--bg);
          border-radius: 8px;
          font-size: 0.9rem;
        }
        
        .syllable-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
          margin-top: 12px;
        }
        
        .syllable-item {
          display: flex;
          flex-direction: column;
          padding: 12px;
          background: var(--surface);
          border-radius: 8px;
          text-align: center;
        }
        
        .syllable-name {
          font-size: 0.8rem;
          color: var(--muted);
        }
        
        .syllable-value {
          font-size: 1.3rem;
          font-weight: 600;
          font-family: monospace;
          margin-top: 4px;
        }
        
        .method-tip {
          padding: 12px 16px;
          background: var(--surface);
          border-left: 3px solid var(--accent);
          border-radius: 0 8px 8px 0;
        }
        
        .method-metaphors {
          list-style: none;
          padding: 0;
          margin: 16px 0 0 0;
        }
        
        .method-metaphors li {
          padding: 12px 0;
          border-bottom: 1px solid var(--border);
        }
        
        .method-metaphors li:last-child {
          border-bottom: none;
        }
        
        .method-phases {
          margin: 16px 0;
          padding-left: 1.5rem;
        }
        
        .method-phases li {
          margin-bottom: 12px;
        }
        
        .audit-methods {
          display: grid;
          gap: 16px;
          margin-top: 16px;
        }
        
        .audit-method {
          padding: 16px;
          background: var(--surface);
          border-radius: 8px;
        }
        
        .audit-method h3 {
          margin: 0 0 12px 0;
          font-size: 1rem;
        }
        
        .audit-method ul {
          margin: 0;
          padding-left: 1.2rem;
        }
        
        .method-syllabus {
          margin: 16px 0 0 0;
          padding-left: 1.2rem;
        }
        
        .method-syllabus li {
          margin-bottom: 16px;
        }
        
        .method-syllabus li p {
          margin: 4px 0 0 0;
          font-size: 0.9rem;
          color: var(--muted);
        }
        
        .module-duration {
          font-weight: 400;
          color: var(--muted);
          font-size: 0.9rem;
        }
        
        @media (min-width: 640px) {
          .audit-methods {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </Shell>
  );
}
