import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offline — RepoDrum",
};

export default function OfflinePage() {
  return (
    <div
      style={{
        maxWidth: 480,
        margin: "80px auto",
        padding: "0 24px",
        textAlign: "center",
        fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: 8 }}>🥁 You're Offline</h1>
      <p style={{ color: "#666", lineHeight: 1.6, marginBottom: 24 }}>
        No internet connection right now. Some features need the network, but
        you can still use the metronome and review your cached practice data.
      </p>
      <p style={{ color: "#888", fontSize: "0.9rem" }}>
        Your practice sessions will sync automatically when you reconnect.
      </p>
      <a
        href="/drum/today"
        style={{
          display: "inline-block",
          marginTop: 24,
          padding: "12px 28px",
          backgroundColor: "#f4ba34",
          color: "#1a1a1a",
          borderRadius: 8,
          textDecoration: "none",
          fontWeight: 600,
        }}
      >
        Try Again
      </a>
    </div>
  );
}
