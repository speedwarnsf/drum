import { ReactNode } from "react";
import BottomNav from "./_ui/BottomNav";
import ServiceWorkerProvider from "./_ui/ServiceWorkerProvider";
import HighContrastInit from "./_ui/HighContrastInit";
import PwaInstallPrompt from "./_ui/PwaInstallPrompt";
import WhatsNew from "./_ui/WhatsNew";

export default async function DrumLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ServiceWorkerProvider />
      <HighContrastInit />
      {children}
      <PwaInstallPrompt />
      <WhatsNew />
      <BottomNav />
    </>
  );
}
