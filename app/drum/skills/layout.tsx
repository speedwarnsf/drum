import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Skills Tree — RepoDrum",
  description: "Visualize your drum skill progression across timing, technique, rudiments, and creativity.",
  openGraph: {
    title: "Skills Tree — RepoDrum",
    description: "Visualize your drum skill progression across timing, technique, rudiments, and creativity.",
  },
};

export default function SkillsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
