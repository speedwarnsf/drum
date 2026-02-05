"use client";

import React, { useEffect, useRef, useState } from "react";

export default function HeroVideo() {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const play = () => {
      void video.play().catch(() => {});
    };
    const handleEnded = () => {
      video.currentTime = 0;
      play();
    };
    const handlePause = () => {
      play();
    };
    video.addEventListener("ended", handleEnded);
    video.addEventListener("pause", handlePause);
    play();
    return () => {
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("pause", handlePause);
    };
  }, []);

  return (
    <video
      ref={ref}
      className={`hero-video ${ready ? "hero-video-ready" : "hero-video-loading"}`}
      src="/media/YellowDrum.mp4"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      style={{ 
        mixBlendMode: "darken",
        WebkitMixBlendMode: "darken" 
      } as React.CSSProperties}
      onLoadedData={() => setReady(true)}
      onCanPlay={() => setReady(true)}
      onError={() => setReady(true)}
    />
  );
}
