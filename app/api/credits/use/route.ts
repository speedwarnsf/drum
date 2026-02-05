import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../drum/_lib/supabaseAdmin";

export async function POST(req: Request) {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Supabase admin not configured" }, { status: 500 });
  }

  const body = await req.json().catch(() => null);
  const accessToken = body?.accessToken as string | undefined;
  const lessonId = body?.lessonId as string | undefined;
  if (!accessToken || !lessonId) {
    return NextResponse.json({ error: "Missing access token or lesson id" }, { status: 400 });
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
  if (isAdmin) {
    return NextResponse.json({ ok: true, remaining: null, admin: true });
  }

  const { data: used } = await admin
    .from("drum_lesson_uses")
    .select("id")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();
  if (used) {
    return NextResponse.json({ ok: true, remaining: null, alreadyUsed: true });
  }

  const { data: ent } = await admin
    .from("drum_entitlements")
    .select("lesson_credits")
    .eq("user_id", user.id)
    .maybeSingle();
  const credits = Number(ent?.lesson_credits ?? 0);
  if (credits <= 0) {
    return NextResponse.json({ ok: false, reason: "no_credits" }, { status: 402 });
  }

  const { error: useError } = await admin.from("drum_lesson_uses").insert({
    user_id: user.id,
    lesson_id: lessonId,
  });
  if (useError) {
    return NextResponse.json({ error: "Unable to reserve lesson" }, { status: 500 });
  }

  const remaining = credits - 1;
  await admin
    .from("drum_entitlements")
    .update({ lesson_credits: remaining, updated_at: new Date().toISOString() })
    .eq("user_id", user.id);

  return NextResponse.json({ ok: true, remaining });
}
