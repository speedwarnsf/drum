import { NextResponse } from "next/server";
import type { PracticePlan, Profile, LogEntry, PracticeBlock } from "../../../drum/_lib/drumMvp";

export const runtime = "nodejs";

type LessonRequest = {
  profile: Profile;
  recentLogs?: LogEntry[];
  dayIndex?: number;
  lastPlan?: PracticePlan | null;
  currentModule?: number;
};

/**
 * Module-specific pedagogy from research synthesis.
 * Each module has constraints, teaching approach, and vocabulary.
 */
const MODULE_CONTEXT = {
  1: {
    name: "Clean Sound",
    subtitle: "The Personal Drum Troupe",
    focus: "Unison strikes, grip comfort, even tone. Stop on flams.",
    pedagogicalGoal: "Establish the 'Personal Drum Troupe' - when all your limbs sound like ONE drummer",
    constraints: [
      "Focus exclusively on grip, tone, and clean unison strikes",
      "No coordination exercises (no simultaneous hands/feet until clean)",
      "Stop IMMEDIATELY if player produces flams (two notes instead of one)",
      "Emphasize rebound, letting stick bounce naturally",
      "Single-surface work only (snare or practice pad)",
      "Use the 'Hidden Coordination Flaw' diagnostic: Kick + Right Hand together 20x, listen for 'Thud' (good) vs 'Ka-Thunk' (flam)",
    ],
    hapticCues: [
      "Grip: Hold the stick like a small bird—secure, but never squeezing",
      "Rebound: Let the stick bounce like a ball on pavement",
      "Stroke: Imagine shaking water off your fingertips (Moeller whip)",
      "Pressure: Fulcrum is a pivot point, not a vice grip",
    ],
    rhythmSyllables: {
      quarter: "Du",
      eighth: "Du-De",
      sixteenth: "Du-Ta-De-Ta",
    },
    stopConditions: [
      "Stop if you hear a flam (two attacks instead of one)",
      "Stop if shoulders rise above neutral",
      "Stop if grip tightens into a fist",
      "Stop if forearms burn (you're muscling it)",
    ],
    drills: [
      "Unison Check: Play kick + snare together 20x. Record. Listen. One sound or two?",
      "Bird Grip Reset: Open hands fully, let sticks roll to fingers, close gently",
      "Single Surface Singles: One hand at a time, matching volume L to R",
    ],
  },
  2: {
    name: "Internal Clock",
    subtitle: "Metric Projection",
    focus: "Walk and sing, off-beat clicks, gap drills.",
    pedagogicalGoal: "PROJECT the beat instead of REACTING to it. The metronome confirms, not leads.",
    constraints: [
      "Focus on internalizing the pulse, not chasing the metronome",
      "Include gap drills (metronome on/off cycles) - these FORCE projection",
      "Use off-beat click exercises (click on 2 and 4, or on 'ands')",
      "Walking/stepping exercises to embody time physically",
      "Singing/vocalizing the groove BEFORE playing (audiation)",
      "Visualize silence as distance to travel, not emptiness to fill",
    ],
    hapticCues: [
      "Walking: Feel tempo in your hips, not just your ears",
      "Breathing: Exhale on beat 1, let rhythm sync to breath",
      "Weight: Heavier on 2 and 4 (backbeat), like a confident stride",
      "Flow: Moving through honey—constant resistance, constant motion",
    ],
    rhythmSyllables: {
      quarter: "Du",
      eighth: "Du-De",
      sixteenth: "Du-Ta-De-Ta",
      rest: "(rest)",
      onomatopoeia: "Boom-Chack (kick-snare)",
    },
    stopConditions: [
      "Stop if you speed up during gaps (rushing = not projecting)",
      "Stop if you wait for the click to re-enter (reacting, not projecting)",
      "Stop if you can't sing the groove before playing it",
    ],
    drills: [
      "Walk the Tempo: Step side-to-side with metronome. L foot, R foot. Now clap 'Du-De' over steps.",
      "Gap Drill (Easy): 8 clicks on, 4 clicks silent. Maintain groove. Were you aligned when click returned?",
      "Off-beat Click: Set click to play on 2 and 4 only. You fill in 1 and 3.",
      "Sing Before Play: Vocalize 'Boom-Chack' for 4 bars, then play it.",
    ],
  },
  3: {
    name: "Vocabulary + Flow",
    subtitle: "Real World Options",
    focus: "Singles, doubles, paradiddles, short scripted loops.",
    pedagogicalGoal: "Build a vocabulary of patterns that give you OPTIONS in real musical situations",
    constraints: [
      "Introduce rudiments: singles, doubles, paradiddles (in that order)",
      "Short scripted loops and patterns (never full songs yet)",
      "Combine rudiments into flowing sequences",
      "Light coordination (simple hi-hat + snare patterns)",
      "Keep vocabulary simple and repeatable",
      "Follow staged motor learning: isolate each limb, then combine (degrees of freedom)",
    ],
    hapticCues: [
      "Singles: Even alternation, like walking—no limping",
      "Doubles: Bounce-bounce, like a basketball double-dribble",
      "Paradiddles: Accent the first note of each group, whisper the rest",
      "Flow: Think of rudiments as words, patterns as sentences",
    ],
    rhythmSyllables: {
      singles: "R-L-R-L or Du-De-Du-De",
      doubles: "R-R-L-L or Du-Du-De-De",
      paradiddle: "R-L-R-R-L-R-L-L (Du-de-du-DU)",
    },
    stopConditions: [
      "Stop if singles become uneven (one hand louder than the other)",
      "Stop if doubles lose their bounce (muscling the second stroke)",
      "Stop if paradiddle accents disappear",
    ],
    drills: [
      "Single Stroke Roll: RLRL at 60 BPM, matching volume perfectly",
      "Double Stroke Roll: RRLL, let the stick bounce for the second hit",
      "Paradiddle: RLRR LRLL, accent beat 1 of each group",
      "3-Way Combo: 4 bars singles, 4 bars doubles, 4 bars paradiddles, no stopping",
    ],
  },
  4: {
    name: "The Audit",
    subtitle: "Self-Evaluation Loop",
    focus: "Record 30 seconds, listen for alignment and consistency.",
    pedagogicalGoal: "Develop the self-audit skill: record → listen → identify → fix → repeat",
    constraints: [
      "Always include a recording/listening exercise",
      "Focus on self-assessment and ear training",
      "Check for alignment between kick and snare (flam detection)",
      "Listen for even spacing in hi-hat patterns",
      "Review consistency of tone and volume",
      "Use the checklist approach: specific criteria, not vague 'does it sound good?'",
    ],
    hapticCues: [
      "Listening: Close your eyes. Flams are easier to hear than feel.",
      "Alignment: Does kick + snare sound like 'THUD' or 'ka-THUNK'?",
      "Spacing: Are hi-hat hits evenly spaced, or do some rush?",
    ],
    rhythmSyllables: {
      auditFocus: "Listen for: Du (clean) vs Du-uh (flam)",
    },
    stopConditions: [
      "Stop if you're playing without recording (audit requires evidence)",
      "Stop if you can't identify ONE specific thing to improve",
    ],
    drills: [
      "30-Second Recording: Play simple groove, record, listen back immediately",
      "Flam Detection: Listen for kick+snare hits. One sound or two?",
      "Spacing Audit: Listen to hi-hat. Even spacing or rushing?",
      "Volume Audit: Is every hi-hat hit the same volume?",
    ],
    auditChecklist: [
      "Are kick and snare aligned? (no flams)",
      "Is hi-hat spacing even?",
      "Is volume consistent across all hits?",
      "Did tempo stay steady from start to end?",
      "Any unwanted ghost notes or doubles?",
    ],
  },
} as const;

