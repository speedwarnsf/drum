"use client";

import { useEffect } from "react";

export default function HighContrastInit() {
  useEffect(() => {
    try {
      const settings = localStorage.getItem("drum_settings");
      if (settings) {
        const s = JSON.parse(settings);
        if (s.highContrast) {
          document.documentElement.classList.add("high-contrast");
        }
      }
    } catch {}
  }, []);

  return null;
}
