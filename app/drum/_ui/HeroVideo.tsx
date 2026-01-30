"use client";

import React, { useEffect, useRef } from "react";

export default function HeroVideo() {
  const ref = useRef<HTMLVideoElement | null>(null);

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
      className="hero-video"
      src="/media/YellowDrum.mp4"
      poster="/media/drummer-still.png"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
    />
  );
}
