"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/drum/today", icon: "🥁", label: "Practice" },
  { href: "/drum/drills", icon: "🎯", label: "Drills" },
  { href: "/drum/goals", icon: "📋", label: "Goals" },
  { href: "/drum/insights", icon: "📊", label: "Insights" },
  { href: "/drum/progress", icon: "🏆", label: "Progress" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {NAV_ITEMS.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/drum/today" && pathname?.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`bottom-nav-item ${isActive ? "active" : ""}`}
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
