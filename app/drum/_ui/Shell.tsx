"use client";

import React from "react";

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
            <div className="kicker">Drum Practice System</div>
            <h1 className="title">{title}</h1>
            {subtitle ? <p className="sub">{subtitle}</p> : null}
          </div>

          <div className="shell-nav">
            <a href="/drum" className="btn btn-ghost">
              Home
            </a>
            <a href="/drum/start" className="btn btn-ghost">
              Setup
            </a>
            <a href="/drum/today" className="btn btn-ghost">
              Today
            </a>
            <a href="/drum/method" className="btn btn-ghost">
              Method
            </a>
            <a href="/drum/history" className="btn btn-ghost">
              History
            </a>
            <a href="/drum/journal" className="btn btn-ghost">
              Log
            </a>
          </div>
        </div>
      </header>

      {children}
    </main>
  );
}
