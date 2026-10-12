"use client";

/**
 * RADIATE 8 HOME (web address: /radiate8)
 * Her latest Radiate 8, what she noticed, where she can go next,
 * her Become choices, and every past reflection.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { dimensions, wordsFor } from "@/config/app.config";
import { useStoreData } from "@/lib/data";
import { longDate } from "@/lib/dates";
import { Icon } from "../Icon";
import { Wheel } from "../wheel/Wheel";
import { BecomeChoices } from "./BecomeChoices";

const primaryLink =
  "flex w-full items-center justify-center rounded-full bg-plum px-6 py-3.5 text-sm font-medium tracking-[0.14em] text-ivory uppercase transition-all active:scale-[0.98]";
const quietLink =
  "flex flex-1 items-center justify-center rounded-full border border-line bg-linen/70 px-4 py-3 text-sm text-plum transition-colors hover:border-taupe";

export function Radiate8Home() {
  const router = useRouter();
  const { data: assessments, ready } = useStoreData((s) => s.listAssessments());
  if (!ready) return null;

  // Nothing yet: a gentle invitation to the first one.
  if (!assessments?.length) {
    return (
      <div className="text-center">
        <p className="label">The Radiate 8</p>
        <h1 className="mt-3 font-serif text-4xl text-plum">Where are you today?</h1>
        <p className="mx-auto mt-3 max-w-xs text-plum-soft">Eight dimensions of a flourishing life. Notice where you are, not where you should be.</p>
        <div className="mx-auto mt-6 w-full max-w-[300px]">
          <Wheel scores={{}} decorative />
        </div>
        <Link href="/radiate8/assess" className={`${primaryLink} mt-6`}>
          Begin your Radiate 8
        </Link>
      </div>
    );
  }

  const latest = assessments[0];

  return (
    <div className="space-y-8">
      <header className="text-center">
        <p className="label">The Radiate 8</p>
        <h1 className="mt-2 font-serif text-4xl text-plum">Your Radiate 8</h1>
        <p className="mt-2 text-sm text-plum-soft">From {longDate(latest.takenAt)}</p>
        <div className="mx-auto mt-4 w-full max-w-[360px]">
          <Wheel scores={latest.places} onSelect={(id) => router.push(`/dimension/${id}`)} />
        </div>
      </header>

      {latest.noticing && (
        <section className="card p-5">
          <p className="label">What you noticed</p>
          <p className="mt-2 font-serif text-xl leading-snug whitespace-pre-wrap text-plum italic">{latest.noticing}</p>
        </section>
      )}

      <section className="space-y-3">
        <Link href="/radiate8/explore" className={primaryLink}>
          Reflect, Bloom, Become
        </Link>
        <div className="flex gap-3">
          <Link href="/radiate8/assess" className={quietLink}>
            Reflect again
          </Link>
          {assessments.length > 1 && (
            <Link href="/radiate8/compare" className={quietLink}>
              See what&rsquo;s changed
            </Link>
          )}
        </div>
      </section>

      {/* The eight, in words: tap one to open its pages and choices */}
      <section>
        <p className="label">Where you are</p>
        <ul className="card mt-3 divide-y divide-line/70 px-5 py-1">
          {dimensions.map((d) => (
            <li key={d.id}>
              <Link href={`/dimension/${d.id}`} className="flex items-center gap-3 py-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${d.accent}22`, color: d.accent }}>
                  <Icon name={d.icon} size={17} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-serif text-lg leading-tight text-plum">{d.name}</span>
                  <span className="block text-sm text-plum-soft italic">{wordsFor(latest.places[d.id])}</span>
                </span>
                <ChevronRight size={18} strokeWidth={1.4} className="text-plum-soft" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <BecomeChoices empty="When you reach Become, the choices you make will gather here." />

      {assessments.length > 1 && (
        <section>
          <p className="label">Past reflections</p>
          <ul className="mt-3 space-y-2">
            {assessments.slice(1).map((a) => (
              <li key={a.id}>
                <Link href={`/radiate8/compare?with=${a.id}`} className="card flex items-center justify-between gap-3 px-5 py-4">
                  <span className="min-w-0">
                    <span className="block font-serif text-lg text-plum">{longDate(a.takenAt)}</span>
                    {a.noticing && <span className="block truncate text-sm text-plum-soft italic">{a.noticing}</span>}
                  </span>
                  <span className="shrink-0 text-xs text-plum-soft">Compare</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
