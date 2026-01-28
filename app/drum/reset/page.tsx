"use client";

import React, { useMemo, useState } from "react";
import Shell from "../_ui/Shell";
import { getSupabaseClient } from "../_lib/supabaseClient";

export default function DrumResetPage() {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (!supabase) {
      setError("Supabase is not configured yet.");
      return;
    }
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setMessage("Password updated. You can sign in now.");
  }

  return (
    <Shell title="Reset password" subtitle="Set a new password.">
      <section className="card">
        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="field">
            <span>New password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>

          <button className="btn" type="submit" disabled={!supabase}>
            Save new password
          </button>
        </form>
        {message ? <p className="tiny">{message}</p> : null}
        {error ? <p className="error">{error}</p> : null}
      </section>
    </Shell>
  );
}
