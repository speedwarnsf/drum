import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — RepoDrum",
  description: "RepoDrum privacy policy. How we handle your data.",
};

export default function PrivacyPage() {
  return (
    <main className="shell shell-tight" style={{ lineHeight: 1.7 }}>
      <header style={{ marginBottom: 24 }}>
        <div className="kicker">Legal</div>
        <h1 className="title">Privacy Policy</h1>
        <p className="sub" style={{ marginTop: 8 }}>Last updated: February 2025</p>
      </header>

      <section style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="card" style={{ padding: 20 }}>
          <h2 className="card-title">Overview</h2>
          <p>
            RepoDrum is a browser-based drum practice tool. We are committed to keeping your data
            minimal, private, and under your control.
          </p>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h2 className="card-title">Data We Collect</h2>
          <p><strong>Practice data:</strong> Your practice sessions, progress, and settings are stored
          locally in your browser (localStorage). This data never leaves your device unless you
          explicitly create an account to sync.</p>
          <p style={{ marginTop: 8 }}><strong>Account data:</strong> If you choose to create an account,
          we store your email address and synced practice data in our database (Supabase). This is
          used solely to provide cross-device sync.</p>
          <p style={{ marginTop: 8 }}><strong>No tracking:</strong> We do not use analytics cookies,
          advertising trackers, or third-party data collection scripts.</p>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h2 className="card-title">How We Use Your Data</h2>
          <p>Your data is used exclusively to provide the RepoDrum practice experience:</p>
          <ul style={{ marginTop: 8, marginLeft: 20 }}>
            <li>Storing your practice progress and preferences</li>
            <li>Generating practice recommendations via spaced repetition</li>
            <li>Syncing data across devices (if you create an account)</li>
          </ul>
          <p style={{ marginTop: 8 }}>We do not sell, share, or monetize your data in any way.</p>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h2 className="card-title">Data Storage and Security</h2>
          <p>Local data is stored in your browser and can be cleared at any time through your
          browser settings or the app&apos;s reset function. Account data is stored securely on
          Supabase with row-level security policies.</p>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h2 className="card-title">Your Rights</h2>
          <p>You can delete all your local data at any time. If you have an account, you can
          request complete deletion of your data by contacting us. You can export your practice
          data as CSV from the progress page.</p>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h2 className="card-title">Contact</h2>
          <p>Questions about this policy? Reach out at the RepoDrum GitHub repository.</p>
        </div>
      </section>

      <div style={{ marginTop: 24, textAlign: "center" }}>
        <a className="btn btn-ghost" href="/">Back to Home</a>
      </div>
    </main>
  );
}
