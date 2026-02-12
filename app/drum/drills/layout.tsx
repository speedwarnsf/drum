import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Drills & Gap Exercises — RepoDrum",
  description: "Practice drum drills with gap exercises, tempo training, and timing challenges.",
  openGraph: {
    title: "Drills & Gap Exercises — RepoDrum",
    description: "Practice drum drills with gap exercises, tempo training, and timing challenges.",
  },
};

export default function DrillsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
