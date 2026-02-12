import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Enhanced Practice — RepoDrum",
  description: "Full-featured drum practice with metronome, audio visualization, tap detection, and real-time feedback.",
  openGraph: {
    title: "Enhanced Practice — RepoDrum",
    description: "Full-featured drum practice with metronome, audio visualization, tap detection, and real-time feedback.",
  },
};

export default function PracticeEnhancedLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
