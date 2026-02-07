/**
 * Competency Gates - Diagnostic tests required to advance modules
 * 
 * Students must pass specific diagnostic tests to ensure solid fundamentals
 * before progressing to more complex material. Based on pedagogical research
 * showing that rushed progression leads to bad habits and plateau.
 */

export type DiagnosticResult = "untested" | "clean" | "flam" | "unsure";

export type GateStatus = "locked" | "available" | "passed" | "failed";

/** Details returned from gate evaluation */
export interface GateEvaluationDetails {
  missingExercises?: string[];
  cleanResults?: string[];
  flamResults?: string[];
  unsureResults?: string[];
  cleanCount?: number;
  flamCount?: number;
  unsureCount?: number;
  requiredClean?: number;
  maxFlams?: number;
  gate?: DiagnosticGate;
  requirements?: DiagnosticGate;
}

export interface DiagnosticGate {
  id: string;
  name: string;
  description: string;
  /** Module this gate unlocks (student must pass to advance TO this module) */
  unlocksModule: number;
  /** Which diagnostic exercises are required */
  requiredExercises: string[];
  /** How many exercises must be "clean" to pass */
  minimumClean: number;
  /** Maximum flams allowed to pass */
  maximumFlams: number;
  /** Rationale for this gate existing */
  rationale: string;
  /** What happens if student fails */
  failureGuidance: string;
}

/**
 * All competency gates in the system.
 * These are the diagnostic checkpoints between modules.
 */
export const COMPETENCY_GATES: DiagnosticGate[] = [
  {
    id: "coordination-foundation",
    name: "Coordination Foundation",
    description: "Verify that limbs can strike in unison without flams",
    unlocksModule: 2,
    requiredExercises: ["kick-rh", "kick-lh"],
    minimumClean: 2,
    maximumFlams: 0,
    rationale: "Module 2 introduces timing concepts. Students with coordination flaws will struggle with internal clock development.",
    failureGuidance: "Practice isolation exercises: kick alone for 2 minutes, then hands alone for 2 minutes. Combine at 40 BPM until unified."
  },
  {
    id: "timing-stability",
    name: "Timing Stability",
    description: "Demonstrate stable timing with limb coordination",
    unlocksModule: 3,
    requiredExercises: ["kick-rh", "kick-lh", "snare-kick-2-4"],
    minimumClean: 3,
    maximumFlams: 0,
    rationale: "Module 3 covers complex grooves. Timing issues at this level will compound into serious rhythmic problems.",
    failureGuidance: "Work with metronome at 50 BPM. Focus on the gap between clicks - can you feel the subdivisions?"
  },
  {
    id: "groove-coordination",
    name: "Groove Coordination",
    description: "Clean execution of basic grooves under evaluation",
    unlocksModule: 4,
    requiredExercises: ["kick-rh", "kick-lh", "snare-kick-2-4"],
    minimumClean: 3,
    maximumFlams: 0,
    rationale: "Module 4 introduces independence. Students need solid groove foundation before limb independence work.",
    failureGuidance: "Record yourself playing the basic groove. Any flams indicate coordination issues that need isolation practice."
  }
];

/**
 * Extended diagnostic exercises that can be used for gates
 * (These would extend the existing diagnostic exercises)
 */
export const DIAGNOSTIC_EXERCISES = [
  // Existing ones from diagnostic page
  {
    id: "kick-rh",
    title: "Kick + Right Hand",
    description: "Play bass drum and right hand at exactly the same moment.",
    count: 20,
    targetModule: 1,
    skillFocus: "Basic coordination"
  },
  {
    id: "kick-lh", 
    title: "Kick + Left Hand",
    description: "Test coordination with non-dominant hand.",
    count: 20,
    targetModule: 1,
    skillFocus: "Bilateral coordination"
  },
  {
    id: "snare-kick-2-4",
    title: "Snare on 2 & 4 with Kick", 
    description: "Basic groove pattern with focus on backbeat timing.",
    count: 16,
    targetModule: 2,
    skillFocus: "Groove timing"
  },
  // New exercises for advanced gates
  {
    id: "hihat-independence",
    title: "Hi-Hat Independence",
    description: "Play steady hi-hat while varying kick and snare patterns.",
    count: 24,
    targetModule: 3,
    skillFocus: "Limb independence"
  },
  {
    id: "fill-recovery",
    title: "Fill Recovery",
    description: "Play 4-bar groove, 1-bar fill, return to groove seamlessly.",
    count: 8,
    targetModule: 3,
    skillFocus: "Musical flow"
  },
  {
    id: "tempo-stability",
    title: "Tempo Stability",
    description: "Maintain groove for 2 minutes without metronome acceleration.",
    count: 1,
    targetModule: 4,
    skillFocus: "Internal timing"
  }
];

/**
 * Check if student can advance to target module based on competency gates
 */
