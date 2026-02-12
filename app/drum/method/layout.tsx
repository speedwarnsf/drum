import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Method & Syllabus — RepoDrum",
  description: "Learn the RepoDrum teaching method: structured modules, audiation training, and progressive curriculum.",
  openGraph: {
    title: "Method & Syllabus — RepoDrum",
    description: "Learn the RepoDrum teaching method: structured modules, audiation training, and progressive curriculum.",
  },
};

export default function MethodLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
