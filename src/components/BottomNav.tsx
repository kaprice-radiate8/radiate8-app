"use client";

/**
 * BOTTOM NAVIGATION
 * The soft tab bar at the bottom of every screen.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, ChartPie, Music, Sun, Waves } from "lucide-react";

const tabs = [
  { href: "/", label: "Today", icon: <Sun size={20} strokeWidth={1.4} /> },
  { href: "/wheel", label: "Wheel", icon: <ChartPie size={20} strokeWidth={1.4} /> },
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
      <ul className="flex w-full max-w-md items-center justify-between rounded-full bg-linen/90 px-3 py-2 shadow-[0_12px_30px_-18px_rgb(75_48_74/0.45)] backdrop-blur">
        {tabs.map((tab) => {
          const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href) || (tab.href === "/wheel" && pathname.startsWith("/dimension"));
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 rounded-full pt-1.5 pb-0.5 text-[0.6rem] uppercase tracking-[0.16em] transition-colors duration-500 ${
                  active ? "text-plum" : "text-plum-soft hover:text-plum"
                }`}
              >
                <span className="flex h-6 items-center">{tab.icon}</span>
                <span className={active ? "font-medium" : ""}>{tab.label}</span>
                {/* A small gold dot marks where you are */}
                <span className={`h-1 w-1 rounded-full bg-gold transition-opacity duration-500 ${active ? "opacity-100" : "opacity-0"}`} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
