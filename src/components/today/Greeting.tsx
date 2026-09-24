"use client";

/**
 * GREETING
 * "Good evening, Kaprice" with today's date and a handwritten accent line.
 */
import Link from "next/link";
import { Settings } from "lucide-react";
import { brand } from "@/config/app.config";
import { useStoreData } from "@/lib/data";
import { Figure8 } from "../Figure8";

function timeOfDay(hour: number) {
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function Greeting() {
  // Loads the name and also tells us we are in the browser, where the clock is correct.
  const { data: profile, ready } = useStoreData((s) => s.getProfile());
  const now = new Date();
  const dateLine = now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  // Alternate the brand triads day by day (once we know the real date).
  const triad = brand.triads[ready ? now.getDate() % brand.triads.length : 0];

  return (
    <header className="pt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-terracotta">
          <Figure8 size={22} strokeWidth={5} />
          <span className="label !text-terracotta">{brand.appName}</span>
        </div>
        <Link href="/settings" aria-label="Settings" className="rounded-full p-2 text-cocoa/70 transition-colors hover:text-espresso">
          <Settings size={20} strokeWidth={1.4} />
        </Link>
      </div>

      <div className={`mt-8 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}>
        <p className="label">{ready ? dateLine : " "}</p>
        <h1 className="mt-2 font-serif text-[2.6rem] leading-[1.05] font-light text-espresso">
          {ready ? timeOfDay(now.getHours()) : "Welcome"}
          {profile?.name ? (
            <>
              ,<br />
              <span className="italic">{profile.name}</span>
            </>
          ) : null}
        </h1>
        <p className="mt-3 font-script text-2xl text-terracotta">{triad}</p>
        {ready && !profile?.name && (
          <Link href="/settings" className="mt-2 inline-block text-sm text-cocoa underline decoration-line underline-offset-4">
            Tell us what to call you
          </Link>
        )}
      </div>
    </header>
  );
}
