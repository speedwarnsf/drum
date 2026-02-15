/**
 * Community & Social Layer
 * Leaderboard, challenges, and share card data management.
 * Uses localStorage now, structured for future backend migration.
 */

// --- Leaderboard ---

export type LeaderboardEntry = {
  id: string;
  name: string;
  streak: number;
  totalMinutes: number;
  rudimentsMastered: number;
  lastActive: string; // ISO date
  isCurrentUser?: boolean;
};

const LEADERBOARD_KEY = "drum_leaderboard";
const USER_PROFILE_KEY = "drum_community_profile";

export type CommunityProfile = {
  id: string;
  name: string;
  createdAt: string;
};

export function loadCommunityProfile(): CommunityProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveCommunityProfile(profile: CommunityProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
}

export function loadLeaderboard(): LeaderboardEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    const entries: LeaderboardEntry[] = raw ? JSON.parse(raw) : getDefaultLeaderboard();
    return entries.sort((a, b) => b.streak - a.streak || b.totalMinutes - a.totalMinutes);
  } catch { return getDefaultLeaderboard(); }
}

export function updateLeaderboardEntry(entry: LeaderboardEntry): void {
  if (typeof window === "undefined") return;
  const board = loadLeaderboard();
  const idx = board.findIndex(e => e.id === entry.id);
  if (idx >= 0) {
    board[idx] = entry;
  } else {
    board.push(entry);
  }
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(board));
}

function getDefaultLeaderboard(): LeaderboardEntry[] {
  // Seed data to make the leaderboard feel alive
  return [
    { id: "demo-1", name: "Alex R.", streak: 42, totalMinutes: 3780, rudimentsMastered: 18, lastActive: "2026-02-14" },
    { id: "demo-2", name: "Jordan M.", streak: 31, totalMinutes: 2460, rudimentsMastered: 14, lastActive: "2026-02-13" },
    { id: "demo-3", name: "Casey T.", streak: 27, totalMinutes: 1950, rudimentsMastered: 11, lastActive: "2026-02-14" },
    { id: "demo-4", name: "Sam K.", streak: 19, totalMinutes: 1380, rudimentsMastered: 9, lastActive: "2026-02-12" },
    { id: "demo-5", name: "Riley P.", streak: 14, totalMinutes: 840, rudimentsMastered: 7, lastActive: "2026-02-11" },
    { id: "demo-6", name: "Morgan L.", streak: 8, totalMinutes: 520, rudimentsMastered: 5, lastActive: "2026-02-10" },
    { id: "demo-7", name: "Drew N.", streak: 5, totalMinutes: 300, rudimentsMastered: 3, lastActive: "2026-02-09" },
  ];
}

// --- Challenges ---

export type Challenge = {
  id: string;
  rudimentId: string;
  rudimentName: string;
  targetBpm: number;
  durationSeconds: number;
  description: string;
};

export type ChallengeResult = {
  challengeId: string;
  completedAt: string;
  passed: boolean;
  actualSeconds: number;
};

const CHALLENGE_RESULTS_KEY = "drum_challenge_results";

export const PRESET_CHALLENGES: Challenge[] = [
  { id: "c1", rudimentId: "single-stroke-roll", rudimentName: "Single Stroke Roll", targetBpm: 200, durationSeconds: 60, description: "Can you keep a clean Single Stroke Roll at 200 BPM for 60 seconds?" },
  { id: "c2", rudimentId: "double-stroke-roll", rudimentName: "Double Stroke Roll", targetBpm: 160, durationSeconds: 60, description: "Maintain a Double Stroke Roll at 160 BPM for a full minute." },
  { id: "c3", rudimentId: "paradiddle", rudimentName: "Paradiddle", targetBpm: 140, durationSeconds: 45, description: "Lock in a Paradiddle at 140 BPM for 45 seconds without breaking." },
  { id: "c4", rudimentId: "single-stroke-roll", rudimentName: "Single Stroke Roll", targetBpm: 240, durationSeconds: 30, description: "Sprint: Single Stroke Roll at 240 BPM for 30 seconds." },
  { id: "c5", rudimentId: "flam", rudimentName: "Flam", targetBpm: 120, durationSeconds: 60, description: "Clean Flams at 120 BPM for 60 seconds. Grace notes must be consistent." },
  { id: "c6", rudimentId: "five-stroke-roll", rudimentName: "Five Stroke Roll", targetBpm: 100, durationSeconds: 45, description: "Five Stroke Roll at 100 BPM for 45 seconds. Keep the rolls even." },
  { id: "c7", rudimentId: "single-stroke-roll", rudimentName: "Single Stroke Roll", targetBpm: 300, durationSeconds: 15, description: "Extreme: Single Stroke Roll at 300 BPM for 15 seconds. Good luck." },
];

