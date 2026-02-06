"use client";

import React, { useState, useEffect } from "react";
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Close mobile nav on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    if (mobileNavOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when nav is open
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  // Close mobile nav on route change (when clicking links)
  const handleNavClick = () => {
    setMobileNavOpen(false);
  };

  const primaryNavLinks = (
    <>
      <a href="/drum/today" className="btn btn-primary" onClick={handleNavClick}>
        🎯 Today
      </a>
      <a href="/drum/patterns" className="btn btn-ghost" onClick={handleNavClick}>
        📚 Patterns
      </a>
      <a href="/drum/drills" className="btn btn-ghost" onClick={handleNavClick}>
        💪 Drills
      </a>
      <a href="/drum/progress" className="btn btn-ghost" onClick={handleNavClick}>
        📈 Progress
      </a>
    </>
  );

  const secondaryNavLinks = (
    <>
      <div className="nav-section-label">Learning Tools</div>
      <a href="/drum/skills" className="btn btn-ghost btn-sm" onClick={handleNavClick}>
        Skills Tree
      </a>
      <a href="/drum/diagnostic" className="btn btn-ghost btn-sm" onClick={handleNavClick}>
        Diagnostic
      </a>
      <a href="/drum/method" className="btn btn-ghost btn-sm" onClick={handleNavClick}>
        Method
      </a>
      <div className="nav-section-label">Community & Support</div>
      <a href="/drum/community" className="btn btn-ghost btn-sm" onClick={handleNavClick}>
        Community
      </a>
      <a href="/drum/maintenance" className="btn btn-ghost btn-sm" onClick={handleNavClick}>
        Maintenance
      </a>
      <div className="nav-section-label">History & Data</div>
      <a href="/drum/history" className="btn btn-ghost btn-sm" onClick={handleNavClick}>
        History
      </a>
      <a href="/drum/journal" className="btn btn-ghost btn-sm" onClick={handleNavClick}>
        Journal
      </a>
    </>
  );

  // Desktop navigation (more compact)
  const desktopNavLinks = (
    <>
      <AuthSetupLink />
      <a href="/drum/today" className="btn btn-ghost" onClick={handleNavClick}>
        Today
      </a>
      <a href="/drum/patterns" className="btn btn-ghost" onClick={handleNavClick}>
        Patterns
      </a>
      <a href="/drum/drills" className="btn btn-ghost" onClick={handleNavClick}>
        Drills
      </a>
      <a href="/drum/progress" className="btn btn-ghost" onClick={handleNavClick}>
        Progress
      </a>
      <a href="/drum/skills" className="btn btn-ghost" onClick={handleNavClick}>
        Skills
      </a>
      <a href="/drum/community" className="btn btn-ghost" onClick={handleNavClick}>
        Community
      </a>
      <AuthNavLinks />
      <LessonCredits />
    </>
  );

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
            {/* Mobile hamburger toggle */}
            <button
              type="button"
              className="mobile-nav-toggle"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-nav"
              aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
            >
              <span className="mobile-nav-toggle-icon" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </button>

            {/* Mobile nav menu (hidden on desktop via CSS) */}
            <nav
              id="mobile-nav"
              className={`mobile-nav-menu ${mobileNavOpen ? "mobile-nav-open" : ""}`}
              aria-label="Main navigation"
            >
              <button
                type="button"
                className="mobile-nav-close"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close navigation"
              >
                ×
              </button>
              <AuthSetupLink />
              <div className="nav-section-primary">
                {primaryNavLinks}
              </div>
              <div className="nav-section-secondary">
                {secondaryNavLinks}
              </div>
              <AuthNavLinks />
              <LessonCredits />
            </nav>

            {/* Desktop nav (visible when mobile nav is hidden via CSS) */}
            <div className="desktop-nav">
              {desktopNavLinks}
            </div>
          </div>
        </div>
      </header>

      {children}
      <BuildTag />
    </main>
  );
}
