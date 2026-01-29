"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "../_lib/supabaseClient";

export default function LessonCredits() {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [credits, setCredits] = useState<number | null>(null);
  const [lessonCount, setLessonCount] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(async ({ data }) => {
      const user = data.user;
      if (!user) return;
      const { data: ent } = await supabase
        .from("drum_entitlements")
        .select("lesson_credits")
        .eq("user_id", user.id)
        .maybeSingle();
      if (ent?.lesson_credits !== undefined && ent?.lesson_credits !== null) {
        setCredits(ent.lesson_credits);
      } else {
        setCredits(0);
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

  if (credits === null) return null;

  const nextLesson = lessonCount !== null ? lessonCount + 1 : null;

  return (
    <div className="credits-wrap">
      <button className="credits" type="button" onClick={() => setOpen(!open)}>
        {nextLesson ? `Lesson #${nextLesson}` : "Lesson"}
      </button>
      {open ? (
        <div className="credits-panel">Credits remaining: {credits}</div>
      ) : null}
    </div>
  );
}
