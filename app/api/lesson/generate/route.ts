import { NextResponse } from "next/server";
import type { PracticePlan, Profile, LogEntry, PracticeBlock } from "../../../drum/_lib/drumMvp";

export const runtime = "nodejs";

type LessonRequest = {
  profile: Profile;
  recentLogs?: LogEntry[];
  dayIndex?: number;
  lastPlan?: PracticePlan | null;
};

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

  const system = buildSystemPrompt();
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

    const plan = normalizePlan(parsed, payload.profile);
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

function buildSystemPrompt() {
  return [
    "You are the Quiet Master drum instructor.",
    "Tone: calm, grounded, minimal, precise. No hype. No fluff.",
    "You must return JSON only. Output must be a single JSON object.",
    "No markdown. No extra commentary.",
    "You teach a text-only drum course (no video).",
    "You must use descriptive vocabulary, metaphors, and onomatopoeia.",
    "Core 80/20 pillars: Cleanliness, Time, Vocabulary, Self-audit.",
    "Structure every lesson into blocks with clear stop conditions.",
    "Use metronome/timer instructions. Emphasize internal clock.",
    "Include a short coachLine with Quiet Master voice.",
  ].join(" ");
}

function buildUserPrompt(payload: LessonRequest) {
  const { profile, recentLogs, dayIndex, lastPlan } = payload;
  const summary = summarizeLogs(recentLogs || []);
  const lastFocus = lastPlan?.focus ? `Last focus: ${lastPlan.focus}.` : "";

  return [
    "Generate today's practice card JSON with fields:",
    "minutes, metronome, focus, coachLine, contextLine, blocks, reflection, closure.",
    "Each block has: title, time, bullets, optional stop array.",
    "Reflection should be a short list of prompts (strings).",
    "Constraints:",
    "- 2 to 5 blocks total",
    "- bullets per block: 3 to 6",
    "- keep total length concise",
    "- beginner-friendly if true_beginner",
    "- use movement metaphors (e.g., 'holding a bird', 'wave', 'boom-chack')",
    "- include at least one audio/ear-training cue",
    "- include a self-audit item",
    "- avoid technical anatomy language",
    "- no video references",
    `Profile: level=${profile.level}, kit=${profile.kit}, minutes=${profile.minutes}, goal=${profile.goal}.`,
    dayIndex ? `Day index: ${dayIndex}.` : "",
    summary ? `Recent log summary: ${summary}.` : "",
    lastFocus,
    "Return JSON only.",
  ]
    .filter(Boolean)
    .join(" ");
}

function summarizeLogs(logs: LogEntry[]) {
  if (!logs.length) return "";
  const last = logs[logs.length - 1];
  const broke = last?.broke || "";
  const felt = last?.felt || "";
  const note = last?.note ? `Note: ${last.note}.` : "";
  return `Last session broke=${broke}, felt=${felt}. ${note}`.trim();
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

function normalizePlan(raw: unknown, profile: Profile): PracticePlan | null {
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
    reflection.push(
      "What broke first? (time / control / coordination / feel / nothing)",
      "How did it feel? (easier / about right / harder)",
      "Record 20-30 seconds and listen back."
    );
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
