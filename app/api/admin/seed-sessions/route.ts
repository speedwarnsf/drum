import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../drum/_lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Supabase admin not configured" }, { status: 500 });
  }

  const body = await req.json().catch(() => null);
  const accessToken = body?.accessToken as string | undefined;
  if (!accessToken) {
    return NextResponse.json({ error: "Missing access token" }, { status: 400 });
  }

  const { data: userData, error: userError } = await admin.auth.getUser(accessToken);
  if (userError || !userData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = userData.user;
  const adminEmail =
    process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || "";
  const isAdmin =
    !!adminEmail &&
    !!user.email &&
    user.email.toLowerCase() === adminEmail.toLowerCase();

  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { count } = await admin
    .from("drum_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if ((count ?? 0) >= 3) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const now = Date.now();
  const sessions = [
    {
      ts: new Date(now - 1000 * 60 * 60 * 24 * 3).toISOString(),
      log: { broke: "time", felt: "right", ts: new Date(now - 1000 * 60 * 60 * 24 * 3).toISOString() },
      plan: { focus: "Comfort + time", minutes: 15, metronome: "60 BPM (quarters)" },
    },
    {
      ts: new Date(now - 1000 * 60 * 60 * 24 * 2).toISOString(),
      log: { broke: "control", felt: "right", ts: new Date(now - 1000 * 60 * 60 * 24 * 2).toISOString() },
      plan: { focus: "Calm time + even strokes", minutes: 15, metronome: "60 BPM (quarters)" },
    },
    {
      ts: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
      log: { broke: "nothing", felt: "easier", ts: new Date(now - 1000 * 60 * 60 * 24).toISOString() },
      plan: { focus: "First coordination step", minutes: 15, metronome: "65 BPM (quarters)" },
    },
  ];

  const inserts = sessions.map((s) => ({
    user_id: user.id,
    ts: s.ts,
    log: s.log,
    plan: s.plan,
  }));

  const { error: insertError } = await admin.from("drum_sessions").insert(inserts);
  if (insertError) {
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }

  await admin.from("drum_profiles").upsert({
    user_id: user.id,
    session_count: 3,
    updated_at: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, seeded: true });
}
