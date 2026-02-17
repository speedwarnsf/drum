"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Shell from "../_ui/Shell";
import { Icon } from "../_ui/Icon";
import { ESSENTIAL_RUDIMENTS, RudimentProgression, Rudiment } from "../_lib/rudimentLibrary";
import Link from "next/link";
import { playSelect, playNav } from "../_lib/uiSounds";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "rolls", label: "Rolls" },
  { value: "paradiddles", label: "Paradiddles" },
  { value: "flams", label: "Flams" },
  { value: "drags", label: "Drags" },
  { value: "ratamacues", label: "Ratamacues" },
] as const;

export default function RudimentsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("all");
  const [progression] = useState(() => new RudimentProgression());
  const stats = progression.getProgressStats();

  const handleRandomRudiment = useCallback(() => {
    const allIds = Object.keys(ESSENTIAL_RUDIMENTS);
    const randomId = allIds[Math.floor(Math.random() * allIds.length)];
    playNav();
    router.push(`/drum/rudiments/${randomId}`);
  }, [router]);

  const rudiments = useMemo(() => {
    const all = Object.values(ESSENTIAL_RUDIMENTS);
    if (filter === "all") return all;
    return all.filter(r => r.category === filter);
  }, [filter]);

  // Group by category
  const grouped = useMemo(() => {
    const groups: Record<string, Rudiment[]> = {};
    for (const r of rudiments) {
      (groups[r.category] ??= []).push(r);
    }
    return groups;
  }, [rudiments]);

  return (
    <Shell title="40 Essential Rudiments" subtitle={`${stats.completedRudiments} of ${stats.totalRudiments} mastered`}>
      {/* Progress bar */}
      <section className="card">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontWeight: 600 }}>Overall Progress</span>
          <span style={{ fontWeight: 700 }}>{Math.round((stats.completedRudiments / stats.totalRudiments) * 100)}%</span>
        </div>
        <div style={{ height: 8, background: "var(--border, #eee)", borderRadius: 0, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(stats.completedRudiments / stats.totalRudiments) * 100}%`, background: "var(--accent, var(--ink, #3c3c3c))", borderRadius: 0, transition: "width 0.3s" }} />
        </div>
      </section>

      {/* Random rudiment button */}
      <section className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px" }}>
        <div>
          <div style={{ fontWeight: 600 }}>Feeling spontaneous?</div>
          <div style={{ fontSize: "0.8rem", color: "var(--ink-muted)" }}>Jump to a random rudiment and practice it.</div>
        </div>
        <button className="btn" onClick={handleRandomRudiment} aria-label="Practice a random rudiment">
          <Icon name="shuffle" size={16} /> Random
        </button>
      </section>

      {/* Category filter */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            className={`btn btn-small ${filter === cat.value ? "" : "btn-ghost"}`}
            onClick={() => { setFilter(cat.value); playSelect(); }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Rudiment cards */}
      {Object.entries(grouped).map(([category, items]) => (
        <section key={category} style={{ marginBottom: 24 }}>
          <h2 style={{ textTransform: "capitalize", fontSize: "1.2rem", marginBottom: 12 }}>
            {category} ({items.length})
          </h2>
          <div className="grid" style={{ gap: 12 }} role="list" aria-label={`${category} rudiments`}>
            {items.map(r => {
              const completed = progression.isCompleted(r.id);
              const skill = progression.getSkillLevel(r.id);
              return (
                <Link
                  key={r.id}
                  role="listitem"
                  aria-label={`${r.name}${completed ? ', completed' : ''}${skill > 0 ? `, skill level ${skill}` : ''}`}
                  href={`/drum/rudiments/${r.id}`}
                  onClick={() => playNav()}
                  className="card"
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    padding: "14px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    opacity: completed ? 1 : 0.85,
                    borderLeft: completed ? "3px solid var(--accent, var(--ink, #3c3c3c))" : "3px solid transparent",
                    transition: "transform 0.15s, box-shadow 0.15s",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "1rem" }}>
                      {completed && <><Icon name="check" size={14} /> </>}{r.name}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted, #888)", marginTop: 2 }}>
                      {r.pattern.stickingPattern} - Difficulty {r.pattern.difficulty}/5
                    </div>
                  </div>
                  {completed && skill > 0 && (
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--accent, var(--ink, #3c3c3c))" }}>
                      Lvl {skill}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      ))}

      {/* Nav */}
      <section className="card">
        <div className="row" style={{ gap: 8 }}>
          <Link href="/drum/practice-enhanced" className="btn" onClick={() => playNav()}>Practice Mode</Link>
          <Link href="/drum/progress" className="btn btn-ghost" onClick={() => playNav()}>Progress</Link>
        </div>
      </section>
    </Shell>
  );
}
