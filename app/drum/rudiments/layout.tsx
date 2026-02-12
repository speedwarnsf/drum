import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Drum Rudiments | Repo Drum",
  description: "Learn the 40 essential PAS drum rudiments with notation, practice tips, and built-in metronome.",
};

export default function RudimentsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
