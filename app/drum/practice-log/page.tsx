"use client";

import React, { useState, useEffect, useMemo } from "react";
import Shell from "../_ui/Shell";
import { Icon } from "../_ui/Icon";
import { ErrorBoundary } from "../_ui/ErrorBoundary";
import { loadSessions, StoredSession } from "../_lib/drumMvp";
import { getPracticeLog, RudimentPracticeEntry } from "../_lib/practiceTracker";
import { ESSENTIAL_RUDIMENTS } from "../_lib/rudimentLibrary";

type JournalEntry = {
  id: string;
  date: string;
  type: "session" | "rudiment";
  title: string;
  duration: number;
  bpm?: number;
  broke?: string;
  felt?: string;
  note?: string;
};

function PracticeLogInner() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    // Load from localStorage
    const savedNotes = localStorage.getItem("drum_journal_notes");
    if (savedNotes) {
      try { setNotes(JSON.parse(savedNotes)); } catch {}
    }

    // Merge sessions and rudiment practice into unified log
    const sessions = loadSessions();
    const rudimentLog = getPracticeLog();
    const merged: JournalEntry[] = [];

    for (const s of sessions) {
      merged.push({
        id: s.id,
        date: s.ts.slice(0, 10),
        type: "session",
        title: s.plan?.focus || "Practice session",
        duration: s.plan?.minutes || 15,
        broke: s.log?.broke,
        felt: s.log?.felt,
        note: s.log?.note,
      });
    }

    for (const r of rudimentLog) {
      const rudiment = ESSENTIAL_RUDIMENTS[r.rudimentId];
      merged.push({
        id: `${r.rudimentId}-${r.date}-${r.durationSeconds}`,
        date: r.date,
        type: "rudiment",
        title: rudiment?.name || r.rudimentId,
        duration: Math.round(r.durationSeconds / 60),
        bpm: r.bpm,
        note: r.notes,
      });
    }

    merged.sort((a, b) => b.date.localeCompare(a.date));
    setEntries(merged);
  }, []);

  const months = useMemo(() => {
    const m = new Set(entries.map(e => e.date.slice(0, 7)));
    return Array.from(m).sort().reverse();
  }, [entries]);

  const filtered = useMemo(() => {
    if (filterMonth === "all") return entries;
    return entries.filter(e => e.date.startsWith(filterMonth));
  }, [entries, filterMonth]);

  // Group by date
  const grouped = useMemo(() => {
    const g: Record<string, JournalEntry[]> = {};
    for (const e of filtered) {
      (g[e.date] ??= []).push(e);
    }
    return g;
  }, [filtered]);

  function saveNote(entryId: string, text: string) {
    const updated = { ...notes, [entryId]: text };
    setNotes(updated);
    localStorage.setItem("drum_journal_notes", JSON.stringify(updated));
    setEditingId(null);
  }

  function exportCSV() {
    const headers = ["Date", "Type", "Title", "Duration (min)", "BPM", "Broke", "Felt", "Note", "Journal Note"];
    const rows = entries.map(e => [
      e.date,
      e.type,
      `"${e.title}"`,
      e.duration,
      e.bpm || "",
      e.broke || "",
      e.felt || "",
      `"${(e.note || "").replace(/"/g, '""')}"`,
      `"${(notes[e.id] || "").replace(/"/g, '""')}"`,
    ].join(","));

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `repodrum-practice-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Shell title="Practice Log" subtitle="Your complete practice journal">
      {/* Actions bar */}
      <section className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <select
              value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
              className="btn btn-ghost"
              style={{ cursor: "pointer" }}
              aria-label="Filter by month"
            >
              <option value="all">All months</option>
              {months.map(m => (
                <option key={m} value={m}>
                  {new Date(m + "-01").toLocaleDateString(undefined, { month: "long", year: "numeric" })}
                </option>
              ))}
            </select>
          </div>
          <button className="btn" onClick={exportCSV} aria-label="Export practice data as CSV">
            <Icon name="documents" size={14} /> Export CSV
          </button>
        </div>
      </section>

      {/* Summary */}
      <section className="card">
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{filtered.length}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--ink-muted)" }}>Entries</div>
          </div>
          <div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{filtered.reduce((s, e) => s + e.duration, 0)}m</div>
            <div style={{ fontSize: "0.8rem", color: "var(--ink-muted)" }}>Total Time</div>
          </div>
          <div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{Object.keys(grouped).length}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--ink-muted)" }}>Days</div>
          </div>
        </div>
      </section>

      {/* Log entries grouped by date */}
      {Object.keys(grouped).length === 0 ? (
        <section className="card" style={{ textAlign: "center", padding: "32px 16px" }}>
          <Icon name="briefs" size={48} />
          <h2 className="card-title" style={{ marginTop: 16 }}>No entries yet</h2>
          <p className="sub">Complete a practice session to start your log.</p>
          <a href="/drum/today" className="btn" style={{ marginTop: 16 }}>Start practicing</a>
        </section>
      ) : (
        Object.entries(grouped).map(([date, dayEntries]) => (
          <section key={date} className="card" style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 12, fontSize: "0.9rem", color: "var(--ink-muted)" }}>
              {new Date(date + "T12:00:00").toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </div>
            {dayEntries.map(entry => (
              <div
                key={entry.id}
                style={{
                  padding: "12px 0",
                  borderTop: "1px solid var(--border, #eee)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>
                      {entry.title}
                      <span style={{ fontSize: "0.8rem", color: "var(--ink-muted)", marginLeft: 8 }}>
                        {entry.duration}m{entry.bpm ? ` @ ${entry.bpm} BPM` : ""}
                      </span>
                    </div>
                    {(entry.broke || entry.felt) && (
                      <div style={{ fontSize: "0.8rem", color: "var(--ink-muted)", marginTop: 2 }}>
                        {entry.broke && <>Broke: {entry.broke}</>}
                        {entry.broke && entry.felt && " | "}
                        {entry.felt && <>Felt: {entry.felt}</>}
                      </div>
                    )}
                    {entry.note && (
                      <div style={{ fontSize: "0.85rem", marginTop: 4, fontStyle: "italic" }}>
                        {entry.note}
                      </div>
                    )}
                  </div>
                  <span style={{
                    fontSize: "0.7rem",
                    padding: "2px 6px",
                    background: entry.type === "session" ? "var(--accent, var(--ink, #3c3c3c))" : "var(--border, #ddd)",
                    color: entry.type === "session" ? "var(--bg, #fff)" : "var(--ink)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}>
                    {entry.type}
                  </span>
                </div>

                {/* Journal note */}
                {editingId === entry.id ? (
                  <div style={{ marginTop: 8 }}>
                    <textarea
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      placeholder="Add a reflection or note..."
                      style={{
                        width: "100%", minHeight: 60, padding: 8,
                        border: "1px solid var(--border, #ccc)",
                        background: "var(--bg, #fff)",
                        color: "var(--ink, #000)",
                        fontFamily: "inherit", fontSize: "0.85rem",
                        resize: "vertical",
                      }}
                      aria-label="Journal note"
                    />
                    <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                      <button className="btn btn-small" onClick={() => saveNote(entry.id, editText)}>Save</button>
                      <button className="btn btn-small btn-ghost" onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: 6 }}>
                    {notes[entry.id] ? (
                      <div
                        style={{
                          fontSize: "0.85rem", padding: "8px 10px",
                          background: "var(--panel-deep, #f5f5f5)",
                          borderLeft: "2px solid var(--accent, var(--ink, #3c3c3c))",
                          cursor: "pointer",
                        }}
                        onClick={() => { setEditingId(entry.id); setEditText(notes[entry.id]); }}
                        role="button"
                        tabIndex={0}
                        aria-label="Edit journal note"
                        onKeyDown={e => { if (e.key === "Enter") { setEditingId(entry.id); setEditText(notes[entry.id]); } }}
                      >
                        {notes[entry.id]}
                      </div>
                    ) : (
                      <button
                        className="btn btn-small btn-ghost"
                        onClick={() => { setEditingId(entry.id); setEditText(""); }}
                        style={{ fontSize: "0.8rem" }}
                      >
                        + Add note
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </section>
        ))
      )}

      {/* Nav */}
      <section className="card">
        <div className="row" style={{ gap: 8 }}>
          <a href="/drum/journal" className="btn btn-ghost">Quick Log</a>
          <a href="/drum/history" className="btn btn-ghost">Session History</a>
          <a href="/drum/progress" className="btn btn-ghost">Progress</a>
        </div>
      </section>
    </Shell>
  );
}

export default function PracticeLogPage() {
  return (
    <ErrorBoundary>
      <PracticeLogInner />
    </ErrorBoundary>
  );
}
