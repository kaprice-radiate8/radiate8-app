"use client";

/**
 * DIMENSION SCREEN (web address: /dimension/health, /dimension/joy, ...)
 * Where she placed this dimension in her latest Radiate 8, a way to
 * explore it through Reflect, Bloom, Become, her choices, and her pages.
 */
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getDimension, wordsFor, type DimensionId } from "@/config/app.config";
import { useStoreData } from "@/lib/data";
import { longDate } from "@/lib/dates";
import { Icon } from "../Icon";
import { JournalPages } from "../journal/JournalPages";
import { BecomeChoices } from "../radiate8/BecomeChoices";

export function DimensionScreen({ dimensionId }: { dimensionId: DimensionId }) {
  const d = getDimension(dimensionId)!;
  const { data: assessments } = useStoreData((s) => s.listAssessments());
  const latest = assessments?.[0];
  const note = latest?.notes[d.id];

  return (
    <div className="space-y-8">
      <div>
        <Link href="/radiate8" className="-ml-1 inline-flex items-center gap-1 py-2 text-sm text-plum-soft">
          <ChevronLeft size={18} strokeWidth={1.4} /> Radiate 8
        </Link>

        <header className="mt-4 overflow-hidden rounded-[2rem] bg-linen/80 p-6" style={{ boxShadow: `inset 0 0 0 1px ${d.accent}33` }}>
          <span className="flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: `${d.accent}26`, color: d.accent }}>
            <Icon name={d.icon} size={26} />
          </span>
          <h1 className="mt-5 font-serif text-4xl text-plum">{d.name}</h1>
          <p className="mt-2 text-plum-soft">{d.subtitle}</p>
          {latest && (
            <div className="mt-5 border-t border-line/70 pt-4">
              <p className="label">On {longDate(latest.takenAt)}</p>
              <p className="mt-1 font-serif text-2xl text-plum italic">{wordsFor(latest.places[d.id])}</p>
              {note && <p className="mt-1 text-plum-soft">&ldquo;{note}&rdquo;</p>}
            </div>
          )}
        </header>

        <Link
          href={`/radiate8/explore?d=${d.id}`}
          className="mt-4 flex w-full items-center justify-center rounded-full bg-plum px-6 py-3.5 text-sm font-medium tracking-[0.14em] text-ivory uppercase transition-all active:scale-[0.98]"
        >
          Explore {d.name}
        </Link>
      </div>

      <BecomeChoices dimensionId={d.id} />
      <JournalPages dimensionId={d.id} />
    </div>
  );
}
