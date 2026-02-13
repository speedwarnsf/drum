/**
 * UI Sound Effects — short Web Audio oscillator tones for interaction feedback.
 * No audio files. Pure synthesis.
 */

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext {
  if (!audioCtx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AC();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = "sine", volume = 0.12) {
  try {
    const ctx = getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Silently fail — audio feedback is non-critical
  }
}

/** Short click for selecting items (rudiments, categories) */
export function playSelect() {
  playTone(880, 0.06, "sine", 0.1);
}

/** Subtle tap for navigation actions */
export function playNav() {
  playTone(660, 0.04, "triangle", 0.08);
}

/** Positive confirmation tone (two-note rising) */
export function playConfirm() {
  playTone(523, 0.06, "sine", 0.1);
  setTimeout(() => playTone(659, 0.08, "sine", 0.1), 60);
}

/** Milestone unlock — bright ascending arpeggio */
export function playMilestone() {
  playTone(523, 0.1, "sine", 0.12);
  setTimeout(() => playTone(659, 0.1, "sine", 0.12), 80);
  setTimeout(() => playTone(784, 0.15, "sine", 0.12), 160);
}