export function loadChallengeResults(): ChallengeResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CHALLENGE_RESULTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveChallengeResult(result: ChallengeResult): void {
  if (typeof window === "undefined") return;
  const results = loadChallengeResults();
  results.push(result);
  localStorage.setItem(CHALLENGE_RESULTS_KEY, JSON.stringify(results));
}

// --- Guided Sessions ---

export type GuidedSessionTemplate = {
  id: string;
  name: string;
  durationMinutes: number;
  steps: GuidedStep[];
};

export type GuidedStep = {
  type: "practice" | "rest";
  rudimentId?: string;
  rudimentName?: string;
  targetBpm?: number;
  durationSeconds: number;
  instruction: string;
};

export const GUIDED_SESSIONS: GuidedSessionTemplate[] = [
  {
    id: "quick-15",
    name: "Quick Warm-Up",
    durationMinutes: 15,
    steps: [
      { type: "practice", rudimentId: "single-stroke-roll", rudimentName: "Single Stroke Roll", targetBpm: 80, durationSeconds: 120, instruction: "Start slow. Focus on even strokes and relaxed grip." },
      { type: "rest", durationSeconds: 30, instruction: "Shake out your hands. Breathe." },
      { type: "practice", rudimentId: "double-stroke-roll", rudimentName: "Double Stroke Roll", targetBpm: 70, durationSeconds: 120, instruction: "Let the stick bounce. Two hits per hand, smooth and even." },
      { type: "rest", durationSeconds: 30, instruction: "Roll your wrists. Stay loose." },
      { type: "practice", rudimentId: "paradiddle", rudimentName: "Paradiddle", targetBpm: 80, durationSeconds: 120, instruction: "RLRR LRLL. Accent the first note of each group." },
      { type: "rest", durationSeconds: 30, instruction: "Almost there. One more round." },
      { type: "practice", rudimentId: "single-stroke-roll", rudimentName: "Single Stroke Roll", targetBpm: 120, durationSeconds: 120, instruction: "Push the tempo. Maintain control as you speed up." },
      { type: "practice", rudimentId: "single-stroke-roll", rudimentName: "Single Stroke Roll", targetBpm: 60, durationSeconds: 60, instruction: "Cool down. Slow and deliberate." },
    ],
  },
  {
    id: "standard-30",
    name: "Standard Practice",
    durationMinutes: 30,
    steps: [
      { type: "practice", rudimentId: "single-stroke-roll", rudimentName: "Single Stroke Roll", targetBpm: 70, durationSeconds: 120, instruction: "Warm-up. Even, relaxed single strokes." },
      { type: "rest", durationSeconds: 30, instruction: "Shake it out." },
      { type: "practice", rudimentId: "double-stroke-roll", rudimentName: "Double Stroke Roll", targetBpm: 60, durationSeconds: 150, instruction: "Slow doubles. Let the stick do the work." },
      { type: "rest", durationSeconds: 30, instruction: "Breathe deeply." },
      { type: "practice", rudimentId: "paradiddle", rudimentName: "Paradiddle", targetBpm: 80, durationSeconds: 150, instruction: "Paradiddles with accents. RLRR LRLL." },
      { type: "rest", durationSeconds: 45, instruction: "Longer rest. Hydrate." },
      { type: "practice", rudimentId: "flam", rudimentName: "Flam", targetBpm: 90, durationSeconds: 150, instruction: "Clean flams. Grace note should be quiet and close to the main stroke." },
      { type: "rest", durationSeconds: 30, instruction: "Shake your arms out." },
      { type: "practice", rudimentId: "single-stroke-roll", rudimentName: "Single Stroke Roll", targetBpm: 140, durationSeconds: 180, instruction: "Speed work. Push your comfortable limit, back off if it gets sloppy." },
      { type: "rest", durationSeconds: 30, instruction: "Final stretch." },
      { type: "practice", rudimentId: "double-stroke-roll", rudimentName: "Double Stroke Roll", targetBpm: 100, durationSeconds: 150, instruction: "Doubles at moderate speed. Clean and consistent." },
      { type: "practice", rudimentId: "single-stroke-roll", rudimentName: "Single Stroke Roll", targetBpm: 60, durationSeconds: 90, instruction: "Cool down. Slow, controlled, mindful." },
    ],
  },
  {
    id: "deep-60",
    name: "Deep Practice",
    durationMinutes: 60,
    steps: [
      { type: "practice", rudimentId: "single-stroke-roll", rudimentName: "Single Stroke Roll", targetBpm: 60, durationSeconds: 180, instruction: "Warm-up zone. Very slow singles. Feel every stroke." },
      { type: "rest", durationSeconds: 60, instruction: "Full rest. Stretch your fingers, wrists, forearms." },
      { type: "practice", rudimentId: "double-stroke-roll", rudimentName: "Double Stroke Roll", targetBpm: 60, durationSeconds: 180, instruction: "Slow doubles. Focus on the second stroke matching the first." },
      { type: "rest", durationSeconds: 45, instruction: "Roll your shoulders. Stay relaxed." },
      { type: "practice", rudimentId: "paradiddle", rudimentName: "Paradiddle", targetBpm: 70, durationSeconds: 180, instruction: "Paradiddles. Start adding accents once comfortable." },
      { type: "rest", durationSeconds: 60, instruction: "Hydration break. Stand up, move around." },
      { type: "practice", rudimentId: "flam", rudimentName: "Flam", targetBpm: 80, durationSeconds: 180, instruction: "Flam work. Alternate leading hands." },
      { type: "rest", durationSeconds: 45, instruction: "Wrist circles. Deep breaths." },
      { type: "practice", rudimentId: "five-stroke-roll", rudimentName: "Five Stroke Roll", targetBpm: 70, durationSeconds: 180, instruction: "Five Stroke Rolls. Even doubles into a clean accent." },
      { type: "rest", durationSeconds: 60, instruction: "Longer break. You are halfway through." },
      { type: "practice", rudimentId: "single-stroke-roll", rudimentName: "Single Stroke Roll", targetBpm: 120, durationSeconds: 240, instruction: "Speed building. Start at 120 and try to push higher." },
      { type: "rest", durationSeconds: 45, instruction: "Shake it all out." },
      { type: "practice", rudimentId: "paradiddle", rudimentName: "Paradiddle", targetBpm: 100, durationSeconds: 180, instruction: "Fast paradiddles. Keep the accents crisp." },
      { type: "rest", durationSeconds: 45, instruction: "Almost done." },
      { type: "practice", rudimentId: "double-stroke-roll", rudimentName: "Double Stroke Roll", targetBpm: 110, durationSeconds: 180, instruction: "Push the doubles. Speed and control." },
      { type: "practice", rudimentId: "single-stroke-roll", rudimentName: "Single Stroke Roll", targetBpm: 60, durationSeconds: 120, instruction: "Cool down. Very slow. Mindful. You did it." },
    ],
  },
];

