import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Practice Insights | Drum",
  description: "Deep analytics on your drumming practice habits and progress.",
};

export default function InsightsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
