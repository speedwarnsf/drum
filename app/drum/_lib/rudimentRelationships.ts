/**
 * Rudiment Relationships — defines how rudiments build on each other
 */

import { ESSENTIAL_RUDIMENTS, Rudiment } from "./rudimentLibrary";

export type RudimentFamily = {
  id: string;
  name: string;
  description: string;
  color: string;
  rudimentIds: string[];
};

export const RUDIMENT_FAMILIES: RudimentFamily[] = [
  {
    id: "single-strokes",
    name: "Single Strokes",
    description: "Foundation of all drumming — alternating single hits",
    color: "#c0392b",
    rudimentIds: ["single-stroke-roll", "single-stroke-four", "single-stroke-seven"],
  },
  {
    id: "double-strokes",
    name: "Double Strokes",
    description: "Two hits per hand — the basis for rolls",
    color: "#2980b9",
    rudimentIds: [
      "double-stroke-roll", "single-stroke-roll-4-variant", "triple-stroke-roll",
    ],
  },
  {
    id: "measured-rolls",
    name: "Measured Rolls",
    description: "Counted rolls built from double strokes",
    color: "#8e44ad",
    rudimentIds: [
      "multiple-bounce-roll", "five-stroke-roll", "six-stroke-roll",
      "seven-stroke-roll", "nine-stroke-roll", "ten-stroke-roll",
      "eleven-stroke-roll", "thirteen-stroke-roll", "fifteen-stroke-roll",
      "seventeen-stroke-roll",
    ],
  },
  {
    id: "paradiddles",
    name: "Paradiddle Family",
    description: "Single + double stroke combinations",
    color: "#27ae60",
    rudimentIds: [
      "single-paradiddle", "double-paradiddle", "triple-paradiddle", "paradiddlediddle",
    ],
  },
  {
    id: "flams",
    name: "Flam Family",
    description: "Grace note ornaments — adding texture and power",
    color: "#e67e22",
    rudimentIds: [
      "flam", "flam-accent", "flam-tap", "flamacue", "flam-paradiddle",
      "flammed-mill", "flam-drag", "pataflafla", "swiss-army-triplet", "inverted-flam-tap",
    ],
  },
  {
    id: "drags",
    name: "Drag Family",
    description: "Double grace notes — ruffs and drags",
    color: "#16a085",
    rudimentIds: [
      "drag", "single-drag-tap", "double-drag-tap", "lesson-25",
      "single-dragadiddle", "drag-paradiddle-1", "drag-paradiddle-2",
    ],
  },
  {
    id: "ratamacues",
    name: "Ratamacue Family",
    description: "Drag + triplet combinations",
    color: "#d35400",
    rudimentIds: ["single-ratamacue", "double-ratamacue", "triple-ratamacue"],
  },
];

export type RelationshipEdge = {
  from: string;
  to: string;
  type: "prerequisite" | "variation" | "builds-on";
};

export function getAllRelationships(): RelationshipEdge[] {
  const edges: RelationshipEdge[] = [];
  for (const rudiment of Object.values(ESSENTIAL_RUDIMENTS)) {
    for (const prereq of rudiment.prerequisites) {
      edges.push({ from: prereq, to: rudiment.id, type: "prerequisite" });
    }
    for (const next of rudiment.nextRudiments) {
      // Avoid duplicates with prerequisites
      if (!rudiment.prerequisites.includes(next)) {
        edges.push({ from: rudiment.id, to: next, type: "builds-on" });
      }
    }
  }
  return edges;
}

export function getRudimentFamily(rudimentId: string): RudimentFamily | null {
  return RUDIMENT_FAMILIES.find(f => f.rudimentIds.includes(rudimentId)) ?? null;
}

export function getRelatedRudiments(rudimentId: string): {
  prerequisites: Rudiment[];
  nextSteps: Rudiment[];
  sameFamily: Rudiment[];
} {
  const rudiment = ESSENTIAL_RUDIMENTS[rudimentId];
  if (!rudiment) return { prerequisites: [], nextSteps: [], sameFamily: [] };

  const family = getRudimentFamily(rudimentId);
  const sameFamily = family
    ? family.rudimentIds
        .filter(id => id !== rudimentId)
        .map(id => ESSENTIAL_RUDIMENTS[id])
        .filter(Boolean)
    : [];

  return {
    prerequisites: rudiment.prerequisites.map(id => ESSENTIAL_RUDIMENTS[id]).filter(Boolean),
    nextSteps: rudiment.nextRudiments.map(id => ESSENTIAL_RUDIMENTS[id]).filter(Boolean),
    sameFamily,
  };
}
