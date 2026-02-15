"use client";

import Shell from "../_ui/Shell";
import RudimentRelationshipMap from "../_ui/RudimentRelationshipMap";

export default function RelationshipsPage() {
  return (
    <Shell title="Rudiment Relationships" subtitle="How rudiments build on each other">
      <section className="card">
        <p style={{ fontSize: "0.9rem", color: "var(--ink-muted)", marginBottom: 16 }}>
          Drum rudiments form families. Each one builds on simpler patterns.
          Master the foundations first, then progress through the tree.
        </p>
        <RudimentRelationshipMap />
      </section>

      <section className="card">
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <a href="/drum/rudiments" className="btn btn-ghost">All Rudiments</a>
          <a href="/drum/skills" className="btn btn-ghost">Skill Tree</a>
          <a href="/drum/today" className="btn btn-ghost">Back to Today</a>
        </div>
      </section>
    </Shell>
  );
}
