"use client";

import { useEffect, useState } from "react";
import Shell from "../_ui/Shell";
import Audiation from "../_ui/Audiation";
import { Icon } from "../_ui/Icon";
import { getModuleProgress } from "../_lib/drumMvp";

export default function DrumMethodPage() {
  const [currentModule, setCurrentModule] = useState(1);

  useEffect(() => {
    getModuleProgress().then((data) => {
      if (data) setCurrentModule(data.currentModule);
    });
  }, []);

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
              Most drummers don&apos;t realize their kick and snare hit at slightly different times—creating 
              a &quot;flam&quot; instead of a unified &quot;thud.&quot;
            </p>
            <div className="pillar-test">
              <strong>Test yourself:</strong> Play kick + snare together 20 times. Record it. 
              Does it sound like &quot;Thud&quot; (good) or &quot;Ka-Thunk&quot; (flam)?
              <br />
              <a href="/drum/diagnostic" className="btn btn-ghost" style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Icon name="search" size={16} /> Run the Diagnostic Test →
              </a>
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
              <br />
              <a href="/drum/drills" className="btn btn-ghost" style={{ marginTop: 8 }}>
                Try Gap Drills →
              </a>
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
        
        {/* Interactive Audiation Exercise */}
        <Audiation moduleId={currentModule} compact />
      </section>

      {/* Deep Audiation Theory */}
      <section className="card">
        <h2 className="card-title">The Science of Audiation</h2>
        <blockquote className="method-quote">
          &quot;Audiation is to music what thought is to language.&quot;
          <cite>— Edwin Gordon</cite>
        </blockquote>
        
        <p>
          Audiation isn&apos;t just &quot;hearing in your head&quot;—it&apos;s a specific cognitive process with 
          <strong> six developmental stages</strong>. Understanding these helps you practice more effectively.
        </p>
        
        <div className="audiation-stages">
          <h3>The 6 Stages of Audiation</h3>
          <ol className="audiation-stage-list">
            <li>
              <strong>Momentary retention</strong>
              <span>Hear it, hold it briefly in your mind</span>
            </li>
            <li>
              <strong>Imitate + recognize macrobeats</strong>
              <span>Copy patterns AND feel where the downbeats are</span>
            </li>
            <li>
              <strong>Establish meter</strong>
              <span>Lock into the time signature feel (is it 4/4? 3/4? 6/8?)</span>
            </li>
            <li>
              <strong>Consciously retain patterns</strong>
              <span>Remember longer phrases, not just the current beat</span>
            </li>
            <li>
              <strong>Recall patterns from other pieces</strong>
              <span>Connect to vocabulary you already know</span>
            </li>
            <li className="audiation-stage-critical">
              <strong>PREDICT patterns</strong>
              <span>Anticipate what comes next—THIS IS CRITICAL FOR DRUMMERS</span>
            </li>
          </ol>
          
          <div className="method-tip" style={{ marginTop: 16 }}>
            <strong>Stage 6 is the goal:</strong> Great drummers don&apos;t just react to what&apos;s happening—they 
            <em> anticipate</em> what&apos;s coming. They&apos;ve audiated the groove so deeply that they know 
            where the music is going before it gets there.
          </div>
        </div>
      </section>

      {/* Sound Before Sight */}
      <section className="card">
        <h2 className="card-title">Sound Before Sight</h2>
        <p>
          Research shows a counterintuitive truth: <strong>spending time on ear training actually IMPROVES 
          reading ability</strong>. &quot;Playing by ear&quot; doesn&apos;t hurt your reading—it helps.
        </p>
        
        <div className="sound-before-sight">
          <div className="sbs-step">
            <div className="sbs-number">1</div>
            <div className="sbs-content">
              <strong>HEAR it</strong>
              <span>Listen to the pattern externally or imagine it internally</span>
            </div>
          </div>
          <div className="sbs-arrow">→</div>
          <div className="sbs-step">
            <div className="sbs-number">2</div>
            <div className="sbs-content">
              <strong>SING it</strong>
              <span>Vocalize with syllables: &quot;Boom-Chack-Tss-Chack&quot;</span>
            </div>
          </div>
          <div className="sbs-arrow">→</div>
          <div className="sbs-step">
            <div className="sbs-number">3</div>
            <div className="sbs-content">
              <strong>PLAY it</strong>
              <span>Only now do you pick up the sticks</span>
            </div>
          </div>
        </div>
        
        <p className="method-warning" style={{ marginTop: 16 }}>
          <strong>The rule:</strong> If you can&apos;t sing it, you haven&apos;t audiated it. 
          Never skip the singing step—it&apos;s where the real learning happens.
        </p>
      </section>

      {/* Discrimination vs Inference */}
      <section className="card">
        <h2 className="card-title">Two Types of Learning</h2>
        <p>
          Musical learning happens in two modes. Both are essential, but they develop different abilities.
        </p>
        
        <div className="learning-types">
          <article className="learning-type">
            <h3>Discrimination Learning</h3>
            <p>&quot;Can I tell if two things are the same or different?&quot;</p>
            <ul>
              <li>Listening: &quot;Were those two grooves the same?&quot;</li>
              <li>Oral: &quot;Can I repeat what I just heard?&quot;</li>
              <li>Verbal: &quot;Can I describe the difference?&quot;</li>
              <li>Symbolic: &quot;Can I read/write it?&quot;</li>
            </ul>
            <p className="sub">This builds your ability to ANALYZE and COMPARE.</p>
          </article>
          
          <article className="learning-type">
            <h3>✨ Inference Learning</h3>
            <p>&quot;Can I create something I&apos;ve never heard before?&quot;</p>
            <ul>
              <li>Generalization: Apply known patterns to new situations</li>
              <li>Creativity: Combine patterns in original ways</li>
              <li>Theoretical: Understand WHY patterns work</li>
            </ul>
            <p className="sub">This builds your ability to CREATE and IMPROVISE.</p>
          </article>
        </div>
        
        <p style={{ marginTop: 16 }}>
          Our lessons move from <strong>discrimination → inference</strong>. First you learn to recognize patterns, 
          then you learn to create new ones within constraints.
        </p>
      </section>

      {/* Algorithm Approach */}
      <section className="card">
        <h2 className="card-title">The Algorithm Approach</h2>
        <p>
          Don&apos;t practice random things. Use <strong>&quot;algorithms&quot;</strong>—structured systems with 
          constraints that mirror real-life playing:
        </p>
        
        <ul className="algorithm-list">
          <li>
            <strong>Scripted improvisations:</strong> &quot;Improvise, but only use these 3 patterns.&quot;
            <span className="sub">Constraints breed creativity.</span>
          </li>
          <li>
            <strong>Inside-out vocabulary:</strong> Master 5 core patterns completely before adding more.
            <span className="sub">Depth before breadth.</span>
          </li>
          <li>
            <strong>Real-world simulation:</strong> Every exercise should mirror an actual playing situation.
            <span className="sub">Practice what you&apos;ll actually do.</span>
          </li>
          <li>
            <strong>The Hidden Flaw mindset:</strong> Assume you sound worse than you think.
            <span className="sub">Record yourself. Listen honestly. Fix what you find.</span>
          </li>
        </ul>
        
        <div className="method-tip" style={{ marginTop: 16 }}>
          <strong>The Hidden Flaw:</strong> Even intermediate drummers have micro-flams they can&apos;t hear while playing. 
          Your limbs aren&apos;t hitting exactly together—you just can&apos;t feel it in the moment. 
          The recording never lies.
        </div>
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
        
        /* Audiation Deep Theory Styles */
        .method-quote {
          margin: 16px 0;
          padding: 16px 20px;
          background: var(--surface);
          border-left: 4px solid var(--accent);
          border-radius: 0 8px 8px 0;
          font-style: italic;
          font-size: 1.1rem;
        }
        
        .method-quote cite {
          display: block;
          margin-top: 8px;
          font-size: 0.85rem;
          color: var(--muted);
          font-style: normal;
        }
        
        .audiation-stages {
          margin-top: 20px;
        }
        
        .audiation-stages h3 {
          margin: 0 0 12px 0;
          font-size: 1rem;
        }
        
        .audiation-stage-list {
          margin: 0;
          padding: 0;
          list-style: none;
          counter-reset: stage;
        }
        
        .audiation-stage-list li {
          position: relative;
          padding: 12px 12px 12px 48px;
          margin-bottom: 8px;
          background: var(--surface);
          border-radius: 8px;
          counter-increment: stage;
        }
        
        .audiation-stage-list li::before {
          content: counter(stage);
          position: absolute;
          left: 12px;
          top: 12px;
          width: 24px;
          height: 24px;
          background: var(--muted);
          color: var(--bg);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 600;
        }
        
        .audiation-stage-list li strong {
          display: block;
          margin-bottom: 2px;
        }
        
        .audiation-stage-list li span {
          font-size: 0.85rem;
          color: var(--muted);
        }
        
        .audiation-stage-critical {
          background: linear-gradient(135deg, var(--surface) 0%, rgba(var(--accent-rgb), 0.1) 100%) !important;
          border: 1px solid var(--accent);
        }
        
        .audiation-stage-critical::before {
          background: var(--accent) !important;
        }
        
        /* Sound Before Sight */
        .sound-before-sight {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 20px;
          flex-wrap: wrap;
          justify-content: center;
        }
        
        .sbs-step {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: var(--surface);
          border-radius: 10px;
          flex: 1;
          min-width: 140px;
        }
        
        .sbs-number {
          width: 28px;
          height: 28px;
          background: var(--accent);
          color: var(--bg);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
          flex-shrink: 0;
        }
        
        .sbs-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .sbs-content strong {
          font-size: 0.95rem;
        }
        
        .sbs-content span {
          font-size: 0.75rem;
          color: var(--muted);
        }
        
        .sbs-arrow {
          font-size: 1.2rem;
          color: var(--muted);
          flex-shrink: 0;
        }
        
        .method-warning {
          padding: 12px 16px;
          background: rgba(231, 76, 60, 0.1);
          border-left: 3px solid #e74c3c;
          border-radius: 0 8px 8px 0;
        }
        
        /* Learning Types */
        .learning-types {
          display: grid;
          gap: 16px;
          margin-top: 16px;
        }
        
        .learning-type {
          padding: 16px;
          background: var(--surface);
          border-radius: 10px;
        }
        
        .learning-type h3 {
          margin: 0 0 8px 0;
          font-size: 1rem;
        }
        
        .learning-type > p:first-of-type {
          font-style: italic;
          margin-bottom: 12px;
        }
        
        .learning-type ul {
          margin: 0 0 12px 0;
          padding-left: 1.2rem;
        }
        
        .learning-type ul li {
          margin-bottom: 4px;
          font-size: 0.9rem;
        }
        
        /* Algorithm List */
        .algorithm-list {
          list-style: none;
          padding: 0;
          margin: 16px 0 0 0;
        }
        
        .algorithm-list li {
          padding: 14px 16px;
          margin-bottom: 10px;
          background: var(--surface);
          border-radius: 8px;
        }
        
        .algorithm-list li strong {
          display: block;
          margin-bottom: 4px;
        }
        
        .algorithm-list li .sub {
          display: block;
          font-size: 0.85rem;
          color: var(--muted);
          margin-top: 4px;
        }
        
        @media (min-width: 640px) {
          .audit-methods {
            grid-template-columns: 1fr 1fr;
          }
          
          .learning-types {
            grid-template-columns: 1fr 1fr;
          }
          
          .sound-before-sight {
            flex-wrap: nowrap;
          }
        }
      `}</style>
    </Shell>
  );
}
