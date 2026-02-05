/**
 * Skill Tree System for Drum Practice
 * 
 * A calm, game-like progression system. No hype, just clarity.
 * Skills unlock as you build competence in prerequisites.
 */

export type SkillCategory = 
  | "foundation"
  | "time"
  | "rudiments"
  | "grooves"
  | "coordination";

export type SkillStatus = "locked" | "unlocked" | "mastered";

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  description: string;
  /** What this skill enables you to do */
  benefit: string;
  /** IDs of skills required to unlock this one */
  requires: string[];
  /** How to unlock (auto-unlocked if requirements met, or specific condition) */
  unlockCondition?: string;
  /** Sessions required in related drills to master */
  sessionsToMaster: number;
  /** Position in the visual tree (x: 0-4, y: 0-n) */
  position: { x: number; y: number };
}

export interface SkillProgress {
  skillId: string;
  status: SkillStatus;
  sessionsCompleted: number;
  unlockedAt?: string;
  masteredAt?: string;
}

// Category display info
export const CATEGORY_INFO: Record<SkillCategory, { 
  label: string; 
  description: string;
  icon: string;
}> = {
  foundation: {
    label: "Foundation",
    description: "The physical basics—grip, posture, and clean execution",
    icon: "◉",
  },
  time: {
    label: "Time",
    description: "Internal clock and rhythmic awareness",
    icon: "◎",
  },
  rudiments: {
    label: "Rudiments",
    description: "The vocabulary of stick patterns",
    icon: "◈",
  },
  grooves: {
    label: "Grooves",
    description: "Full-kit patterns that make music",
    icon: "◇",
  },
  coordination: {
    label: "Coordination",
    description: "Independence between limbs",
    icon: "◆",
  },
};

/**
 * All skills in the system.
 * Position x maps to category columns, y is depth in that category.
 */
export const SKILLS: Skill[] = [
  // ============================================
  // FOUNDATION (x: 0)
  // ============================================
  {
    id: "grip",
    name: "Grip",
    category: "foundation",
    description: "Hold the stick like a small bird—secure, never squeezing. The fulcrum is a pivot, not a vice.",
    benefit: "Reduces tension, enables fluid motion, prevents injury",
    requires: [],
    sessionsToMaster: 5,
    position: { x: 0, y: 0 },
  },
  {
    id: "clean_hits",
    name: "Clean Hits",
    category: "foundation",
    description: "One stick, one surface, one clean sound. No buzzes, no flams—just a clear attack.",
    benefit: "Clear articulation in all patterns",
    requires: ["grip"],
    sessionsToMaster: 7,
    position: { x: 0, y: 1 },
  },
  {
    id: "rebound",
    name: "Rebound Control",
    category: "foundation",
    description: "Let the stick bounce naturally and catch it. Work with physics, not against it.",
    benefit: "Faster strokes with less effort",
    requires: ["clean_hits"],
    sessionsToMaster: 8,
    position: { x: 0, y: 2 },
  },

  // ============================================
  // TIME (x: 1)
  // ============================================
  {
    id: "internal_clock",
    name: "Internal Clock",
    category: "time",
    description: "Feel the pulse without external cues. The metronome confirms your time—it doesn't create it.",
    benefit: "Solid time without dependence on the click",
    requires: ["grip"],
    sessionsToMaster: 10,
    position: { x: 1, y: 0 },
  },
  {
    id: "gap_projection",
    name: "Gap Projection",
    category: "time",
    description: "Project the beat through silence. When the click disappears, you hold the time.",
    benefit: "Confidence during breaks and fills",
    requires: ["internal_clock"],
    unlockCondition: "Complete 5 gap drill sessions",
    sessionsToMaster: 12,
    position: { x: 1, y: 1 },
  },
  {
    id: "offbeat_feel",
    name: "Off-Beat Feel",
    category: "time",
    description: "Feel beats 2 and 4 as the anchor. Let 1 and 3 fall around them naturally.",
    benefit: "Grooves that breathe and swing",
    requires: ["gap_projection"],
    sessionsToMaster: 10,
    position: { x: 1, y: 2 },
  },

  // ============================================
  // RUDIMENTS (x: 2)
  // ============================================
  {
    id: "singles",
    name: "Single Strokes",
    category: "rudiments",
    description: "RLRL—alternating hands with matched volume. The foundation of all sticking.",
    benefit: "Even playing speed between hands",
    requires: ["rebound"],
    sessionsToMaster: 8,
    position: { x: 2, y: 0 },
  },
  {
    id: "doubles",
    name: "Double Strokes",
    category: "rudiments",
    description: "RRLL—two bounces per hand. Let the stick do the work on the second stroke.",
    benefit: "Rolls and faster fills",
    requires: ["rebound"],
    sessionsToMaster: 10,
    position: { x: 2, y: 1 },
  },
  {
    id: "paradiddles",
    name: "Paradiddles",
    category: "rudiments",
    description: "RLRR LRLL—the pattern that weaves singles and doubles together.",
    benefit: "Smooth hand-to-hand transitions in fills",
    requires: ["singles", "doubles"],
    sessionsToMaster: 12,
    position: { x: 2, y: 2 },
  },
  {
    id: "flams",
    name: "Flams",
    category: "rudiments",
    description: "A grace note before the main stroke—one soft, one loud, almost simultaneous.",
    benefit: "Accents with depth and weight",
    requires: ["clean_hits"],
    sessionsToMaster: 8,
    position: { x: 2, y: 3 },
  },

  // ============================================
  // GROOVES (x: 3)
  // ============================================
  {
    id: "basic_rock",
    name: "Basic Rock",
    category: "grooves",
    description: "Kick on 1 and 3, snare on 2 and 4, eighth-note hi-hats. The universal groove.",
    benefit: "Play along with most songs",
    requires: ["clean_hits", "internal_clock"],
    sessionsToMaster: 10,
    position: { x: 3, y: 0 },
  },
  {
    id: "disco",
    name: "Disco",
    category: "grooves",
    description: "Four-on-the-floor kick pattern with open hi-hats on the &'s.",
    benefit: "Dance-ready grooves with forward motion",
    requires: ["basic_rock", "offbeat_feel"],
    sessionsToMaster: 8,
    position: { x: 3, y: 1 },
  },
  {
    id: "funk",
    name: "Funk",
    category: "grooves",
    description: "Syncopated kick patterns, ghost notes on snare, tight hi-hats.",
    benefit: "Pocket and feel in R&B and funk",
    requires: ["basic_rock", "doubles"],
    sessionsToMaster: 14,
    position: { x: 3, y: 2 },
  },
  {
    id: "shuffle",
    name: "Shuffle",
    category: "grooves",
    description: "Triplet feel with a swing. Long-short, long-short on the hi-hat.",
    benefit: "Blues, jazz, and swing feel",
    requires: ["basic_rock", "offbeat_feel"],
    sessionsToMaster: 12,
    position: { x: 3, y: 3 },
  },

  // ============================================
  // COORDINATION (x: 4)
  // ============================================
  {
    id: "two_way",
    name: "2-Way Independence",
    category: "coordination",
    description: "Hands and feet doing different things—kick pattern while hands play steady.",
    benefit: "Basic groove capability",
    requires: ["basic_rock"],
    sessionsToMaster: 10,
    position: { x: 4, y: 0 },
  },
  {
    id: "three_way",
    name: "3-Way Independence",
    category: "coordination",
    description: "Add the hi-hat foot to the mix. Three limbs, three independent patterns.",
    benefit: "Open hi-hat accents, jazz ride patterns",
    requires: ["two_way", "disco"],
    sessionsToMaster: 14,
    position: { x: 4, y: 1 },
  },
  {
    id: "four_way",
    name: "4-Way Independence",
    category: "coordination",
    description: "All four limbs independent. The drummer's ultimate coordination skill.",
    benefit: "Full musical freedom",
    requires: ["three_way", "funk"],
    sessionsToMaster: 20,
    position: { x: 4, y: 2 },
  },
];

