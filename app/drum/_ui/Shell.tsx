"use client";

import React from "react";
import BuildTag from "./BuildTag";
import { AuthNavLinks, AuthSetupLink } from "./AuthControls";
import LessonCredits from "./LessonCredits";

export default function Shell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="shell">
      <header className="shell-header">
        <div className="shell-head">
          <div>
            <div className="kicker">Adaptive Drum Instructor</div>
            <h1 className="title">{title}</h1>
            {subtitle ? <p className="sub">{subtitle}</p> : null}
          </div>

          <div className="shell-nav">
            <AuthSetupLink />
            <a href="/drum/today" className="btn btn-ghost">
              Today
            </a>
            <a href="/drum/drills" className="btn btn-ghost">
              Drills
            </a>
            <a href="/drum/progress" className="btn btn-ghost">
              Progress
            </a>
            <a href="/drum/method" className="btn btn-ghost">
              Method
            </a>
            <AuthNavLinks />
            <a href="/drum/history" className="btn btn-ghost">
              History
            </a>
            <a href="/drum/journal" className="btn btn-ghost">
              Log
            </a>
            <LessonCredits />
          </div>
        </div>
      </header>

      {children}
      <BuildTag />
    </main>
  );
}
