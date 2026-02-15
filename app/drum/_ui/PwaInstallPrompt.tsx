"use client";

import React, { useState, useEffect, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed recently
    const dismissedAt = localStorage.getItem("pwa-install-dismissed");
    if (dismissedAt && Date.now() - parseInt(dismissedAt, 10) < 7 * 24 * 60 * 60 * 1000) {
      setDismissed(true);
      return;
    }

    // Check if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setDismissed(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
    setDismissed(true);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    localStorage.setItem("pwa-install-dismissed", String(Date.now()));
  }, []);

  if (!deferredPrompt || dismissed) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 72,
      left: 12,
      right: 12,
      zIndex: 900,
      background: "var(--card-bg, #fff)",
      border: "2px solid var(--ink)",
      padding: "16px",
      boxShadow: "4px 4px 0 var(--ink)",
    }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>Install RepoDrum</div>
      <p style={{ fontSize: "0.85rem", color: "var(--ink-muted)", margin: "0 0 12px" }}>
        Add to your home screen for offline practice and faster access.
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn" onClick={handleInstall}>Install</button>
        <button className="btn btn-ghost" onClick={handleDismiss}>Not now</button>
      </div>
    </div>
  );
}
