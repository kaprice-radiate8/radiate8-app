"use client";

/**
 * DAILY ACTIVITY (web address: /activity)
 * "How do you want to feel?" Two paths, each leading to today's
 * activity for that path. She can also browse and pick her own.
 */
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { feelingPaths } from "@/config/app.config";
import { activityForToday, type DailyActivity } from "@/lib/content";
import { useToday } from "@/lib/use-today";
import { Icon } from "../Icon";

export function FeelingChooser({ activities }: { activities: DailyActivity[] }) {
  const day = useToday();

  return (
    <div>
      <p className="label">Daily Activity</p>
      <h1 className="mt-3 font-serif text-5xl leading-tight text-plum">How do you want to feel?</h1>
      <p className="mt-3 text-plum-soft">A few minutes of body, breath and music to shift how you feel right now.</p>

      <ul className="mt-6 space-y-3">
        {feelingPaths.map((p, i) => {
          const today = activityForToday(activities, p.id, day);
          if (!today) return null;
          return (
            <li key={p.id} className="rise" style={{ animationDelay: `${i * 120}ms` }}>
              <Link href={`/activity/${today.id}`} className="card flex items-center gap-4 p-5 transition-transform active:scale-[0.99]">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blush/70 text-plum">
                  <Icon name={p.icon} size={24} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-serif text-3xl leading-tight text-plum">{p.label}</span>
                  <span className="mt-1 block text-sm leading-snug text-plum-soft">{p.line}</span>
                </span>
                <ChevronRight size={20} strokeWidth={1.4} className="shrink-0 text-plum-soft" />
              </Link>
            </li>
          );
        })}
      </ul>

      {feelingPaths.map((p) => (
        <section key={p.id} className="mt-10">
          <p className="label">Or choose · {p.label}</p>
          <ul className="mt-3 divide-y divide-line/70">
            {activities
              .filter((a) => a.path === p.id)
              .map((a) => (
                <li key={a.id}>
                  <Link href={`/activity/${a.id}`} className="flex items-baseline justify-between gap-4 py-3">
                    <span>
                      <span className="block font-serif text-xl text-plum">{a.title}</span>
                      <span className="block text-sm text-plum-soft">{a.purpose}</span>
                    </span>
                    <span className="shrink-0 text-xs text-plum-soft">{a.durationMinutes} min</span>
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
