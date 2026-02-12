import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Progress & Achievements — RepoDrum",
  description: "Track your drumming progress, practice streaks, achievements, and skill development.",
  openGraph: {
    title: "Progress & Achievements — RepoDrum",
    description: "Track your drumming progress, practice streaks, achievements, and skill development.",
  },
};

export default function ProgressLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
