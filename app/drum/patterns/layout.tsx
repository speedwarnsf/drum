import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "40 Essential Rudiments — RepoDrum",
  description: "Browse all 40 PAS essential drum rudiments with notation, sticking patterns, and practice tips.",
  openGraph: {
    title: "40 Essential Rudiments — RepoDrum",
    description: "Browse all 40 PAS essential drum rudiments with notation, sticking patterns, and practice tips.",
  },
};

export default function PatternsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
