import { ReactNode } from "react";
import HeroVideo from "./_ui/HeroVideo";

export default async function DrumLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="shell hero-shell" aria-label="Drum video">
        <section className="hero">
          <HeroVideo />
        </section>
      </div>
      {children}
    </>
  );
}
