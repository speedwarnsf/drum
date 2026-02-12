import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function getUser(accessToken: string) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data?.user) return null;
  return { user: data.user, supabase };
}

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const auth = await getUser(token);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: goals, error } = await auth.supabase
    .from("drum_practice_goals")
    .select("*")
    .eq("user_id", auth.user.id)
    .order("starts_at", { ascending: false })
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Calculate progress for active goals
  const now = new Date();
  const enrichedGoals = await Promise.all(
    (goals || []).map(async (goal: any) => {
      const isActive = new Date(goal.starts_at) <= now && new Date(goal.ends_at) >= now;
      if (!isActive) return { ...goal, progress: null };

      // Get sessions within goal period
      const { data: sessions, error: sessError } = await auth.supabase
        .from("drum_sessions")
        .select("ts, log, plan")
        .eq("user_id", auth.user.id)
        .gte("ts", goal.starts_at)
        .lte("ts", goal.ends_at);

      if (sessError) return { ...goal, progress: null };

      const totalSessions = sessions?.length || 0;
      const totalMinutes = (sessions || []).reduce((sum: number, s: any) => {
        return sum + (s.plan?.minutes || 15);
      }, 0);

      // Calculate streak within period
      const dates = new Set(
        (sessions || []).map((s: any) =>
          new Date(s.ts).toISOString().slice(0, 10)
        )
      );
      let streak = 0;
      let maxStreak = 0;
      const sortedDates = Array.from(dates).sort();
      for (let i = 0; i < sortedDates.length; i++) {
        if (i === 0) {
          streak = 1;
        } else {
          const prev = new Date(sortedDates[i - 1]);
          const curr = new Date(sortedDates[i]);
          const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
          streak = diffDays <= 1 ? streak + 1 : 1;
        }
        maxStreak = Math.max(maxStreak, streak);
      }

      return {
        ...goal,
        progress: {
          minutes: totalMinutes,
          sessions: totalSessions,
          streak: maxStreak,
          minutesPercent: Math.min(100, Math.round((totalMinutes / goal.target_minutes) * 100)),
          sessionsPercent: Math.min(100, Math.round((totalSessions / goal.target_sessions) * 100)),
          streakPercent: Math.min(100, Math.round((maxStreak / goal.target_streak) * 100)),
        },
      };
    })
  );

  return NextResponse.json({ goals: enrichedGoals });
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const auth = await getUser(token);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { goalType, targetMinutes, targetSessions, targetStreak } = body;

  // Calculate date range
  const now = new Date();
  const startsAt = now.toISOString().slice(0, 10);
  let endsAt: string;

  if (goalType === "weekly") {
    const end = new Date(now);
    end.setDate(end.getDate() + (7 - end.getDay())); // End of week (Sunday)
    endsAt = end.toISOString().slice(0, 10);
  } else if (goalType === "monthly") {
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endsAt = end.toISOString().slice(0, 10);
  } else {
    endsAt = body.endsAt || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  }

  const { data, error } = await auth.supabase.from("drum_practice_goals").insert({
    user_id: auth.user.id,
    goal_type: goalType || "weekly",
    target_minutes: targetMinutes || 60,
    target_sessions: targetSessions || 5,
    target_streak: targetStreak || 3,
    starts_at: startsAt,
    ends_at: endsAt,
  }).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ goal: data });
}
