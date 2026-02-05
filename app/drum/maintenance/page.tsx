"use client";

import Shell from "../_ui/Shell";
import MaintenanceMode from "../_ui/MaintenanceMode";
import { ErrorBoundary } from "../_ui/ErrorBoundary";
import { OfflineIndicator } from "../_ui/OfflineIndicator";

export default function MaintenancePage() {
  return (
    <ErrorBoundary>
      <Shell
        title="Maintenance"
        subtitle="The quiet work of retention"
      >
        <MaintenanceMode />

        {/* Educational context */}
        <section className="card">
          <h3 className="card-title">Why Maintenance?</h3>
          <p>
            Motor skills fade without reinforcement. Spaced repetition keeps patterns 
            alive in muscle memory—reviewing each one at optimal intervals.
          </p>
          <ul style={{ marginTop: 12, paddingLeft: 20 }}>
            <li>Patterns you nail get reviewed less often</li>
            <li>Patterns you struggle with return sooner</li>
            <li>The algorithm adapts to your actual performance</li>
          </ul>
          <p className="sub" style={{ marginTop: 12 }}>
            Ten minutes of maintenance beats an hour of cramming.
          </p>
        </section>

        {/* Navigation */}
        <section className="card">
          <div className="row">
            <a href="/drum/today" className="btn btn-ghost">
              ← Back to Today
            </a>
            <a href="/drum/drills" className="btn btn-ghost">
              Gap Drills
            </a>
            <a href="/drum/progress" className="btn btn-ghost">
              Progress
            </a>
          </div>
        </section>
      </Shell>
      <OfflineIndicator />
    </ErrorBoundary>
  );
}
