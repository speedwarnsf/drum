/**
 * Audio recording storage utilities
 * Stores recordings in localStorage as base64
 * Max 5 recordings, auto-cleanup older ones
 */

const KEY_RECORDINGS = "drum_recordings";
const MAX_RECORDINGS = 5;
const MAX_DURATION_MS = 60_000;

export type AudioRecording = {
  id: string;
  sessionId: string | null;
  ts: string;
  durationMs: number;
  mimeType: string;
  data: string; // base64
};

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function loadRecordings(): AudioRecording[] {
  if (typeof window === "undefined") return [];
  return safeJsonParse<AudioRecording[]>(localStorage.getItem(KEY_RECORDINGS)) ?? [];
}

export function loadRecordingsForSession(sessionId: string): AudioRecording[] {
  return loadRecordings().filter((r) => r.sessionId === sessionId);
}

export function loadRecentRecordings(limit = 5): AudioRecording[] {
  return loadRecordings().slice(0, limit);
}

export function saveRecording(
  blob: Blob,
  durationMs: number,
  sessionId: string | null = null
): Promise<AudioRecording> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const recording: AudioRecording = {
        id: makeId(),
        sessionId,
        ts: new Date().toISOString(),
        durationMs: Math.min(durationMs, MAX_DURATION_MS),
        mimeType: blob.type || "audio/webm",
        data: base64,
      };

      const recordings = loadRecordings();
      recordings.unshift(recording);

      // Keep only the last MAX_RECORDINGS
      const trimmed = recordings.slice(0, MAX_RECORDINGS);
      localStorage.setItem(KEY_RECORDINGS, JSON.stringify(trimmed));

      resolve(recording);
    };
    reader.onerror = () => reject(new Error("Failed to read audio blob"));
    reader.readAsDataURL(blob);
  });
}

export function deleteRecording(id: string): void {
  if (typeof window === "undefined") return;
  const recordings = loadRecordings().filter((r) => r.id !== id);
  localStorage.setItem(KEY_RECORDINGS, JSON.stringify(recordings));
}

export function clearRecordings(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY_RECORDINGS);
}

export function getMaxDurationMs(): number {
  return MAX_DURATION_MS;
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function makeId(): string {
  return `rec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
