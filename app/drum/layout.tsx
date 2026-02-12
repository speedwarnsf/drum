import { ReactNode } from "react";
import BottomNav from "./_ui/BottomNav";
import ServiceWorkerProvider from "./_ui/ServiceWorkerProvider";

export default async function DrumLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ServiceWorkerProvider />
      {children}
      <BottomNav />
    </>
  );
}
