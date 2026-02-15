import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — RepoDrum",
  description: "RepoDrum terms of service.",
};

export default function TermsPage() {
  return (
    <main className="shell shell-tight" style={{ lineHeight: 1.7 }}>
      <header style={{ marginBottom: 24 }}>
        <div className="kicker">Legal</div>
        <h1 className="title">Terms of Service</h1>
        <p className="sub" style={{ marginTop: 8 }}>Last updated: February 2025</p>
      </header>

      <section style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="card" style={{ padding: 20 }}>
          <h2 className="card-title">Acceptance of Terms</h2>
          <p>
            By accessing and using RepoDrum, you agree to these terms. If you do not agree,
            please do not use the service.
          </p>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h2 className="card-title">The Service</h2>
          <p>
            RepoDrum is a free, browser-based drum rudiment practice tool. The core features are
            available without an account. Optional premium features may require a paid subscription.
          </p>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h2 className="card-title">Your Use</h2>
          <p>You agree to use RepoDrum for personal, lawful purposes. You are responsible for
          maintaining the security of your account credentials if you create an account.</p>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h2 className="card-title">Data and Content</h2>
          <p>Your practice data belongs to you. We store it to provide the service and do not
          claim ownership of your content. You can export or delete your data at any time.</p>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h2 className="card-title">Availability</h2>
          <p>
            RepoDrum is provided &ldquo;as is&rdquo; without warranties. We do our best to keep
            the service available but cannot guarantee uninterrupted access. The offline PWA mode
            provides continued access without an internet connection.
          </p>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h2 className="card-title">Limitation of Liability</h2>
          <p>
            RepoDrum and its creators are not liable for any damages arising from your use of the
            service, including but not limited to loss of data or interruption of practice routines.
          </p>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h2 className="card-title">Changes</h2>
          <p>We may update these terms from time to time. Continued use of RepoDrum after changes
          constitutes acceptance of the updated terms.</p>
        </div>
      </section>

      <div style={{ marginTop: 24, textAlign: "center" }}>
        <a className="btn btn-ghost" href="/">Back to Home</a>
      </div>
    </main>
  );
}
