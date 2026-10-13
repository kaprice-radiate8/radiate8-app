"use client";

/**
 * DEDICATIONS (web address: /dedications)
 * "Today's Dedication: ten minutes for the life you're becoming."
 * One Dedication offered for today, then a few others to wander into.
 * Quiet and intimate, never a course: no progress, no completing.
 */
import Link from "next/link";
import { Clock } from "lucide-react";
import { getDimension } from "@/config/app.config";
import { dedicationForToday, type Dedication } from "@/lib/content";
import { useToday } from "@/lib/use-today";
import { Artwork } from "../Artwork";
import { useFocus } from "./use-focus";

export function DedicationsHome({ dedications }: { dedications: Dedication[] }) {
  const day = useToday();
  const focus = useFocus();
  const { dedication: today, forDimension } = dedicationForToday(dedications, focus, day);
  if (!today) return null;
  const others = dedications.filter((d) => d.id !== today.id);
  const forName = forDimension ? getDimension(forDimension)?.name : undefined;

  return (
    <div>
      <div className="rise text-center">
        <p className="label">Today&rsquo;s Dedication</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight text-plum">Ten minutes for the life you&rsquo;re becoming</h1>
      </div>

      <Link href={`/dedications/${today.id}`} className="card rise mt-8 block overflow-hidden [animation-delay:150ms]">
        <Artwork colors={today.artworkColors} url={today.artworkUrl} size={null} className="h-44 w-full rounded-none shadow-none" />
        <div className="p-6">
          {forName && <p className="label text-plum-soft">For your {forName}</p>}
          <h2 className="mt-2 font-serif text-4xl leading-tight text-plum">{today.title}</h2>
          <p className="mt-3 font-serif text-xl leading-snug text-plum-soft italic">{today.description}</p>
          <p className="mt-5 flex items-center justify-between text-sm text-plum-soft">
            <span className="flex items-center gap-1.5">
              <Clock size={14} strokeWidth={1.6} aria-hidden="true" /> About {today.durationMinutes} minutes
            </span>
            <span className="font-medium tracking-[0.14em] text-plum uppercase">Begin</span>
          </p>
        </div>
      </Link>

      {others.length > 0 && (
        <section className="mt-10">
          <p className="label">Something to discover</p>
          <ul className="mt-4 space-y-3">
            {others.map((d) => (
              <li key={d.id}>
                <Link href={`/dedications/${d.id}`} className="flex items-center gap-4 rounded-2xl p-1 transition-colors">
                  <Artwork colors={d.artworkColors} url={d.artworkUrl} size={64} />
                  <span className="min-w-0">
                    <span className="block font-serif text-xl leading-tight text-plum">{d.title}</span>
                    <span className="mt-0.5 line-clamp-2 block text-sm leading-snug text-plum-soft">{d.description}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