type AiResponse = {
  plan: PracticePlan;
};

type OpenAIResponse = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
};

const MODEL_DEFAULT = "gpt-5.2";

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY missing" }, { status: 500 });
  }

  let payload: LessonRequest;
  try {
    payload = (await req.json()) as LessonRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!payload?.profile) {
    return NextResponse.json({ error: "Missing profile" }, { status: 400 });
  }

  const model = process.env.OPENAI_MODEL || MODEL_DEFAULT;
  const maxOutputTokens = Number(process.env.OPENAI_MAX_OUTPUT_TOKENS || 2000);
  const moduleNum = payload.currentModule ?? 1;

  const system = buildSystemPrompt(moduleNum);
  const user = buildUserPrompt(payload);

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: [
          {
            role: "system",
            content: [{ type: "input_text", text: system }],
          },
          {
            role: "user",
            content: [{ type: "input_text", text: user }],
          },
        ],
        max_output_tokens: maxOutputTokens,
        temperature: 0.7,
        text: {
          format: { type: "json_object" },
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: errorText }, { status: 500 });
    }

    const data = (await response.json()) as OpenAIResponse;
    const text = extractOutputText(data);
    if (!text) {
      return NextResponse.json({ error: "No output text" }, { status: 500 });
    }

    const parsed = safeParseJson(text);
    if (!parsed) {
      return NextResponse.json({ error: "Invalid JSON output" }, { status: 500 });
    }

    const plan = normalizePlan(parsed, payload.profile, moduleNum);
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan structure" }, { status: 500 });
    }

    const out: AiResponse = { plan };
    return NextResponse.json(out);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "AI error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function buildSystemPrompt(moduleNum: number) {
  const moduleCtx = MODULE_CONTEXT[moduleNum as keyof typeof MODULE_CONTEXT] || MODULE_CONTEXT[1];
  
  return [
    "You are the Quiet Master drum instructor.",
    "",
    "## Voice & Tone",
    "Calm, grounded, minimal, precise. No hype. No fluff. No cheerleading.",
    "You speak like a patient master craftsman: few words, each one earns its place.",
    "",
    "## Output Format",
    "Return JSON only. No markdown. No commentary.",
    "Single JSON object with: minutes, metronome, focus, coachLine, contextLine, blocks, reflection, closure.",
    "",
    "## Teaching Philosophy (The 80/20 Pillars)",
    "This course focuses on THREE things that matter most:",
    "1. CLEANLINESS - The 'Personal Drum Troupe' concept: all limbs sound like ONE drummer",
    "2. TIME - Metric Projection: PROJECT the beat, don't REACT to it",
    "3. OPTIONS - Real vocabulary that gives you choices in musical situations",
    "",
    "## Rhythm Syllables (Gordon Method - ALWAYS USE THESE)",
    "Replace counting (1-2-3-4) with audiation syllables:",
    "- Quarter notes: 'Du'",
    "- Eighth notes: 'Du-De'",
    "- Sixteenth notes: 'Du-Ta-De-Ta'",
    "- Also use onomatopoeia: 'Boom' (kick), 'Chack' (snare), 'Tss' (hi-hat)",
    "",
    "## Haptic Metaphors (for text-only instruction)",
    "Since we can't show video, use vivid physical imagery:",
    "- Grip: 'Hold like a small bird—secure, never squeezing'",
    "- Rebound: 'Let the stick bounce like a ball on pavement'",
    "- Moeller: 'Shaking water off your fingertips'",
    "- Flow: 'Moving through honey—constant resistance, constant motion'",
    "- Weight: 'Heavier on 2 and 4, like a confident stride'",
    "",
    "## Staged Motor Learning",
    "Never present a full groove immediately. Always:",
    "1. Isolate each limb first (reduce 'degrees of freedom')",
    "2. Combine two limbs only when each is clean alone",
    "3. Add complexity incrementally",
    "",
    `## CURRENT MODULE: ${moduleNum} - ${moduleCtx.name}`,
    `Subtitle: ${moduleCtx.subtitle}`,
    `Focus: ${moduleCtx.focus}`,
    `Pedagogical Goal: ${moduleCtx.pedagogicalGoal}`,
    "",
    "## Module-Specific Constraints (MUST FOLLOW):",
    ...moduleCtx.constraints.map((c) => `- ${c}`),
    "",
    "## Module-Specific Haptic Cues (USE THESE):",
    ...moduleCtx.hapticCues.map((c) => `- ${c}`),
    "",
    "## Module-Specific Stop Conditions (INCLUDE IN LESSONS):",
    ...moduleCtx.stopConditions.map((c) => `- ${c}`),
    "",
    "## Module-Specific Drills (DRAW FROM THESE):",
    ...moduleCtx.drills.map((d) => `- ${d}`),
  ].join("\n");
}

