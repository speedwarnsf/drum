"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "../_lib/supabaseClient";

export default function LessonCredits() {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [credits, setCredits] = useState<number | null>(null);
  const [hasEntitlement, setHasEntitlement] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [lessonCount, setLessonCount] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    supabase.auth.getUser().then(async ({ data }) => {
      const user = data.user;
      if (!user) return;
      if (adminEmail && user.email && user.email.toLowerCase() === adminEmail.toLowerCase()) {
        setIsAdmin(true);
      }
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
      const { count } = await supabase
        .from("drum_sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      if (count !== null && count !== undefined) {
        setLessonCount(count);
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
        </div>
      ) : null}
    </div>
  );
}
