/**
 * Sample-based audio playback with Web Audio API.
 * Preloads MP3 files from /audio/ and plays them on demand.
 * Falls back to synthesis if samples fail to load.
 */

type SampleName = "metronome-click" | "metronome-accent" | "practice-start" | "practice-complete";

const SAMPLE_PATHS: Record<SampleName, string> = {
  "metronome-click": "/audio/metronome-click.mp3",
  "metronome-accent": "/audio/metronome-accent.mp3",
  "practice-start": "/audio/practice-start.mp3",
  "practice-complete": "/audio/practice-complete.mp3",
};

let sharedContext: AudioContext | null = null;
const bufferCache: Map<SampleName, AudioBuffer> = new Map();
let loadPromise: Promise<void> | null = null;
let loaded = false;

function getContext(): AudioContext {
  if (!sharedContext) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    sharedContext = new AC({ latencyHint: "interactive", sampleRate: 44100 });
  }
  if (sharedContext.state === "suspended") {
    sharedContext.resume();
  }
  return sharedContext;
}

async function loadSample(ctx: AudioContext, name: SampleName): Promise<void> {
  try {
    const resp = await fetch(SAMPLE_PATHS[name]);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const arrayBuffer = await resp.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    bufferCache.set(name, audioBuffer);
  } catch (err) {
    console.warn(`Failed to load sample "${name}":`, err);
  }
}

/**
 * Preload all samples. Safe to call multiple times; only loads once.
 */
export async function preloadSamples(): Promise<void> {
  if (loaded) return;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const ctx = getContext();
    await Promise.all(
      (Object.keys(SAMPLE_PATHS) as SampleName[]).map((name) => loadSample(ctx, name))
    );
    loaded = true;
  })();

  return loadPromise;
}

/**
 * Check if a specific sample is available.
 */
export function hasSample(name: SampleName): boolean {
  return bufferCache.has(name);
}

/**
 * Play a preloaded sample immediately.
 * Returns true if sample played, false if not available (caller should use synthesis fallback).
 */
export function playSample(name: SampleName, volume = 1.0): boolean {
  const buffer = bufferCache.get(name);
  if (!buffer) return false;

  try {
    const ctx = getContext();
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    source.buffer = buffer;
    gain.gain.value = volume;
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    return true;
  } catch {
    return false;
  }
}

/**
 * Schedule a sample to play at a precise Web Audio time.
 * Used by the metronome scheduler for sample-accurate timing.
 * Returns true if scheduled, false if sample not available.
 */
export function scheduleSample(
  ctx: AudioContext,
  name: SampleName,
  time: number,
  volume = 1.0
): boolean {
  const buffer = bufferCache.get(name);
  if (!buffer) return false;

  try {
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    source.buffer = buffer;
    gain.gain.value = volume;
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(time);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the shared AudioContext (for metronome components that need it).
 */
export function getSharedAudioContext(): AudioContext {
  return getContext();
}