// --- Share Card Data ---

export type ShareCardData = {
  playerName: string;
  streak: number;
  totalMinutes: number;
  rudimentsMastered: number;
  totalSessions: number;
  topRudiment?: string;
};

export function generateShareImage(data: ShareCardData): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    if (!ctx) { reject(new Error("Canvas not supported")); return; }

    // Background
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, 600, 400);

    // Gold accent bar
    ctx.fillStyle = "#f6c447";
    ctx.fillRect(0, 0, 600, 6);
    ctx.fillRect(0, 394, 600, 6);

    // Title
    ctx.fillStyle = "#f6c447";
    ctx.font = "bold 28px system-ui, -apple-system, sans-serif";
    ctx.fillText("DRUM", 32, 50);

    ctx.fillStyle = "#888";
    ctx.font = "14px system-ui, -apple-system, sans-serif";
    ctx.fillText("repodrum.com", 130, 50);

    // Player name
    ctx.fillStyle = "#fff";
    ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
    ctx.fillText(data.playerName || "Drummer", 32, 95);

    // Divider
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(32, 115);
    ctx.lineTo(568, 115);
    ctx.stroke();

    // Stats grid
    const stats = [
      { label: "STREAK", value: `${data.streak} days` },
      { label: "TOTAL TIME", value: formatMinutes(data.totalMinutes) },
      { label: "SESSIONS", value: `${data.totalSessions}` },
      { label: "RUDIMENTS", value: `${data.rudimentsMastered} mastered` },
    ];

    stats.forEach((stat, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 32 + col * 280;
      const y = 150 + row * 90;

      ctx.fillStyle = "#f6c447";
      ctx.font = "bold 36px system-ui, -apple-system, sans-serif";
      ctx.fillText(stat.value, x, y);

      ctx.fillStyle = "#888";
      ctx.font = "12px system-ui, -apple-system, sans-serif";
      ctx.fillText(stat.label, x, y + 22);
    });

    // Top rudiment
    if (data.topRudiment) {
      ctx.fillStyle = "#666";
      ctx.font = "14px system-ui, -apple-system, sans-serif";
      ctx.fillText(`Top rudiment: ${data.topRudiment}`, 32, 360);
    }

    // Footer
    ctx.fillStyle = "#444";
    ctx.font = "11px system-ui, -apple-system, sans-serif";
    ctx.fillText("Share your drumming journey", 32, 382);

    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to generate image"));
    }, "image/png");
  });
}

function formatMinutes(min: number): string {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}
