export type DrumLevel = "true_beginner" | "beginner" | "rusty";
export type DrumKit = "roland_edrum" | "other_edrum" | "acoustic";
export type DrumGoal = "comfort_time" | "basic_grooves" | "play_music";

export type Profile = {
  level: DrumLevel;
  kit: DrumKit;
  minutes: number;
  goal: DrumGoal;
};

export type LogEntry = {
  broke: "time" | "control" | "coordination" | "feel" | "nothing";
  felt: "easier" | "right" | "harder";
  note?: string;
  ts: string;
};

export type PracticeBlock = {
  title: string;
  time: string;
  bullets: string[];
  stop?: string[];
};

export type SetupGuide = {
  title: string;
  items: string[];
  defaultOpen?: boolean;
};

export type PracticePlan = {
  minutes: number;
  metronome: string;
  focus: string;
  contextLine: string;
  blocks: PracticeBlock[];
  reflection: string[];
  closure: string;
  setupGuide?: SetupGuide;
};

const KEY_PROFILE = "drum_mvp_profile";
const KEY_LOGS = "drum_mvp_logs";

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function loadProfile(): Profile | null {
  if (typeof window === "undefined") return null;
  return safeJsonParse<Profile>(localStorage.getItem(KEY_PROFILE));
}

export function saveProfile(p: Profile) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_PROFILE, JSON.stringify(p));
}

export function loadLogs(): LogEntry[] {
  if (typeof window === "undefined") return [];
  return safeJsonParse<LogEntry[]>(localStorage.getItem(KEY_LOGS)) ?? [];
}

export function saveLog(entry: Omit<LogEntry, "ts">) {
  if (typeof window === "undefined") return;
  const logs = loadLogs();
  logs.push({ ...entry, ts: new Date().toISOString() });
  localStorage.setItem(KEY_LOGS, JSON.stringify(logs));
}

export function clearAllLocal() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY_PROFILE);
  localStorage.removeItem(KEY_LOGS);
}

function lastLog(): LogEntry | null {
  const logs = loadLogs();
  return logs.length ? logs[logs.length - 1] : null;
}

export function buildTodaysPlan(profile: Profile): PracticePlan {
  const minutes = Number(profile.minutes || 15);
  const log = lastLog();
  const dayIndex = loadLogs().length + 1;

  const needsSimpler =
    !!log &&
    (log.felt === "harder" || log.broke === "time" || log.broke === "control");

  const canAdvance = !!log && log.felt === "easier" && log.broke === "nothing";

  const focus = needsSimpler
    ? "Calm time + even strokes"
    : canAdvance
      ? "First coordination step"
      : "Comfort + time";

  const metronomeBpm = needsSimpler ? 55 : canAdvance ? 65 : dayIndex <= 2 ? 55 : 60;
  const metronome = `${metronomeBpm} BPM (quarters)`;

  const contextLine = !log
    ? "First session: we're building comfort and even sound. No rushing."
    : needsSimpler
      ? "Last session signaled strain. Today we simplify to rebuild control."
      : canAdvance
        ? "Last session was stable. Today we add one tiny coordination element."
        : "We're reinforcing the foundation before adding complexity.";

  const blocks: PracticeBlock[] = [];

  blocks.push({
    title: "Block A - Setup & Comfort",
    time: "5 min",
    bullets: [
      "Sit comfortably; shoulders down; breathe.",
      "Light grip; let the stick rebound.",
      "Single hits on snare, one hand at a time (no metronome).",
      "Goal: even volume, relaxed motion.",
    ],
    stop: ["Stop early if shoulders rise or grip tightens."],
  });

  const blockBMinutes = Math.max(5, Math.round(minutes * 0.35));
  blocks.push({
    title: "Block B - Time Intro",
    time: `${blockBMinutes} min`,
    bullets: [
      `Metronome: ${metronome}`,
      "Play one snare hit per click, alternating hands.",
      "Say \"1\" out loud on each hit.",
      "Goal: land with the click (do not chase it).",
      ...(dayIndex <= 2 ? ["Stay at this tempo; accuracy is the win."] : []),
    ],
    stop: ["If you drift twice in a row: pause, breathe, restart."],
  });

  if (!needsSimpler) {
    const blockCMinutes = Math.max(4, Math.round(minutes * 0.25));
    blocks.push({
      title: "Block C - Single-limb repetition",
      time: `${blockCMinutes} min`,
      bullets: [
        "Right hand: quarter notes on hi-hat with metronome.",
        "Left hand rests. Feet rest.",
        "Then switch hands.",
        "Goal: calm repetition, even volume.",
      ],
      stop: ["If forearms burn, you're gripping—reset."],
    });
  }

  if (canAdvance) {
    blocks.push({
      title: "Block D - Tiny coordination add-on",
      time: "3 min",
      bullets: [
        "Right hand: hi-hat quarters with metronome.",
        "Add bass drum on beat 1 only.",
        "Keep it boring on purpose. That's the point.",
      ],
      stop: [
        "If it falls apart, remove the bass drum and finish Block C.",
      ],
    });
  }

  const reflection = [
    "What broke first? (time / control / coordination / feel / nothing)",
    "How did it feel? (easier / about right / harder)",
    "One short note (optional).",
  ];

  const setupGuideItems = [
    "Throne: thighs slope slightly downward; feet flat on pedals.",
    "Snare: rim just above thigh line; elbows relaxed at your sides.",
    "Hi-hat: close enough that shoulders stay low; no reaching.",
    "Sticks: thumb-index fulcrum, fingers support; avoid squeezing.",
    "Feel check: wrists loose, forearms quiet, breathe normally.",
  ];

  const shouldShowSetup =
    dayIndex <= 7 || needsSimpler || (log && log.broke === "control");

  const setupGuide = shouldShowSetup
    ? {
        title: "Setup check",
        items: setupGuideItems,
        defaultOpen: dayIndex <= 2,
      }
    : undefined;

  return {
    minutes,
    metronome,
    focus,
    contextLine,
    blocks,
    reflection,
    closure: "Stop here. More time today will not help.",
    setupGuide,
  };
}
