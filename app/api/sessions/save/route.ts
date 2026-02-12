import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { accessToken, session } = body;

    if (!accessToken || !session) {
      return NextResponse.json({ error: "Missing accessToken or session" }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user from access token
    const { data: userData, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !userData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = userData.user.id;

    // Save the session
    const { error: insertError } = await supabase.from("drum_sessions").insert({
      user_id: userId,
      ts: session.ts,
      log: session.log,
      plan: session.plan || null,
    });

    if (insertError) {
      console.error("[API] Session save error:", insertError.message);
      return NextResponse.json({ error: "Failed to save session" }, { status: 500 });
    }

    // Bump session count on profile
    const { data: profile } = await supabase
      .from("drum_profiles")
      .select("session_count")
      .eq("user_id", userId)
      .maybeSingle();

    const { count: remoteCount } = await supabase
      .from("drum_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    const nextCount = Math.max(
      Number(profile?.session_count ?? 0),
      Number(remoteCount ?? 0)
    );

    await supabase.from("drum_profiles").upsert({
      user_id: userId,
      session_count: nextCount,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, sessionCount: nextCount });
  } catch (err) {
    console.error("[API] Session save unexpected error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
