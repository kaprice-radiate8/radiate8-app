"use client";

/**
 * BOTTOM NAVIGATION
 * The soft tab bar at the bottom of every screen.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Music, Sun, Waves } from "lucide-react";
import { Figure8 } from "./Figure8";

const tabs = [
  { href: "/", label: "Today", icon: <Sun size={20} strokeWidth={1.4} /> },
  { href: "/wheel", label: "Wheel", icon: <Figure8 size={22} strokeWidth={6} /> },
  { href: "/rhythm", label: "Rhythm", icon: <Waves size={20} strokeWidth={1.4} /> },
  { href: "/moments", label: "Moments", icon: <Camera size={20} strokeWidth={1.4} /> },
  { href: "/music", label: "Music", icon: <Music size={20} strokeWidth={1.4} /> },
];

export function BottomNav() {
  const pathname = usePathname();
  // Hide the tab bar during onboarding.
  if (pathname.startsWith("/welcome")) return null;

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <ul className="flex w-full max-w-md items-center justify-between rounded-full bg-cream/90 px-3 py-2 shadow-[0_12px_30px_-18px_rgb(59_42_34/0.5)] backdrop-blur">
        {tabs.map((tab) => {
          const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href) || (tab.href === "/wheel" && pathname.startsWith("/dimension"));
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 rounded-full py-1.5 text-[0.6rem] uppercase tracking-[0.16em] transition-colors duration-500 ${
                  active ? "text-terracotta" : "text-cocoa/70 hover:text-cocoa"
                }`}
              >
                <span className="flex h-6 items-center">{tab.icon}</span>
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