function buildUserPrompt(payload: LessonRequest) {
  const { profile, recentLogs, dayIndex, lastPlan, currentModule } = payload;
  const summary = summarizeLogs(recentLogs || []);
  const lastFocus = lastPlan?.focus ? `Last focus: ${lastPlan.focus}.` : "";
  const moduleNum = currentModule ?? 1;
  const moduleCtx = MODULE_CONTEXT[moduleNum as keyof typeof MODULE_CONTEXT] || MODULE_CONTEXT[1];

  return [
    "Generate today's practice card JSON with these fields:",
    "",
    "Required fields:",
    "- minutes: number (session duration)",
    "- metronome: string (e.g., '60 BPM (quarters)')",
    "- focus: string (today's main goal)",
    "- coachLine: string (one short Quiet Master phrase)",
    "- contextLine: string (why today's session is structured this way)",
    "- blocks: array of practice blocks",
    "- reflection: array of reflection prompts (strings)",
    "- closure: string (the stopping instruction)",
    "",
    "Each block must have:",
    "- title: string",
    "- time: string (e.g., '5 min')",
    "- bullets: array of instruction strings (3-6 items)",
    "- stop: optional array of stop conditions",
    "",
    "## Content Requirements:",
    "- Use rhythm syllables: 'Du' (quarter), 'Du-De' (eighth), 'Du-Ta-De-Ta' (sixteenth)",
    "- Use onomatopoeia: 'Boom' (kick), 'Chack' (snare), 'Tss' (hi-hat)",
    "- Include haptic metaphors for physical sensations",
    "- Include at least one stop condition per block",
    "- Include at least one self-audit/recording prompt in reflection",
    "- Avoid technical anatomy language",
    "- No video references (this is a text-only course)",
    "",
    "## Constraints:",
    "- 2 to 5 blocks total",
    "- 3 to 6 bullets per block",
    "- Keep total length concise",
    "- Beginner-friendly if true_beginner",
    "",
    `## Student Profile:`,
    `- Level: ${profile.level}`,
    `- Kit: ${profile.kit}`,
    `- Session length: ${profile.minutes} minutes`,
    `- Goal: ${profile.goal}`,
    "",
    `## Current Module: ${moduleNum} (${moduleCtx.name})`,
    `Module focus: ${moduleCtx.focus}`,
    `Pedagogical goal: ${moduleCtx.pedagogicalGoal}`,
    "",
    "IMPORTANT: Lesson content must align with the current module constraints.",
    "",
    dayIndex ? `Day index: ${dayIndex}.` : "",
    summary ? `Recent session summary: ${summary}.` : "",
    lastFocus,
    "",
    "Return JSON only.",
  ]
    .filter(Boolean)
    .join("\n");
}

