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
const KEY_SESSIONS = "drum_mvp_sessions";
const KEY_LAST_PLAN = "drum_mvp_last_plan";

export type StoredSession = {
  id: string;
  ts: string;
  plan: PracticePlan;
  log: LogEntry;
};

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
  void syncProfileToSupabase(p);
}

export function loadLogs(): LogEntry[] {
  if (typeof window === "undefined") return [];
  return safeJsonParse<LogEntry[]>(localStorage.getItem(KEY_LOGS)) ?? [];
}

export function saveLog(entry: Omit<LogEntry, "ts">, plan?: PracticePlan) {
  if (typeof window === "undefined") return;
  const logs = loadLogs();
  const log: LogEntry = { ...entry, ts: new Date().toISOString() };
  logs.push(log);
  localStorage.setItem(KEY_LOGS, JSON.stringify(logs));
  if (plan) {
    saveSession(log, plan);
  }
  void syncLogToSupabase(log, plan);
  void bumpProfileSessionCount();
}

export function loadSessions(): StoredSession[] {
  if (typeof window === "undefined") return [];
  return safeJsonParse<StoredSession[]>(localStorage.getItem(KEY_SESSIONS)) ?? [];
}

export function saveSession(log: LogEntry, plan: PracticePlan) {
  if (typeof window === "undefined") return;
  const sessions = loadSessions();
  const session: StoredSession = {
    id: makeId(),
    ts: log.ts,
    plan,
    log,
  };
  sessions.unshift(session);
  localStorage.setItem(KEY_SESSIONS, JSON.stringify(sessions));
}

export function saveLastPlan(plan: PracticePlan) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_LAST_PLAN, JSON.stringify(plan));
}

export function loadLastPlan(): PracticePlan | null {
  if (typeof window === "undefined") return null;
  return safeJsonParse<PracticePlan>(localStorage.getItem(KEY_LAST_PLAN));
}

export function clearAllLocal() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY_PROFILE);
  localStorage.removeItem(KEY_LOGS);
  localStorage.removeItem(KEY_SESSIONS);
  localStorage.removeItem(KEY_LAST_PLAN);
}

function lastLog(): LogEntry | null {
  const logs = loadLogs();
  return logs.length ? logs[logs.length - 1] : null;
}

export function buildTodaysPlan(profile: Profile): PracticePlan {
  const minutes = Number(profile.minutes || 15);
  const log = lastLog();
  const dayIndex = loadLogs().length + 1;
  const brokeTime = log?.broke === "time";

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
      "Stand for 30 seconds: step side-to-side with the pulse and sing \"boom-chack\".",
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
      "Speak the groove as a sound: \"boom\" for kick, \"chack\" for snare.",
      ...(brokeTime
        ? ["Treat the click as the \"a\" of the beat (1-e-&-a). Hold the time inside."]
        : []),
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

  if (brokeTime) {
    blocks.push({
      title: "Block C2 - Gap timer check",
      time: "2 min",
      bullets: [
        "Set the click for 3 bars on, 1 bar off (or mute it manually).",
        "Keep a simple groove while the click is silent.",
        "When it returns, are you still aligned?",
      ],
      stop: ["If you lose it twice, slow down 5 BPM and retry."],
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
    "Record 20-30 seconds and listen back.",
    "Do kick + snare sound like one thick note or two flams?",
    "Is the space between hi-hat notes even?",
    "One short note (optional).",
  ];

  const setupGuideItems = [
    "Throne: sit tall; imagine your feet are heavy and steady.",
    "Snare: close enough that elbows rest at your sides.",
    "Hi-hat: close enough that shoulders stay low; no reaching.",
    "Grip: hold the stick like a small bird—secure, never squeezing.",
    "Motion: let the stick rebound like a soft wave, not a hammer.",
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

function makeId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function loadRemoteSessions(): Promise<StoredSession[]> {
  if (typeof window === "undefined") return [];
  const { getSupabaseClient } = await import("./supabaseClient");
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return [];
  const { data, error } = await supabase
    .from("drum_sessions")
    .select("id, ts, log, plan")
    .eq("user_id", user.id)
    .order("ts", { ascending: false });
  if (error || !data) return [];
  const rows = data as {
    id: string;
    ts: string;
    log: LogEntry;
    plan: PracticePlan | null;
  }[];
  return rows.map((row) => ({
    id: row.id,
    ts: row.ts,
    plan: row.plan as PracticePlan,
    log: row.log as LogEntry,
  }));
}

async function syncLogToSupabase(log: LogEntry, plan?: PracticePlan) {
  const { getSupabaseClient } = await import("./supabaseClient");
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return;
  await supabase.from("drum_sessions").insert({
    user_id: user.id,
    ts: log.ts,
    log,
    plan: plan ?? null,
  });
}

async function syncProfileToSupabase(profile: Profile) {
  const { getSupabaseClient } = await import("./supabaseClient");
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return;
  const sessionCount = loadLogs().length;
  await supabase.from("drum_profiles").upsert({
    user_id: user.id,
    level: profile.level,
    kit: profile.kit,
    minutes: profile.minutes,
    goal: profile.goal,
    session_count: sessionCount,
    updated_at: new Date().toISOString(),
  });
}

async function bumpProfileSessionCount() {
  const { getSupabaseClient } = await import("./supabaseClient");
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return;
  const sessionCount = loadLogs().length;
  await supabase
    .from("drum_profiles")
    .upsert({ user_id: user.id, session_count: sessionCount, updated_at: new Date().toISOString() });
}

export async function loadProfileFromSupabase(): Promise<Profile | null> {
  const { getSupabaseClient } = await import("./supabaseClient");
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return null;
  const { data } = await supabase
    .from("drum_profiles")
    .select("level, kit, minutes, goal")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!data) return null;
  return {
    level: data.level as Profile["level"],
    kit: data.kit as Profile["kit"],
    minutes: Number(data.minutes || 15),
    goal: data.goal as Profile["goal"],
  };
}
