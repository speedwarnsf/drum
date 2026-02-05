export type DrumLevel = "true_beginner" | "beginner" | "rusty";
export type DrumKit = "roland_edrum" | "other_edrum" | "acoustic";
export type DrumGoal = "comfort_time" | "basic_grooves" | "play_music";

export type Profile = {
  level: DrumLevel;
  kit: DrumKit;
  minutes: number;
  goal: DrumGoal;
  currentModule?: number;
  moduleStartedAt?: string;
};

/**
 * MODULE_INFO - Research-backed module definitions
 * 
 * Each module is designed around specific pedagogical principles:
 * - The "Personal Drum Troupe" concept (all limbs = one drummer)
 * - Metric Projection (project the beat, don't react to it)
 * - Staged Motor Learning (isolate → combine → flow)
 * - Formative Evaluation (Stop-Start-Continue, Minute Paper)
 */
export const MODULE_INFO = [
  {
    id: 1,
    title: "Clean Sound",
    subtitle: "The Personal Drum Troupe",
    duration: "2 weeks",
    focus: "Unison strikes, grip comfort, even tone. Stop on flams.",
    pedagogicalGoal: "When all your limbs sound like ONE drummer, you have the 'Personal Drum Troupe'.",
    keywords: ["grip", "tone", "unison", "flams", "rebound", "personal drum troupe"],
    
    // Rhythm syllables (Gordon Method)
    rhythmSyllables: {
      primary: "Du (quarter)", 
      description: "Say 'Du' on each hit to internalize the pulse",
    },
    
    // Haptic metaphors for text-only instruction
    hapticCues: [
      "Hold the stick like a small bird—secure, never squeezing",
      "Let the stick bounce like a ball on pavement",
      "The fulcrum is a pivot point, not a vice grip",
    ],
    
    // Stop conditions (immediate signals to pause)
    stopConditions: [
      "Stop if you hear a flam (two attacks instead of one clean hit)",
      "Stop if shoulders rise above neutral position",
      "Stop if grip tightens into a fist",
      "Stop if forearms burn (you're muscling, not flowing)",
    ],
    
    // Module-specific drills
    drills: [
      {
        name: "Hidden Coordination Flaw Diagnostic",
        description: "Play Kick + Right Hand together 20 times. Record it. Listen back. Does it sound like 'Thud' (good) or 'Ka-Thunk' (flam)? If you hear two attacks, you have the Hidden Flaw.",
        duration: "3 min",
      },
      {
        name: "Bird Grip Reset",
        description: "Open hands fully, let sticks roll to fingertips, close gently. Secure but never squeezing.",
        duration: "1 min",
      },
      {
        name: "Single Surface Singles",
        description: "One hand at a time on snare, matching volume left to right. Say 'Du' on each hit.",
        duration: "5 min",
      },
    ],
    
    // Formative evaluation prompts
    evaluationPrompts: {
      stop: "What habit do you need to stop? (e.g., tensing shoulders, death grip)",
      start: "What should you start doing? (e.g., checking grip every minute)",
      continue: "What's working well? (e.g., clean single strokes)",
    },
  },
  {
    id: 2,
    title: "Internal Clock",
    subtitle: "Metric Projection",
    duration: "2 weeks",
    focus: "Walk and sing, off-beat clicks, gap drills.",
    pedagogicalGoal: "PROJECT the beat instead of REACTING to it. The metronome confirms your time—it doesn't create it.",
    keywords: ["time", "pulse", "gap drills", "off-beat", "internal clock", "metric projection"],
    
    rhythmSyllables: {
      primary: "Du-De (eighths), Boom-Chack (groove)",
      description: "Sing 'Boom-Chack' for kick-snare pattern. 'Du-De' for eighth notes.",
    },
    
    hapticCues: [
      "Feel tempo in your hips, not just your ears",
      "Exhale on beat 1—let rhythm sync to breath",
      "Heavier on 2 and 4, like a confident stride",
      "Moving through honey—constant resistance, constant motion",
    ],
    
    stopConditions: [
      "Stop if you speed up during the gap (rushing = not projecting)",
      "Stop if you wait for the click to re-enter (reacting, not projecting)",
      "Stop if you can't sing the groove before playing it",
    ],
    
    drills: [
      {
        name: "Walk the Tempo",
        description: "Step side-to-side to the metronome. Left foot, Right foot. Now clap 'Du-De' over your steps. This grounds the pulse in your body.",
        duration: "3 min",
      },
      {
        name: "Gap Drill (Projection Training)",
        description: "8 clicks on, 4 clicks silent. During silence, visualize the distance between beats—don't wait for the click. When it returns, are you aligned?",
        duration: "5 min",
      },
      {
        name: "Off-Beat Click",
        description: "Set metronome to click on 2 and 4 only. You must PROJECT beats 1 and 3.",
        duration: "4 min",
      },
      {
        name: "Sing Before Play",
        description: "Vocalize 'Boom-Chack-Tss-Chack' for 4 bars, then play it. Audiation precedes execution.",
        duration: "3 min",
      },
    ],
    
    evaluationPrompts: {
      stop: "What rushes when you're not watching? (e.g., speeding up during gaps)",
      start: "What will help you internalize pulse? (e.g., stepping, breathing with the beat)",
      continue: "Where is your time most solid?",
    },
  },
  {
    id: 3,
    title: "Vocabulary + Flow",
    subtitle: "Real World Options",
    duration: "2 weeks",
    focus: "Singles, doubles, paradiddles, short scripted loops.",
    pedagogicalGoal: "Build a vocabulary of patterns that give you OPTIONS in real musical situations.",
    keywords: ["singles", "doubles", "paradiddles", "rudiments", "vocabulary", "flow"],
    
    rhythmSyllables: {
      primary: "Du-Ta-De-Ta (sixteenths)",
      description: "Singles: R-L-R-L = Du-De-Du-De. Paradiddle: R-L-R-R = Du-de-du-DU (accent capital).",
    },
    
    hapticCues: [
      "Singles: Even alternation, like walking—no limping",
      "Doubles: Bounce-bounce, like a basketball double-dribble",
      "Paradiddles: Accent the first note of each group, whisper the rest",
      "Think of rudiments as words, patterns as sentences",
    ],
    
    stopConditions: [
      "Stop if singles become uneven (one hand louder than the other)",
      "Stop if doubles lose their bounce (muscling the second stroke)",
      "Stop if paradiddle accents disappear into the pattern",
    ],
    
    drills: [
      {
        name: "Single Stroke Roll",
        description: "RLRL at 60 BPM, matching volume perfectly. Say 'Du-De' for each pair.",
        duration: "4 min",
      },
      {
        name: "Double Stroke Roll",
        description: "RRLL, let the stick bounce for the second hit. Don't muscle it—bounce.",
        duration: "4 min",
      },
      {
        name: "Paradiddle",
        description: "RLRR LRLL. Accent beat 1 of each group (the first R, the first L). Whisper the rest.",
        duration: "4 min",
      },
      {
        name: "3-Way Flow",
        description: "4 bars singles → 4 bars doubles → 4 bars paradiddles. No stopping between.",
        duration: "5 min",
      },
    ],
    
    evaluationPrompts: {
      stop: "Which rudiment feels forced? What makes it awkward?",
      start: "Which rudiment needs more isolated practice?",
      continue: "Which pattern is becoming natural/autonomous?",
    },
  },
  {
    id: 4,
    title: "The Audit",
    subtitle: "Self-Evaluation Loop",
    duration: "Ongoing",
    focus: "Record 30 seconds, listen for alignment and consistency.",
    pedagogicalGoal: "Develop the self-audit skill: record → listen → identify → fix → repeat.",
    keywords: ["record", "audit", "listen", "alignment", "consistency", "self-evaluation"],
    
    rhythmSyllables: {
      primary: "Listen for: Du (clean) vs Du-uh (flam)",
      description: "When listening back, a clean hit is one sound. A flam is two sounds (Du-uh or Ka-Thunk).",
    },
    
    hapticCues: [
      "Listening: Close your eyes. Flams are easier to hear than feel.",
      "Alignment: Does kick + snare sound like 'THUD' (good) or 'ka-THUNK' (flam)?",
      "Spacing: Even hi-hat = even gaps of silence between hits",
    ],
    
    stopConditions: [
      "Stop if you're playing without recording (audit requires evidence)",
      "Stop if you can't identify ONE specific thing to improve",
      "Stop if you're making excuses instead of identifying problems",
    ],
    
    drills: [
      {
        name: "30-Second Recording",
        description: "Play simple groove for 30 seconds. Stop. Listen immediately. No editing, no second takes.",
        duration: "3 min",
      },
      {
        name: "Flam Detection",
        description: "Listen specifically for kick+snare hits. One unified sound, or two separate attacks?",
        duration: "2 min",
      },
      {
        name: "Spacing Audit",
        description: "Listen to hi-hat only. Is every gap between hits identical? Mark where you rushed.",
        duration: "2 min",
      },
      {
        name: "Volume Audit",
        description: "Is every hi-hat hit the same volume? Any unexpected accents or ghost notes?",
        duration: "2 min",
      },
    ],
    
    // Audit-specific: the checklist approach
    auditChecklist: [
      "Are kick and snare aligned? (no flams)",
      "Is hi-hat spacing even throughout?",
      "Is volume consistent across all hits?",
      "Did tempo stay steady from start to end?",
      "Any unwanted ghost notes or doubles?",
    ],
    
    evaluationPrompts: {
      stop: "What bad habit did the recording reveal?",
      start: "What ONE thing will you fix next session?",
      continue: "What sounds clean and should be maintained?",
    },
  },
] as const;

