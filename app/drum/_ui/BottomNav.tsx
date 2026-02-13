"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Icon } from "./Icon";

const NAV_ITEMS = [
  { href: "/drum/today", icon: "drum", label: "Practice" },
  { href: "/drum/drills", icon: "drills", label: "Drills" },
  { href: "/drum/goals", icon: "clipboard", label: "Goals" },
  { href: "/drum/insights", icon: "chart-bar", label: "Insights" },
  { href: "/drum/progress", icon: "trophy", label: "Progress" },
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
            aria-current={isActive ? "page" : undefined}
          >
            <span className="bottom-nav-icon" aria-hidden="true"><Icon name={item.icon} size={18} /></span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
