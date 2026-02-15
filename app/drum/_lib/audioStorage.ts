/**
 * Audio recording storage using IndexedDB
 * Stores recordings as Blobs (not base64) for efficiency
 */

const DB_NAME = "drum_recordings_db";
const DB_VERSION = 1;
const STORE_NAME = "recordings";
const MAX_RECORDINGS = 50;
const MAX_DURATION_MS = 120_000;

export type AudioRecording = {
  id: string;
  sessionId: string | null;
  rudimentId: string | null;
  ts: string;
  durationMs: number;
  mimeType: string;
  data: string; // object URL (runtime only, regenerated from blob)
  blob?: Blob;
  bpm?: number;
  accuracyScore?: number;
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Not in browser"));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("rudimentId", "rudimentId", { unique: false });
        store.createIndex("ts", "ts", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

type StoredRecording = {
  id: string;
  sessionId: string | null;
  rudimentId: string | null;
  ts: string;
  durationMs: number;
  mimeType: string;
  blob: Blob;
  bpm?: number;
  accuracyScore?: number;
};

function storedToAudio(stored: StoredRecording): AudioRecording {
  const url = URL.createObjectURL(stored.blob);
  return {
    id: stored.id,
    sessionId: stored.sessionId,
    rudimentId: stored.rudimentId,
    ts: stored.ts,
    durationMs: stored.durationMs,
    mimeType: stored.mimeType,
    data: url,
    blob: stored.blob,
    bpm: stored.bpm,
    accuracyScore: stored.accuracyScore,
  };
}

export async function saveRecording(
  blob: Blob,
  durationMs: number,
  sessionId: string | null = null,
  rudimentId: string | null = null,
  bpm?: number,
  accuracyScore?: number
): Promise<AudioRecording> {
  const db = await openDB();
  const stored: StoredRecording = {
    id: makeId(),
    sessionId,
    rudimentId,
    ts: new Date().toISOString(),
    durationMs: Math.min(durationMs, MAX_DURATION_MS),
    mimeType: blob.type || "audio/webm",
    blob,
    bpm,
    accuracyScore,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(stored);
    tx.oncomplete = async () => {
      await trimOldRecordings();
      resolve(storedToAudio(stored));
    };
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadRecentRecordings(limit = 10): Promise<AudioRecording[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.index("ts").openCursor(null, "prev");
    const results: AudioRecording[] = [];
    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor && results.length < limit) {
        results.push(storedToAudio(cursor.value));
        cursor.continue();
      } else {
        resolve(results);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

export async function loadRecordingsForRudiment(rudimentId: string): Promise<AudioRecording[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const index = store.index("rudimentId");
    const request = index.getAll(rudimentId);
    request.onsuccess = () => {
      const results = (request.result as StoredRecording[])
        .map(storedToAudio)
        .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
      resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteRecording(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function updateRecordingScore(id: string, accuracyScore: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      if (getReq.result) {
        getReq.result.accuracyScore = accuracyScore;
        store.put(getReq.result);
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function trimOldRecordings(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const countReq = store.count();
    countReq.onsuccess = () => {
      if (countReq.result <= MAX_RECORDINGS) {
        resolve();
        return;
      }
      const toDelete = countReq.result - MAX_RECORDINGS;
      const cursor = store.index("ts").openCursor(null, "next");
      let deleted = 0;
      cursor.onsuccess = () => {
        const c = cursor.result;
        if (c && deleted < toDelete) {
          c.delete();
          deleted++;
          c.continue();
        }
      };
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearRecordings(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Synchronous stubs for backward compat (return empty, use async versions)
export function loadRecordings(): AudioRecording[] {
  return [];
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
