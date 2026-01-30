"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "../_lib/supabaseClient";

export default function LessonCredits() {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [credits, setCredits] = useState<number | null>(null);
  const [hasEntitlement, setHasEntitlement] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [lessonCount, setLessonCount] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    supabase.auth.getUser().then(async ({ data }) => {
      const user = data.user;
      if (!user) return;
      setUserEmail(user.email ?? null);
      const adminMatch =
        !!adminEmail &&
        !!user.email &&
        user.email.toLowerCase() === adminEmail.toLowerCase();
      if (adminMatch) setIsAdmin(true);
      const { data: ent } = await supabase
        .from("drum_entitlements")
        .select("lesson_credits")
        .eq("user_id", user.id)
        .maybeSingle();
      if (ent?.lesson_credits !== undefined && ent?.lesson_credits !== null) {
        setCredits(ent.lesson_credits);
        setHasEntitlement(true);
      } else {
        setCredits(0);
        setHasEntitlement(false);
      }
      const { data: profile } = await supabase
        .from("drum_profiles")
        .select("session_count")
        .eq("user_id", user.id)
        .maybeSingle();
      const profileCount =
        profile?.session_count !== undefined && profile?.session_count !== null
          ? Number(profile.session_count)
          : null;
      const adminFloor = adminMatch ? 3 : 0;
      if (adminMatch && (profileCount === null || profileCount < adminFloor)) {
        void supabase.from("drum_profiles").upsert({
          user_id: user.id,
          session_count: adminFloor,
          updated_at: new Date().toISOString(),
        });
        setLessonCount(adminFloor);
        return;
      }
      if (profileCount !== null) {
        setLessonCount(profileCount);
        return;
      }
      const { count } = await supabase
        .from("drum_sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      if (count !== null && count !== undefined) {
        setLessonCount(Math.max(Number(count), adminFloor));
      }
    });
  }, [supabase]);

  if (credits === null || hasEntitlement === null) return null;

  const nextLesson = lessonCount !== null ? lessonCount + 1 : null;

  return (
    <div className="credits-wrap">
      <button className="credits" type="button" onClick={() => setOpen(!open)}>
        {nextLesson ? `Lesson #${nextLesson}` : "Lesson"}
      </button>
      {open ? (
        <div className="credits-panel">
          Credits remaining: {isAdmin ? "∞" : credits}
          {userEmail ? (
            <div className="credits-email">Logged in as: {userEmail}</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
