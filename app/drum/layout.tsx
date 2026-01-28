import { ReactNode } from "react";

export default async function DrumLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="shell hero-shell" aria-label="Drum video">
        <section className="hero">
          <video
            className="hero-video"
            src="/media/YellowDrum.mp4"
            autoPlay
            muted
            loop
            playsInline
          />
        </section>
      </div>
      {children}
    </>
  );
}
