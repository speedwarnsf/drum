"use client";

import React, { useMemo, useState } from "react";
import Shell from "../_ui/Shell";
import { getSupabaseClient } from "../_lib/supabaseClient";

export default function DrumLoginPage() {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const disabled = !supabase;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (!supabase) {
      setError("Supabase is not configured yet.");
      return;
    }

    if (mode === "reset") {
      const redirectTo = `${window.location.origin}/drum/reset`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        { redirectTo }
      );
      if (resetError) {
        setError(resetError.message);
        return;
      }
      setMessage("Reset email sent. Check your inbox.");
      return;
    }

    if (mode === "signup") {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      setMessage("Account created. Check your email to confirm.");
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      setError(signInError.message);
      return;
    }
    // Migrate localStorage data to cloud on login
    import("../_lib/cloudSync").then((m) => {
      m.resetAuthCache();
      m.migrateLocalStorageToCloud().catch(() => {});
    });
    window.location.href = "/drum/today";
  }

  return (
    <Shell title="Login" subtitle="Email + password with recovery.">
      <section className="card">
        <div className="row">
          <button
            className={`btn ${mode === "signin" ? "" : "btn-ghost"}`}
            type="button"
            onClick={() => setMode("signin")}
          >
            Sign in
          </button>
          <button
            className={`btn ${mode === "signup" ? "" : "btn-ghost"}`}
            type="button"
            onClick={() => setMode("signup")}
          >
            Create account
          </button>
          <button
            className={`btn ${mode === "reset" ? "" : "btn-ghost"}`}
            type="button"
            onClick={() => setMode("reset")}
          >
            Reset password
          </button>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
            />
          </label>

          {mode !== "reset" ? (
            <label className="field">
              <span>Password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </label>
          ) : null}

          <button className="btn" type="submit" disabled={disabled}>
            {mode === "reset"
              ? "Send reset email"
              : mode === "signup"
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        {message ? <p className="tiny">{message}</p> : null}
        {error ? <p className="error">{error}</p> : null}
        {disabled ? (
          <p className="tiny">Supabase not configured yet.</p>
        ) : null}
      </section>
    </Shell>
  );
}
