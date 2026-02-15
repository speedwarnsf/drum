"use client";

import React, { useState, useCallback } from "react";

interface ShareRudimentProps {
  rudimentId: string;
  rudimentName: string;
  bpm: number;
  sticking: string;
}

export default function ShareRudiment({ rudimentId, rudimentName, bpm, sticking }: ShareRudimentProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `https://repodrum.com/drum/rudiments/${rudimentId}?bpm=${bpm}`;
  const shareText = `${rudimentName} (${sticking}) at ${bpm} BPM — RepoDrum`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareUrl]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: rudimentName,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled — ignore
      }
    }
  }, [rudimentName, shareText, shareUrl]);

  return (
    <section className="card" style={{ padding: "12px 16px" }}>
      <div className="kicker" style={{ marginBottom: 8 }}>Share this rudiment</div>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "var(--bg)",
        border: "1px solid var(--stroke)",
        padding: "8px 12px",
        fontFamily: "monospace",
        fontSize: "0.8rem",
        overflow: "hidden",
      }}>
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {shareUrl}
        </span>
        <button className="btn btn-ghost" onClick={handleCopy} style={{ whiteSpace: "nowrap", padding: "4px 10px", fontSize: "0.8rem" }}>
          {copied ? "Copied" : "Copy"}
        </button>
        {typeof navigator !== "undefined" && "share" in navigator && (
          <button className="btn btn-ghost" onClick={handleNativeShare} style={{ whiteSpace: "nowrap", padding: "4px 10px", fontSize: "0.8rem" }}>
            Share
          </button>
        )}
      </div>
    </section>
  );
}
