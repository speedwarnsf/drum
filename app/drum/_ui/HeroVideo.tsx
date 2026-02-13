"use client";

import React, { useEffect, useRef, useState } from "react";

export default function HeroVideo() {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [ready, setReady] = useState(false);
  const [autoplayFailed, setAutoplayFailed] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    // Attempt autoplay — if blocked (common on mobile), show poster + play button
    const tryPlay = async () => {
      try {
        await video.play();
      } catch {
        setAutoplayFailed(true);
      }
    };

    tryPlay();

    const handleEnded = () => {
      video.currentTime = 0;
      void video.play().catch(() => {});
    };

    video.addEventListener("ended", handleEnded);
    return () => {
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  const handleManualPlay = () => {
    const video = ref.current;
    if (!video) return;
    video.muted = true; // ensure muted for autoplay policy
    void video.play().then(() => {
      setAutoplayFailed(false);
    }).catch(() => {});
  };

  return (
    <div className="hero-video-wrapper" style={{ position: "relative" }}>
      <video
        ref={ref}
        className={`hero-video ${ready ? "hero-video-ready" : "hero-video-loading"}`}
        src="/media/YellowDrum.mp4"
        poster="/media/YellowDrum-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        style={{ mixBlendMode: "darken" }}
        onLoadedData={() => setReady(true)}
        onCanPlay={() => setReady(true)}
        onError={() => setReady(true)}
        aria-hidden="true"
      />
      {/* Poster fallback with play button when autoplay is blocked */}
      {autoplayFailed && (
        <button
          type="button"
          onClick={handleManualPlay}
          aria-label="Play video"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `url(/media/YellowDrum-poster.jpg) center/cover no-repeat`,
            border: "none",
            cursor: "pointer",
            zIndex: 2,
          }}
        >
          <svg
            viewBox="0 0 64 64"
            width="64"
            height="64"
            fill="rgba(255,255,255,0.9)"
            style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.5))" }}
            aria-hidden="true"
          >
            <circle cx="32" cy="32" r="30" fill="rgba(0,0,0,0.4)" />
            <path d="M26,20 L26,44 L46,32 Z" />
          </svg>
        </button>
      )}
      {/* Poster image shown while video loads to prevent blank state */}
      {!ready && !autoplayFailed && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `url(/media/YellowDrum-poster.jpg) center/cover no-repeat`,
            zIndex: 1,
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
