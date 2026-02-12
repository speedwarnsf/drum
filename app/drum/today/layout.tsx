import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Today's Practice — RepoDrum",
  description: "Your personalized daily drum practice card with adaptive exercises and spaced repetition.",
  openGraph: {
    title: "Today's Practice — RepoDrum",
    description: "Your personalized daily drum practice card with adaptive exercises and spaced repetition.",
  },
};

export default function TodayLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