function summarizeLogs(logs: LogEntry[]) {
  if (!logs.length) return "";
  const last = logs[logs.length - 1];
  const broke = last?.broke || "";
  const felt = last?.felt || "";
  const note = last?.note ? `Note: ${last.note}.` : "";
  return `Last session: broke=${broke}, felt=${felt}. ${note}`.trim();
}

function extractOutputText(data: OpenAIResponse): string | null {
  if (typeof data?.output_text === "string") return data.output_text;
  const items = Array.isArray(data?.output) ? data.output : [];
  for (const item of items) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const part of content) {
      if (part?.type === "output_text" && typeof part.text === "string") {
        return part.text;
      }
    }
  }
  return null;
}

function safeParseJson(text: string): unknown | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function normalizePlan(raw: unknown, profile: Profile, moduleNum: number): PracticePlan | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const minutes = Number(record.minutes || profile.minutes || 15);
  const metronome = typeof record.metronome === "string" ? record.metronome : "60 BPM (quarters)";
  const focus = typeof record.focus === "string" ? record.focus : "Comfort + time";
  const coachLine = typeof record.coachLine === "string" ? record.coachLine : undefined;
  const contextLine = typeof record.contextLine === "string" ? record.contextLine : "Today we build calm control.";
  const closure = typeof record.closure === "string" ? record.closure : "Stop here. More time today will not help.";

  const blocks = normalizeBlocks(record.blocks);
  if (!blocks.length) return null;

  const reflection = Array.isArray(record.reflection) ? record.reflection.filter(isString).slice(0, 6) : [];
  if (!reflection.length) {
    reflection.push(...getDefaultReflection(moduleNum));
  }

  return {
    minutes,
    metronome,
    focus,
    coachLine,
    contextLine,
    blocks,
    reflection,
    closure,
  };
}

function getDefaultReflection(moduleNum: number): string[] {
  const base = [
    "What broke first? (time / control / coordination / feel / nothing)",
    "How did it feel? (easier / about right / harder)",
  ];
  
  const moduleSpecific: Record<number, string[]> = {
    1: [
      "Record kick + snare together 20 times. Does it sound like 'Thud' (good) or 'Ka-Thunk' (flam)?",
      "Did you catch yourself squeezing the sticks? When?",
    ],
    2: [
      "During the gap, did you speed up or slow down? (Be honest—reacting vs projecting)",
      "Could you feel the pulse in your body when the click was silent?",
    ],
    3: [
      "Which rudiment felt most natural? Which felt forced?",
      "Are your singles truly even (L = R volume)?",
    ],
    4: [
      "Listen to your recording. Name ONE specific thing to improve.",
      "Check: kick/snare aligned? Hi-hat spacing even? Volume consistent?",
    ],
  };
  
  return [...base, ...(moduleSpecific[moduleNum] || moduleSpecific[1])];
}

function normalizeBlocks(rawBlocks: unknown): PracticeBlock[] {
  if (!Array.isArray(rawBlocks)) return [];
  const blocks = rawBlocks
    .map((block) => {
      if (!block || typeof block !== "object") return null;
      const entry = block as Record<string, unknown>;
      const title = typeof entry.title === "string" ? entry.title : null;
      const time = typeof entry.time === "string" ? entry.time : null;
      const bullets = Array.isArray(entry.bullets)
        ? entry.bullets.filter(isString).slice(0, 8)
        : [];
      const stop = Array.isArray(entry.stop) ? entry.stop.filter(isString).slice(0, 3) : undefined;
      if (!title || !time || bullets.length < 2) return null;
      return { title, time, bullets, stop } as PracticeBlock;
    })
    .filter(Boolean) as PracticeBlock[];
  return blocks.slice(0, 5);
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
