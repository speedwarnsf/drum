"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginForm({ nextPath }: { nextPath: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setErr(null);

        const res = await signIn("credentials", {
          email,
          password,
          redirect: true,
          callbackUrl: nextPath,
        });

        if (res?.error) setErr("Invalid login.");
        setBusy(false);
      }}
      className="card form-grid"
    >
      <div className="field">
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="field">
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button disabled={busy} type="submit" className="btn">
        {busy ? "Signing in..." : "Sign in"}
      </button>

      {err ? <p className="error">{err}</p> : null}
    </form>
  );
}
