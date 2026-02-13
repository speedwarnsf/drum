import Link from "next/link";

export default function NotFound() {
  return (
    <main className="shell shell-tight">
      <div className="shell-header">
        <h1 className="title">Page not found</h1>
        <p className="sub">
          This page seems to have wandered off. Like a drumstick rolling under the kick drum.
        </p>
      </div>

      <section className="card" style={{ textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16, display: "flex", justifyContent: "center" }}><svg viewBox="0 0 24 24" width="64" height="64" fill="currentColor" aria-hidden="true"><ellipse cx="12" cy="14" rx="8" ry="5" stroke="currentColor" strokeWidth="2" fill="none"/><line x1="4" y1="14" x2="4" y2="9" stroke="currentColor" strokeWidth="2"/><line x1="20" y1="14" x2="20" y2="9" stroke="currentColor" strokeWidth="2"/><ellipse cx="12" cy="9" rx="8" ry="5" stroke="currentColor" strokeWidth="2" fill="none"/><line x1="7" y1="2" x2="15" y2="9" stroke="currentColor" strokeWidth="2"/><line x1="17" y1="2" x2="9" y2="9" stroke="currentColor" strokeWidth="2"/></svg></div>
        <h2 className="card-title">404</h2>
        <p>The page you&apos;re looking for doesn&apos;t exist.</p>
        
        <div className="row" style={{ marginTop: 20, justifyContent: "center" }}>
          <Link href="/drum/today" className="btn">
            Go to today&apos;s practice
          </Link>
          <Link href="/drum" className="btn btn-ghost">
            Home
          </Link>
        </div>
      </section>

      <section className="card">
        <h2 className="card-title">Looking for something?</h2>
        <ul style={{ marginTop: 8 }}>
          <li><Link href="/drum/today">Today&apos;s Practice Card</Link></li>
          <li><Link href="/drum/history">Session History</Link></li>
          <li><Link href="/drum/progress">Your Progress</Link></li>
          <li><Link href="/drum/start">Edit Profile</Link></li>
        </ul>
      </section>
    </main>
  );
}