export function canAdvanceToModule(
  targetModule: number,
  diagnosticResults: Record<string, DiagnosticResult>,
  sessionsCompleted: number
): { canAdvance: boolean; blockingGate?: DiagnosticGate; reason?: string } {
  
  // Session requirement (existing logic)
  if (sessionsCompleted < 14) {
    return {
      canAdvance: false,
      reason: `Need ${14 - sessionsCompleted} more practice sessions`
    };
  }

  // Find the gate that unlocks this module
  const gate = COMPETENCY_GATES.find(g => g.unlocksModule === targetModule);
  
  if (!gate) {
    // No gate required for this module
    return { canAdvance: true };
  }

  // Check if gate requirements are met
  const gateStatus = evaluateGate(gate, diagnosticResults);
  
  if (gateStatus.status === "passed") {
    return { canAdvance: true };
  }

  return {
    canAdvance: false,
    blockingGate: gate,
    reason: gateStatus.reason
  };
}

/**
 * Evaluate if a specific competency gate has been passed
 */
export function evaluateGate(
  gate: DiagnosticGate,
  diagnosticResults: Record<string, DiagnosticResult>
): { status: GateStatus; reason: string; details: GateEvaluationDetails } {
  
  // Check if all required exercises have been completed
  const missingExercises = gate.requiredExercises.filter(
    exerciseId => !diagnosticResults[exerciseId] || diagnosticResults[exerciseId] === "untested"
  );
  
  if (missingExercises.length > 0) {
    return {
      status: "available",
      reason: `Complete diagnostic exercises: ${missingExercises.join(", ")}`,
      details: { missingExercises }
    };
  }

  // Count clean vs flam results
  const exerciseResults = gate.requiredExercises.map(id => diagnosticResults[id]);
  const cleanCount = exerciseResults.filter(r => r === "clean").length;
  const flamCount = exerciseResults.filter(r => r === "flam").length;
  const unsureCount = exerciseResults.filter(r => r === "unsure").length;

  // Check passing criteria
  if (cleanCount >= gate.minimumClean && flamCount <= gate.maximumFlams) {
    return {
      status: "passed",
      reason: "All diagnostic requirements met",
      details: { cleanCount, flamCount, unsureCount }
    };
  }

  return {
    status: "failed", 
    reason: `Need ${gate.minimumClean} clean results, got ${cleanCount}. Max ${gate.maximumFlams} flams allowed, got ${flamCount}.`,
    details: { cleanCount, flamCount, unsureCount, requirements: gate }
  };
}

/**
 * Get the next required diagnostic for module progression
 */
export function getNextRequiredDiagnostic(
  currentModule: number,
  diagnosticResults: Record<string, DiagnosticResult>
): { exercise?: string; gate?: DiagnosticGate } | null {
  
  const nextModule = currentModule + 1;
  const gate = COMPETENCY_GATES.find(g => g.unlocksModule === nextModule);
  
  if (!gate) {
    return null; // No more gates
  }

  // Find first incomplete exercise in this gate
  const incompleteExercise = gate.requiredExercises.find(
    exerciseId => !diagnosticResults[exerciseId] || diagnosticResults[exerciseId] === "untested"
  );

  return {
    exercise: incompleteExercise,
    gate
  };
}

/**
 * Get all available competency gates for display
 */
export type GateEvaluation = {
  status: GateStatus;
  reason: string;
  details: GateEvaluationDetails;
};

export type CompetencyGateStatus = DiagnosticGate & {
  status: GateEvaluation;
  isRelevant: boolean;
};

export function getCompetencyGateStatus(
  currentModule: number,
  diagnosticResults: Record<string, DiagnosticResult>
): CompetencyGateStatus[] {
  return COMPETENCY_GATES.map(gate => ({
    ...gate,
    status: evaluateGate(gate, diagnosticResults),
    isRelevant: gate.unlocksModule === currentModule + 1 // Next module
  }));
}

/**
 * Generate a practice prescription based on failed gates
 */
export function generatePrescription(
  gate: DiagnosticGate,
  diagnosticResults: Record<string, DiagnosticResult>
): string[] {
  const prescription = [];
  
  const flamExercises = gate.requiredExercises.filter(
    id => diagnosticResults[id] === "flam"
  );
  
  if (flamExercises.length > 0) {
    prescription.push(
      `Priority: Fix flams in ${flamExercises.join(", ")}`,
      `• Practice each limb alone for 2 minutes`,
      `• Combine at 40 BPM (very slow) until unified`,
      `• Record and listen - stop immediately on any "ka-thunk"`,
      `• Only increase tempo when consistently clean`
    );
  }

  const unsureExercises = gate.requiredExercises.filter(
    id => diagnosticResults[id] === "unsure"
  );
  
  if (unsureExercises.length > 0) {
    prescription.push(
      `Listen more carefully in ${unsureExercises.join(", ")}`,
      `• Use headphones when reviewing recordings`,
      `• Close your eyes - flams are easier to hear than feel`, 
      `• If in doubt, it's probably a flam`,
      `• Get a second opinion from a teacher or experienced drummer`
    );
  }

  if (prescription.length === 0) {
    prescription.push(
      `Review Module ${gate.unlocksModule - 1} fundamentals`,
      `• Focus on coordination exercises`,
      `• Use metronome starting at 50 BPM`,
      `• Record every practice session`
    );
  }

  return prescription;
}