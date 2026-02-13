import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data: userData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !userData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = userData.user.id;

  // Fetch all sessions
  const { data: sessions, error: sessError } = await supabase
    .from("drum_sessions")
    .select("ts, log, plan")
    .eq("user_id", userId)
    .order("ts", { ascending: true });

  if (sessError) {
    return NextResponse.json({ error: sessError.message }, { status: 500 });
  }

  const allSessions = sessions || [];

  // Weekly breakdown (last 8 weeks)
  const weeklyBreakdown = computeWeeklyBreakdown(allSessions);

  // Most practiced focus areas
  const focusCounts: Record<string, number> = {};
  const brokeCounts: Record<string, number> = {};
  const feltCounts: Record<string, number> = {};

  for (const s of allSessions) {
    const focus = (s as any).plan?.focus || "unknown";
    focusCounts[focus] = (focusCounts[focus] || 0) + 1;

    const broke = (s as any).log?.broke || "unknown";
    brokeCounts[broke] = (brokeCounts[broke] || 0) + 1;

    const felt = (s as any).log?.felt || "unknown";
    feltCounts[felt] = (feltCounts[felt] || 0) + 1;
  }

  // Practice consistency (sessions per day of week)
  const dayOfWeekCounts: number[] = [0, 0, 0, 0, 0, 0, 0];
  for (const s of allSessions) {
    const day = new Date((s as any).ts).getDay();
    dayOfWeekCounts[day]++;
  }

  // Time of day distribution
  const hourCounts: number[] = new Array(24).fill(0);
  for (const s of allSessions) {
    const hour = new Date((s as any).ts).getHours();
    hourCounts[hour]++;
  }

  // Streak calculation
  const dates = new Set(
    allSessions.map((s: any) => new Date(s.ts).toISOString().slice(0, 10))
  );
  const sortedDates = Array.from(dates).sort();
  let currentStreak = 0;
  let maxStreak = 0;
  let streak = 0;

  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      streak = 1;
    } else {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      streak = diff <= 1 ? streak + 1 : 1;
    }
    maxStreak = Math.max(maxStreak, streak);
  }

  // Check if current streak is active (last practice within 1 day)
  if (sortedDates.length > 0) {
    const lastDate = new Date(sortedDates[sortedDates.length - 1]);
    const now = new Date();
    const daysSinceLast = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
    currentStreak = daysSinceLast <= 1.5 ? streak : 0;
  }

  // Total minutes
  const totalMinutes = allSessions.reduce((sum: number, s: any) => {
    return sum + (s.plan?.minutes || 15);
  }, 0);

  // Generate text insights
  const insights: string[] = [];

  // Best day to practice
  const bestDay = dayOfWeekCounts.indexOf(Math.max(...dayOfWeekCounts));
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  if (allSessions.length >= 5) {
    insights.push(`Your most consistent practice day is ${dayNames[bestDay]}.`);
  }

  // Most common break point
  const topBroke = Object.entries(brokeCounts).sort((a, b) => b[1] - a[1])[0];
  if (topBroke && topBroke[0] !== "nothing" && topBroke[0] !== "unknown") {
    insights.push(`Your most common challenge area is "${topBroke[0]}" — focus extra attention here.`);
  }

  // Improvement trend
  const recentSessions = allSessions.slice(-10);
  const earlyNothingRate = allSessions.slice(0, Math.min(10, allSessions.length))
    .filter((s: any) => s.log?.broke === "nothing").length / Math.min(10, allSessions.length);
  const recentNothingRate = recentSessions
    .filter((s: any) => s.log?.broke === "nothing").length / recentSessions.length;

  if (allSessions.length >= 10 && recentNothingRate > earlyNothingRate + 0.1) {
    insights.push("Your recent sessions show improvement — fewer breakdowns than when you started! ");
  }

  if (currentStreak >= 3) {
    insights.push(`You're on a ${currentStreak}-day streak! Keep the momentum going. `);
  }

  // Preferred practice time
  const bestHour = hourCounts.indexOf(Math.max(...hourCounts));
  if (allSessions.length >= 5) {
    const period = bestHour < 12 ? "morning" : bestHour < 17 ? "afternoon" : "evening";
    insights.push(`You tend to practice in the ${period} — that's your rhythm sweet spot.`);
  }

  return NextResponse.json({
    totalSessions: allSessions.length,
    totalMinutes,
    currentStreak,
    maxStreak,
    weeklyBreakdown,
    focusCounts,
    brokeCounts,
    feltCounts,
    dayOfWeekCounts,
    hourCounts,
    insights,
  });
}

function computeWeeklyBreakdown(sessions: any[]) {
  const weeks: Record<string, { sessions: number; minutes: number }> = {};
  
  for (const s of sessions) {
    const date = new Date(s.ts);
    // Get Monday of the week
    const day = date.getDay();
    const monday = new Date(date);
    monday.setDate(date.getDate() - ((day + 6) % 7));
    const weekKey = monday.toISOString().slice(0, 10);

    if (!weeks[weekKey]) {
      weeks[weekKey] = { sessions: 0, minutes: 0 };
    }
    weeks[weekKey].sessions++;
    weeks[weekKey].minutes += s.plan?.minutes || 15;
  }

  // Return last 8 weeks
  const sortedWeeks = Object.entries(weeks)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 8)
    .reverse();

  return sortedWeeks.map(([week, data]) => ({
    week,
    ...data,
  }));
}
