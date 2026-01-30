"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "../_lib/supabaseClient";

export function AuthNavLinks() {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      setAuthed(!!data.user);
    });
  }, [supabase]);

  if (authed === null) return null;

  return authed ? null : (
    <>
      <a href="/drum/login" className="btn btn-ghost">
        Login
      </a>
      <a href="/drum/signup" className="btn btn-ghost">
        Sign up
      </a>
    </>
  );
}

export function AuthSetupLink() {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      setAuthed(!!data.user);
    });
  }, [supabase]);

  if (authed === null || authed) return null;

  return (
    <a href="/drum/start" className="btn btn-ghost">
      Setup
    </a>
  );
}

export function AuthSetupButton() {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      setAuthed(!!data.user);
    });
  }, [supabase]);

  if (authed === null || authed) return null;

  return (
    <a className="btn" href="/drum/start">
      Start setup
    </a>
  );
}

export function AuthHomeButtons() {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      setAuthed(!!data.user);
    });
  }, [supabase]);

  if (authed === null || authed) return null;

  return (
    <>
      <a className="btn btn-ghost" href="/drum/login">
        Login
      </a>
      <a className="btn btn-ghost" href="/drum/signup">
        Sign up
      </a>
    </>
  );
}