export type LogEntry = {
  broke: "time" | "control" | "coordination" | "feel" | "nothing";
  felt: "easier" | "right" | "harder";
  note?: string;
  ts: string;
};

export type GapDrillSettings = {
  beatsOn: number;
  beatsOff: number;
  offBeatMode?: boolean;
};

export type PracticeBlock = {
  title: string;
  time: string;
  bullets: string[];
  stop?: string[];
  type?: "standard" | "gap_drill";
  gapDrill?: GapDrillSettings;
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
  coachLine?: string;
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

export function buildTodaysPlan(
  profile: Profile,
  options?: { sessionCount?: number; lastLog?: LogEntry | null }
): PracticePlan {
  const minutes = Number(profile.minutes || 15);
  const log = options?.lastLog ?? lastLog();
  const dayIndex = (options?.sessionCount ?? loadLogs().length) + 1;
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

  const coachLine = "Slow is strength. Fewer notes, cleaner sound.";

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
    coachLine,
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
  
  try {
    const { getSupabaseClient } = await import("./supabaseClient");
    const supabase = getSupabaseClient();
    if (!supabase) return [];
    
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error("[Drum] Auth error loading sessions:", authError.message);
      return [];
    }
    
    const user = userData?.user;
    if (!user) return [];
    
    const { data, error } = await supabase
      .from("drum_sessions")
      .select("id, ts, log, plan")
      .eq("user_id", user.id)
      .order("ts", { ascending: false });
      
    if (error) {
      console.error("[Drum] Database error loading sessions:", error.message);
      return [];
    }
    
    if (!data) return [];
    
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
  } catch (err) {
    console.error("[Drum] Failed to load remote sessions:", err);
    return [];
  }
}

