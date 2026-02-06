"use client";

import { useState } from "react";
import { 
  DiagnosticGate,
  DiagnosticResult,
  getCompetencyGateStatus, 
  generatePrescription,
  getNextRequiredDiagnostic 
} from "../_lib/competencyGates";

type CompetencyGateDisplayProps = {
  currentModule: number;
  diagnosticResults: Record<string, DiagnosticResult>;
  compact?: boolean;
};

export default function CompetencyGateDisplay({
  currentModule,
  diagnosticResults,
  compact = false
}: CompetencyGateDisplayProps) {
  const [expandedGate, setExpandedGate] = useState<string | null>(null);
  
  const gateStatuses = getCompetencyGateStatus(currentModule, diagnosticResults);
  const nextDiagnostic = getNextRequiredDiagnostic(currentModule, diagnosticResults);
  const relevantGates = gateStatuses.filter(g => g.isRelevant);

  if (compact && relevantGates.length === 0) {
    return null;
  }

  if (compact) {
    const nextGate = relevantGates[0];
    if (!nextGate) return null;

    const statusIcon = {
      passed: "✅",
      failed: "❌", 
      available: "🎯",
      locked: "🔒"
    }[nextGate.status.status];

    return (
      <div className="competency-gate-compact">
        <div className="gate-status">
          <span className="gate-icon">{statusIcon}</span>
          <span className="gate-name">{nextGate.name}</span>
          {nextGate.status.status === "available" && (
            <a href="/drum/diagnostic" className="gate-action-link">
              Take test →
            </a>
          )}
        </div>
        {nextGate.status.status === "failed" && (
          <p className="gate-failure-hint">{nextGate.failureGuidance}</p>
        )}
      </div>
    );
  }

  return (
    <div className="competency-gates">
      <div className="gates-header">
        <h3>Competency Gates</h3>
        <p className="sub">
          Pass these diagnostic tests to advance between modules. 
          Each gate ensures solid fundamentals before adding complexity.
        </p>
      </div>

      {nextDiagnostic && (
        <section className="next-diagnostic-card">
          <div className="kicker">Next Required</div>
          <h4>{nextDiagnostic.gate?.name}</h4>
          <p>{nextDiagnostic.gate?.description}</p>
          <div className="row">
            <a href="/drum/diagnostic" className="btn">
              Take Diagnostic Test
            </a>
          </div>
        </section>
      )}

      <div className="gates-list">
        {gateStatuses.map((gateWithStatus) => {
          const isExpanded = expandedGate === gateWithStatus.id;
          const statusClass = `gate-status-${gateWithStatus.status.status}`;

          return (
            <div key={gateWithStatus.id} className={`gate-item ${statusClass}`}>
              <div 
                className="gate-header"
                onClick={() => setExpandedGate(isExpanded ? null : gateWithStatus.id)}
              >
                <div className="gate-info">
                  <span className="gate-status-icon">
                    {gateWithStatus.status.status === "passed" && "✅"}
                    {gateWithStatus.status.status === "failed" && "❌"}
                    {gateWithStatus.status.status === "available" && "🎯"}
                    {gateWithStatus.status.status === "locked" && "🔒"}
                  </span>
                  <div>
                    <h4 className="gate-name">{gateWithStatus.name}</h4>
                    <p className="gate-unlock-info">
                      Unlocks Module {gateWithStatus.unlocksModule}
                    </p>
                  </div>
                </div>
                <div className="gate-status-text">
                  {gateWithStatus.status.status === "passed" && "Passed"}
                  {gateWithStatus.status.status === "failed" && "Failed"}
                  {gateWithStatus.status.status === "available" && "Ready to test"}
                  {gateWithStatus.status.status === "locked" && "Not yet available"}
                </div>
                <span className="gate-expand-icon">
                  {isExpanded ? "−" : "+"}
                </span>
              </div>

              {isExpanded && (
                <div className="gate-details">
                  <p className="gate-description">{gateWithStatus.description}</p>
                  
                  <div className="gate-requirements">
                    <h5>Requirements:</h5>
                    <ul>
                      <li>Complete {gateWithStatus.requiredExercises.join(", ")} exercises</li>
                      <li>Minimum {gateWithStatus.minimumClean} clean results</li>
                      <li>Maximum {gateWithStatus.maximumFlams} flams allowed</li>
                    </ul>
                  </div>

                  <div className="gate-rationale">
                    <h5>Why this checkpoint exists:</h5>
                    <p>{gateWithStatus.rationale}</p>
                  </div>

                  {gateWithStatus.status.status === "failed" && (
                    <div className="gate-prescription">
                      <h5>Your Practice Prescription:</h5>
                      <div className="prescription-list">
                        {generatePrescription(gateWithStatus, diagnosticResults).map((item, i) => (
                          <p key={i} className={item.startsWith("🎯") || item.startsWith("🎧") || item.startsWith("📚") ? "prescription-header" : "prescription-detail"}>
                            {item}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {gateWithStatus.status.status === "available" && (
                    <div className="gate-actions">
                      <a href="/drum/diagnostic" className="btn">
                        Take Diagnostic Test
                      </a>
                    </div>
                  )}

                  {gateWithStatus.status.details && (
                    <div className="gate-debug">
                      <details>
                        <summary>Test Details</summary>
                        <pre>{JSON.stringify(gateWithStatus.status.details, null, 2)}</pre>
                      </details>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {gateStatuses.length === 0 && (
        <div className="no-gates">
          <p>No competency gates required at this level.</p>
        </div>
      )}
    </div>
  );
}