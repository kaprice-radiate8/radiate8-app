"use client";

/**
 * TODAY'S TWO INVITATIONS
 *   "How do you want to feel?"  → a Daily Activity (body, breath, music)
 *   "Have ten minutes?"         → Today's Dedication
 * Offered, never owed: no streaks, no "you missed yesterday".
 */
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { feelingPaths } from "@/config/app.config";
import { activityForToday, dedicationForToday, type DailyActivity, type Dedication } from "@/lib/content";
import { useToday } from "@/lib/use-today";
import { Artwork } from "../Artwork";
import { Icon } from "../Icon";
import { useFocus } from "../dedications/use-focus";

export function FeelInvitation({ activities }: { activities: DailyActivity[] }) {
  const day = useToday();
  return (
    <section className="card p-5">
      <p className="label">Daily Activity</p>
      <h2 className="mt-2 font-serif text-2xl text-plum">How do you want to feel?</h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {feelingPaths.map((p) => {
          const activity = activityForToday(activities, p.id, day);
          if (!activity) return null;
          return (
            <Link
              key={p.id}
              href={`/activity/${activity.id}`}
              className="flex flex-col items-start gap-3 rounded-2xl bg-blush/50 p-4 text-plum transition-all hover:bg-blush/80 active:scale-[0.98]"
            >
              <Icon name={p.icon} size={22} />
              <span className="font-serif text-2xl leading-none">{p.label}</span>
              <span className="text-xs text-plum-soft">
                {activity.title} · {activity.durationMinutes} min
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function DedicationInvitation({ dedications }: { dedications: Dedication[] }) {
  const day = useToday();
  const focus = useFocus();
  const { dedication } = dedicationForToday(dedications, focus, day);
  if (!dedication) return null;
  return (
    <Link href={`/dedications/${dedication.id}`} className="card flex items-center gap-4 p-5 transition-transform active:scale-[0.99]">
      <Artwork colors={dedication.artworkColors} url={dedication.artworkUrl} size={76} />
      <span className="min-w-0 flex-1">
        <span className="label block">Have ten minutes?</span>
        <span className="mt-1 block text-xs text-plum-soft">Today&rsquo;s Dedication</span>
        <span className="mt-1 block font-serif text-2xl leading-tight text-plum">{dedication.title}</span>
      </span>
      <ChevronRight size={20} strokeWidth={1.4} className="shrink-0 text-plum-soft" />
    </Link>
  );
}
