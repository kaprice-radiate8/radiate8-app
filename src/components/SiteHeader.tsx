"use client";

/**
 * TOP OF EVERY SCREEN
 * The micro mark, always centered in the same place (a brand rule),
 * with the settings button on the Today screen.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import { MicroMark } from "./MicroMark";

export function SiteHeader() {
  const pathname = usePathname();
  // Onboarding shows its own larger mark.
  if (pathname.startsWith("/welcome")) return null;
  return (
    <header className="relative flex justify-center pb-2">
      <Link href="/" aria-label="Radiate 8, go to Today">
        <MicroMark height={40} />
      </Link>
      {pathname === "/" && (
        <Link
          href="/settings"
          aria-label="Settings"
          className="absolute top-1/2 right-0 -translate-y-1/2 rounded-full p-2 text-plum-soft transition-colors hover:text-plum"
        >
          <Settings size={20} strokeWidth={1.4} />
        </Link>
      )}
    </header>
  );
}
