import { ReactNode } from "react";
import BottomNav from "./_ui/BottomNav";
import ServiceWorkerProvider from "./_ui/ServiceWorkerProvider";
import HighContrastInit from "./_ui/HighContrastInit";

export default async function DrumLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ServiceWorkerProvider />
      <HighContrastInit />
      {children}
      <BottomNav />
    </>
  );
}
