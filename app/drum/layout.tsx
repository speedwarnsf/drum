import { ReactNode } from "react";
import BottomNav from "./_ui/BottomNav";

export default async function DrumLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}
