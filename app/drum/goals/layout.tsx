import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Practice Goals | Drum",
  description: "Set and track your weekly and monthly practice goals.",
};

export default function GoalsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