// Skill lookup by ID
export const SKILL_MAP = new Map(SKILLS.map(s => [s.id, s]));

/**
 * Get a skill by ID
 */
export function getSkill(id: string): Skill | undefined {
  return SKILL_MAP.get(id);
}

/**
 * Get all skills in a category
 */
export function getSkillsByCategory(category: SkillCategory): Skill[] {
  return SKILLS.filter(s => s.category === category);
}

/**
 * Check if a skill can be unlocked given current progress
 */
export function canUnlock(
  skill: Skill,
  progressMap: Map<string, SkillProgress>
): boolean {
  if (skill.requires.length === 0) return true;
  
  return skill.requires.every(reqId => {
    const progress = progressMap.get(reqId);
    return progress?.status === "unlocked" || progress?.status === "mastered";
  });
}

/**
 * Calculate skill status based on progress
 */
export function getSkillStatus(
  skill: Skill,
  progressMap: Map<string, SkillProgress>
): SkillStatus {
  const progress = progressMap.get(skill.id);
  
  if (progress?.status === "mastered") return "mastered";
  if (progress?.status === "unlocked") return "unlocked";
  
  // Check if can be unlocked
  if (canUnlock(skill, progressMap)) {
    return "unlocked"; // Automatically unlock if requirements met
  }
  
  return "locked";
}

/**
 * Get skills that depend on a given skill
 */
export function getDependentSkills(skillId: string): Skill[] {
  return SKILLS.filter(s => s.requires.includes(skillId));
}

/**
 * Get next skills to unlock (skills whose requirements are almost met)
 */
export function getNextUnlockable(
  progressMap: Map<string, SkillProgress>
): Skill[] {
  return SKILLS.filter(skill => {
    const status = getSkillStatus(skill, progressMap);
    if (status !== "locked") return false;
    
    // Check if only one requirement away from unlocking
    const unmetReqs = skill.requires.filter(reqId => {
      const progress = progressMap.get(reqId);
      return progress?.status !== "unlocked" && progress?.status !== "mastered";
    });
    
    return unmetReqs.length === 1;
  });
}