async function syncLogToSupabase(log: LogEntry, plan?: PracticePlan) {
  try {
    const { getSupabaseClient } = await import("./supabaseClient");
    const supabase = getSupabaseClient();
    if (!supabase) return;
    
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error("[Drum] Auth error syncing log:", authError.message);
      return;
    }
    
    const user = userData?.user;
    if (!user) return;
    
    const { error } = await supabase.from("drum_sessions").insert({
      user_id: user.id,
      ts: log.ts,
      log,
      plan: plan ?? null,
    });
    
    if (error) {
      console.error("[Drum] Failed to sync log to Supabase:", error.message);
    }
  } catch (err) {
    console.error("[Drum] Error syncing log:", err);
    // Fail silently - local data is saved
  }
}

async function syncProfileToSupabase(profile: Profile) {
  try {
    const { getSupabaseClient } = await import("./supabaseClient");
    const supabase = getSupabaseClient();
    if (!supabase) return;
    
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error("[Drum] Auth error syncing profile:", authError.message);
      return;
    }
    
    const user = userData?.user;
    if (!user) return;
    
    const localCount = loadLogs().length;
    const { data: existing, error: existingError } = await supabase
      .from("drum_profiles")
      .select("session_count, current_module, module_started_at")
      .eq("user_id", user.id)
      .maybeSingle();
      
    if (existingError) {
      console.error("[Drum] Error fetching existing profile:", existingError.message);
    }
    
    const { count: remoteCount } = await supabase
      .from("drum_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
      
    const sessionCount = Math.max(
      Number(existing?.session_count ?? 0),
      Number(localCount),
      Number(remoteCount ?? 0)
    );
    const currentModule = profile.currentModule ?? existing?.current_module ?? 1;
    const moduleStartedAt = profile.moduleStartedAt ?? existing?.module_started_at ?? new Date().toISOString();
    
    const { error: upsertError } = await supabase.from("drum_profiles").upsert({
      user_id: user.id,
      level: profile.level,
      kit: profile.kit,
      minutes: profile.minutes,
      goal: profile.goal,
      session_count: sessionCount,
      current_module: currentModule,
      module_started_at: moduleStartedAt,
      updated_at: new Date().toISOString(),
    });
    
    if (upsertError) {
      console.error("[Drum] Failed to sync profile:", upsertError.message);
    }
  } catch (err) {
    console.error("[Drum] Error syncing profile:", err);
    // Fail silently - local data is saved
  }
}

