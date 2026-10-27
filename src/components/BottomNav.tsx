"use client";

/**
 * BOTTOM NAVIGATION
 * Five tabs: Today, Vision (her board and 90-day intentions), Radiate 8,
 * Moments and Stories. Her profile lives behind the icon at the top of Today.
 * Daily Activities and Dedications are reached from Today. Music lives inside
 * the Daily Activities, not in a tab of its own.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Camera, ChartPie, Sparkles, Sun } from "lucide-react";

const tabs = [
  { href: "/", label: "Today", icon: <Sun size={20} strokeWidth={1.4} />, also: [] as string[] },
  { href: "/vision", label: "Vision", icon: <Sparkles size={20} strokeWidth={1.4} />, also: ["/intentions"] },
  { href: "/radiate8", label: "Radiate 8", icon: <ChartPie size={20} strokeWidth={1.4} />, also: ["/dimension"] },
  { href: "/moments", label: "Moments", icon: <Camera size={20} strokeWidth={1.4} />, also: [] },
  { href: "/stories", label: "Stories", icon: <BookOpen size={20} strokeWidth={1.4} />, also: [] },
];

export function BottomNav() {
  const pathname = usePathname();
  // Hide the tab bar during onboarding.
  if (pathname.startsWith("/welcome") || pathname.startsWith("/auth")) return null;

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <ul className="flex w-full max-w-md items-center justify-between rounded-full bg-linen/90 px-3 py-2 shadow-[0_12px_30px_-18px_rgb(75_48_74/0.45)] backdrop-blur">
        {tabs.map((tab) => {
          const active =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href) || tab.also.some((p) => pathname.startsWith(p));
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
