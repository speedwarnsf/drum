"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ESSENTIAL_RUDIMENTS } from "../_lib/rudimentLibrary";
import { RUDIMENT_FAMILIES, getRelatedRudiments, getRudimentFamily, RudimentFamily } from "../_lib/rudimentRelationships";
import { RudimentProgression } from "../_lib/rudimentLibrary";

type Props = {
  highlightRudimentId?: string;
  compact?: boolean;
};

export default function RudimentRelationshipMap({ highlightRudimentId, compact = false }: Props) {
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
  const [progression] = useState(() => new RudimentProgression());

  const families = selectedFamily
    ? RUDIMENT_FAMILIES.filter(f => f.id === selectedFamily)
    : RUDIMENT_FAMILIES;

  return (
    <div className="relationship-map">
      {/* Family filter */}
      <div style={{
        display: "flex",
        gap: 6,
        flexWrap: "wrap",
        marginBottom: 16,
      }}>
        <button
          className={`btn ${!selectedFamily ? "" : "btn-ghost"}`}
          onClick={() => setSelectedFamily(null)}
          style={{ fontSize: "0.8rem", padding: "4px 10px" }}
        >
          All Families
        </button>
        {RUDIMENT_FAMILIES.map(f => (
          <button
            key={f.id}
            className={`btn ${selectedFamily === f.id ? "" : "btn-ghost"}`}
            onClick={() => setSelectedFamily(selectedFamily === f.id ? null : f.id)}
            style={{
              fontSize: "0.8rem",
              padding: "4px 10px",
              borderLeft: `3px solid ${f.color}`,
            }}
          >
            {f.name}
          </button>
        ))}
      </div>

      {/* Family cards */}
      {families.map(family => (
        <FamilyCard
          key={family.id}
          family={family}
          highlightId={highlightRudimentId}
          progression={progression}
          compact={compact}
        />
      ))}
    </div>
  );
}

function FamilyCard({
  family,
  highlightId,
  progression,
  compact,
}: {
  family: RudimentFamily;
  highlightId?: string;
  progression: RudimentProgression;
  compact: boolean;
}) {
  const rudiments = family.rudimentIds
    .map(id => ESSENTIAL_RUDIMENTS[id])
    .filter(Boolean);

  return (
    <div style={{
      marginBottom: 16,
      border: "2px solid var(--stroke)",
      borderLeft: `4px solid ${family.color}`,
      background: "var(--panel)",
    }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--stroke)" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0 }}>{family.name}</h3>
        <p style={{ fontSize: "0.8rem", color: "var(--ink-muted)", margin: "4px 0 0" }}>
          {family.description}
        </p>
      </div>

      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        padding: 12,
      }}>
        {rudiments.map((r, idx) => {
          const isHighlighted = r.id === highlightId;
          const isCompleted = progression.isCompleted(r.id);
          const hasPrereqs = r.prerequisites.length > 0;

          return (
            <React.Fragment key={r.id}>
              {idx > 0 && hasPrereqs && rudiments.some(prev =>
                r.prerequisites.includes(prev.id) && family.rudimentIds.indexOf(prev.id) < family.rudimentIds.indexOf(r.id)
              ) && (
                <span style={{
                  alignSelf: "center",
                  color: "var(--ink-muted)",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                }}>
                  {"\u2192"}
                </span>
              )}
              <Link
                href={`/drum/rudiments/${r.id}`}
                style={{
                  padding: "6px 12px",
                  background: isHighlighted ? "var(--ink)" : isCompleted ? "var(--panel-deep)" : "var(--bg)",
                  color: isHighlighted ? "var(--bg)" : "var(--ink)",
                  border: `1px solid ${isHighlighted ? "var(--ink)" : "var(--stroke)"}`,
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  transition: "background 0.15s",
                }}
              >
                {isCompleted && <span style={{ fontSize: "0.7rem" }}>[done]</span>}
                {r.name}
                {!compact && (
                  <span style={{ fontSize: "0.65rem", color: isHighlighted ? "var(--bg)" : "var(--ink-muted)" }}>
                    Lv{r.pattern.difficulty}
                  </span>
                )}
              </Link>
            </React.Fragment>
          );
        })}
      </div>

      {/* Cross-family connections */}
      {!compact && (
        <div style={{
          padding: "0 12px 12px",
          fontSize: "0.75rem",
          color: "var(--ink-muted)",
        }}>
          {(() => {
            const externalPrereqs = new Set<string>();
            rudiments.forEach(r => {
              r.prerequisites.forEach(pid => {
                if (!family.rudimentIds.includes(pid) && ESSENTIAL_RUDIMENTS[pid]) {
                  const pFamily = getRudimentFamily(pid);
                  if (pFamily) externalPrereqs.add(`${ESSENTIAL_RUDIMENTS[pid].name} (${pFamily.name})`);
                }
              });
            });
            if (externalPrereqs.size === 0) return null;
            return (
              <span>
                Builds on: {Array.from(externalPrereqs).join(", ")}
              </span>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// Compact version for rudiment detail page
export function RelatedRudimentsPanel({ rudimentId }: { rudimentId: string }) {
  const related = getRelatedRudiments(rudimentId);
  const family = getRudimentFamily(rudimentId);

  if (!related.prerequisites.length && !related.nextSteps.length && !related.sameFamily.length) {
    return null;
  }

  return (
    <div>
      {family && (
        <div style={{ marginBottom: 12 }}>
          <span style={{
            display: "inline-block",
            padding: "3px 8px",
            background: "var(--panel-deep)",
            fontSize: "0.75rem",
            fontWeight: 600,
            borderLeft: `3px solid ${family.color}`,
          }}>
            {family.name}
          </span>
          <p style={{ fontSize: "0.8rem", color: "var(--ink-muted)", margin: "4px 0 0" }}>
            {family.description}
          </p>
        </div>
      )}

      {related.prerequisites.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: 6, color: "var(--ink-muted)" }}>
            Prerequisites
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {related.prerequisites.map(r => (
              <Link key={r.id} href={`/drum/rudiments/${r.id}`} style={{
                padding: "4px 10px",
                background: "var(--bg)",
                border: "1px solid var(--stroke)",
                fontSize: "0.8rem",
                textDecoration: "none",
                fontWeight: 500,
              }}>
                {r.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {related.nextSteps.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: 6, color: "var(--ink-muted)" }}>
            Learn Next
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {related.nextSteps.map(r => (
              <Link key={r.id} href={`/drum/rudiments/${r.id}`} style={{
                padding: "4px 10px",
                background: "var(--bg)",
                border: "1px solid var(--stroke)",
                fontSize: "0.8rem",
                textDecoration: "none",
                fontWeight: 500,
              }}>
                {r.name} {"\u2192"}
              </Link>
            ))}
          </div>
        </div>
      )}

      {related.sameFamily.length > 0 && (
        <div>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: 6, color: "var(--ink-muted)" }}>
            Same Family
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {related.sameFamily.map(r => (
              <Link key={r.id} href={`/drum/rudiments/${r.id}`} style={{
                padding: "4px 10px",
                background: "var(--panel)",
                border: "1px solid var(--stroke)",
                fontSize: "0.8rem",
                textDecoration: "none",
                fontWeight: 500,
                opacity: 0.8,
              }}>
                {r.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
