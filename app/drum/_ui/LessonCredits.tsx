"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "../_lib/supabaseClient";

export default function LessonCredits() {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [credits, setCredits] = useState<number | null>(null);

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
    });
  }, [supabase]);

  if (credits === null) return null;

  return <div className="credits">Credits: {credits}</div>;
}
