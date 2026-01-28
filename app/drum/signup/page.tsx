"use client";

import React, { useEffect, useMemo, useState } from "react";
import Shell from "../_ui/Shell";
import { getSupabaseClient } from "../_lib/supabaseClient";

type Pack = {
  id: string;
  title: string;
  price: string;
  lessons: number;
  packKey: string;
};

const packs: Pack[] = [
  { id: "tester", title: "Tester Pack", price: "$2", lessons: 10, packKey: "TESTER_10" },
  { id: "fifty", title: "50 Lessons", price: "$10", lessons: 50, packKey: "PACK_50" },
  { id: "hundred", title: "100 Lessons", price: "$15", lessons: 100, packKey: "PACK_100" },
  { id: "repeat", title: "100 Lessons (Repeat)", price: "$12", lessons: 100, packKey: "PACK_100_REPEAT" },
];

export default function DrumSignupPage() {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      setEmail(data.user?.email ?? null);
    });
  }, [supabase]);

  const priceMap: Record<string, string | undefined> = {
    TESTER_10: process.env.NEXT_PUBLIC_STRIPE_PRICE_TESTER_10,
    PACK_50: process.env.NEXT_PUBLIC_STRIPE_PRICE_50,
    PACK_100: process.env.NEXT_PUBLIC_STRIPE_PRICE_100,
    PACK_100_REPEAT: process.env.NEXT_PUBLIC_STRIPE_PRICE_100_REPEAT,
  };

  async function startCheckout(pack: Pack) {
    setError(null);
    if (!userId) {
      setError("Please login first.");
      return;
    }
    const priceId = priceMap[pack.packKey];
    if (!priceId) {
      setError("Stripe prices not configured yet.");
      return;
    }
    setLoadingId(pack.id);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priceId,
        lessons: pack.lessons,
        pack: pack.packKey,
        userId,
        email,
      }),
    });
    const data = await res.json();
    setLoadingId(null);
    if (!res.ok || !data?.url) {
      setError(data?.error || "Unable to start checkout.");
      return;
    }
    window.location.assign(data.url);
  }

  return (
    <Shell title="Sign up" subtitle="Choose your lesson pack.">
      <section className="card">
        <p className="sub">
          {userId
            ? "You are logged in. Choose a pack to continue."
            : "Please log in before purchasing so we can attach lessons to your account."}
        </p>
        <div className="grid" style={{ marginTop: 12 }}>
          {packs.map((pack) => (
            <article key={pack.id} className="card" style={{ marginBottom: 0 }}>
              <h3 className="card-title">{pack.title}</h3>
              <p className="sub">{pack.lessons} lessons</p>
              <div className="meta" style={{ marginTop: 8 }}>{pack.price}</div>
              <button
                className="btn"
                disabled={!userId || loadingId === pack.id}
                onClick={() => startCheckout(pack)}
              >
                {loadingId === pack.id ? "Redirecting..." : "Buy"}
              </button>
            </article>
          ))}
        </div>
        {error ? <p className="error">{error}</p> : null}
      </section>
    </Shell>
  );
}
