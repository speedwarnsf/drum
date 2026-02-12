import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Warm-Up | Drum",
  description: "Quick warm-up routines to prepare your hands and mind for practice.",
};

export default function WarmupLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