async function bumpProfileSessionCount() {
  const { getSupabaseClient } = await import("./supabaseClient");
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return;
  const { data: existing } = await supabase
    .from("drum_profiles")
    .select("session_count")
    .eq("user_id", user.id)
    .maybeSingle();
  const { count: remoteCount } = await supabase
    .from("drum_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);
  const nextCount = Math.max(
    Number(existing?.session_count ?? 0),
    Number(remoteCount ?? 0)
  ) + 1;
  await supabase.from("drum_profiles").upsert({
    user_id: user.id,
    session_count: nextCount,
    updated_at: new Date().toISOString(),
  });
}

export async function loadProfileFromSupabase(): Promise<Profile | null> {
  try {
    const { getSupabaseClient } = await import("./supabaseClient");
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error("[Drum] Auth error loading profile:", authError.message);
      return null;
    }
    
    const user = userData?.user;
    if (!user) return null;
    
    const { data, error } = await supabase
      .from("drum_profiles")
      .select("level, kit, minutes, goal, current_module, module_started_at")
      .eq("user_id", user.id)
      .maybeSingle();
      
    if (error) {
      console.error("[Drum] Error loading profile from Supabase:", error.message);
      return null;
    }
    
    if (!data) return null;
    
    return {
      level: data.level as Profile["level"],
      kit: data.kit as Profile["kit"],
      minutes: Number(data.minutes || 15),
      goal: data.goal as Profile["goal"],
      currentModule: data.current_module ?? 1,
      moduleStartedAt: data.module_started_at ?? undefined,
    };
  } catch (err) {
    console.error("[Drum] Failed to load profile from Supabase:", err);
    return null;
  }
}

export async function advanceModule(): Promise<number | null> {
  const { getSupabaseClient } = await import("./supabaseClient");
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return null;
  const { data: existing } = await supabase
    .from("drum_profiles")
    .select("current_module")
    .eq("user_id", user.id)
    .maybeSingle();
  const current = existing?.current_module ?? 1;
  const next = Math.min(current + 1, 4);
  if (next === current) return current;
  await supabase.from("drum_profiles").update({
    current_module: next,
    module_started_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq("user_id", user.id);
  return next;
}

export async function getModuleProgress(): Promise<{
  currentModule: number;
  moduleStartedAt: string | null;
  sessionCount: number;
  sessionsInModule: number;
} | null> {
  try {
    const { getSupabaseClient } = await import("./supabaseClient");
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error("[Drum] Auth error getting module progress:", authError.message);
      return null;
    }
    
    const user = userData?.user;
    if (!user) return null;
    
    const { data: profile, error: profileError } = await supabase
      .from("drum_profiles")
      .select("current_module, module_started_at, session_count")
      .eq("user_id", user.id)
      .maybeSingle();
      
    if (profileError) {
      console.error("[Drum] Error fetching module progress:", profileError.message);
      return null;
    }
    
    if (!profile) return null;
    
    const moduleStartedAt = profile.module_started_at;
    let sessionsInModule = 0;
    
    if (moduleStartedAt) {
      const { count, error: countError } = await supabase
        .from("drum_sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("ts", moduleStartedAt);
        
      if (countError) {
        console.error("[Drum] Error counting sessions in module:", countError.message);
      } else {
        sessionsInModule = count ?? 0;
      }
    }
    
    return {
      currentModule: profile.current_module ?? 1,
      moduleStartedAt: profile.module_started_at ?? null,
      sessionCount: profile.session_count ?? 0,
      sessionsInModule,
    };
  } catch (err) {
    console.error("[Drum] Failed to get module progress:", err);
    return null;
  }
}