/**
 * Get the next recommended skill to work on
 */
export function getRecommendedSkill(
  progressMap: Map<string, SkillProgress>
): Skill | null {
  // First, find unlocked but not mastered skills
  const inProgress = SKILLS.filter(skill => {
    const progress = progressMap.get(skill.id);
    return progress && progress.status === "unlocked";
  });
  
  if (inProgress.length > 0) {
    // Return the one closest to mastery
    return inProgress.sort((a, b) => {
      const aProgress = progressMap.get(a.id);
      const bProgress = progressMap.get(b.id);
      const aPercent = (aProgress?.sessionsCompleted ?? 0) / a.sessionsToMaster;
      const bPercent = (bProgress?.sessionsCompleted ?? 0) / b.sessionsToMaster;
      return bPercent - aPercent;
    })[0];
  }
  
  // Otherwise, find the first unlockable skill
  const unlockable = SKILLS.filter(skill => {
    const status = getSkillStatus(skill, progressMap);
    return status === "unlocked" && !progressMap.has(skill.id);
  });
  
  // Prefer foundation skills first
  const priorityOrder: SkillCategory[] = ["foundation", "time", "rudiments", "grooves", "coordination"];
  unlockable.sort((a, b) => {
    const aIndex = priorityOrder.indexOf(a.category);
    const bIndex = priorityOrder.indexOf(b.category);
    if (aIndex !== bIndex) return aIndex - bIndex;
    return a.position.y - b.position.y;
  });
  
  return unlockable[0] ?? null;
}

/**
 * Calculate overall progress percentage
 */
export function getOverallProgress(
  progressMap: Map<string, SkillProgress>
): { unlocked: number; mastered: number; total: number; percent: number } {
  const total = SKILLS.length;
  let unlocked = 0;
  let mastered = 0;
  
  for (const skill of SKILLS) {
    const progress = progressMap.get(skill.id);
    if (progress?.status === "mastered") {
      mastered++;
      unlocked++;
    } else if (progress?.status === "unlocked") {
      unlocked++;
    } else if (canUnlock(skill, progressMap)) {
      unlocked++;
    }
  }
  
  // Percent is based on mastery
  const percent = Math.round((mastered / total) * 100);
  
  return { unlocked, mastered, total, percent };
}

// ============================================
// Local Storage for Skill Progress
// ============================================

const SKILL_PROGRESS_KEY = "drum_skill_progress";

export function loadSkillProgress(): Map<string, SkillProgress> {
  if (typeof window === "undefined") return new Map();
  
  try {
    const raw = localStorage.getItem(SKILL_PROGRESS_KEY);
    if (!raw) return initializeDefaultProgress();
    
    const arr = JSON.parse(raw) as SkillProgress[];
    return new Map(arr.map(p => [p.skillId, p]));
  } catch {
    return initializeDefaultProgress();
  }
}

export function saveSkillProgress(progressMap: Map<string, SkillProgress>): void {
  if (typeof window === "undefined") return;
  
  const arr = Array.from(progressMap.values());
  localStorage.setItem(SKILL_PROGRESS_KEY, JSON.stringify(arr));
}

export function initializeDefaultProgress(): Map<string, SkillProgress> {
  // Start with Grip unlocked
  const initial: SkillProgress[] = [
    {
      skillId: "grip",
      status: "unlocked",
      sessionsCompleted: 0,
      unlockedAt: new Date().toISOString(),
    },
  ];
  
  const map = new Map(initial.map(p => [p.skillId, p]));
  saveSkillProgress(map);
  return map;
}

export function updateSkillProgress(
  skillId: string,
  updates: Partial<SkillProgress>
): Map<string, SkillProgress> {
  const progressMap = loadSkillProgress();
  const existing = progressMap.get(skillId) ?? {
    skillId,
    status: "unlocked" as SkillStatus,
    sessionsCompleted: 0,
    unlockedAt: new Date().toISOString(),
  };
  
  const updated = { ...existing, ...updates };
  
  // Check for mastery
  const skill = getSkill(skillId);
  if (skill && updated.sessionsCompleted >= skill.sessionsToMaster && updated.status !== "mastered") {
    updated.status = "mastered";
    updated.masteredAt = new Date().toISOString();
  }
  
  progressMap.set(skillId, updated);
  saveSkillProgress(progressMap);
  
  return progressMap;
}

export function incrementSkillSession(skillId: string): Map<string, SkillProgress> {
  const progressMap = loadSkillProgress();
  const existing = progressMap.get(skillId);
  
  if (!existing) {
    // Unlock and start tracking
    return updateSkillProgress(skillId, {
      status: "unlocked",
      sessionsCompleted: 1,
      unlockedAt: new Date().toISOString(),
    });
  }
  
  return updateSkillProgress(skillId, {
    sessionsCompleted: existing.sessionsCompleted + 1,
  });
}
