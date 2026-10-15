"use client";

/**
 * A short list of her intentions, each opening its own page.
 * Used on the intentions home, the Radiate 8, and each dimension.
 */
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { DimensionId } from "@/config/app.config";
import { useStoreData, type Intention } from "@/lib/data";
import { WEEKS_IN_INTENTION, byStatus, cameFullCircle, weekNumber } from "@/lib/intentions";
import { DimensionChips } from "../DimensionChips";

/** Where an intention is, in a few words. */
export function intentionWhen(i: Intention) {
  if (i.status === "reached") return "Reached";
  if (i.status === "resting") return "Resting";
  if (cameFullCircle(i)) return "Come full circle";
  return `Week ${weekNumber(i)} of ${WEEKS_IN_INTENTION}`;
}

export function IntentionCard({ intention }: { intention: Intention }) {
  return (
    <Link href={`/intentions/view?id=${intention.id}`} className={`card flex items-center gap-3 p-5 ${intention.status === "reached" ? "ring-1 ring-gold/50" : ""}`}>
      <span className="min-w-0 flex-1">
        <span className="label block">{intentionWhen(intention)}</span>
        <span className="mt-1.5 block font-serif text-2xl leading-snug text-plum">{intention.title}</span>
        <DimensionChips ids={intention.dimensionIds} className="mt-3" />
      </span>
      <ChevronRight size={18} strokeWidth={1.4} className="shrink-0 text-plum-soft" />
    </Link>
  );
}

/** Her growing intentions (optionally for one dimension). Shows nothing when there are none. */
export function GrowingIntentions({ dimensionId, title = "Your 90-day intentions" }: { dimensionId?: DimensionId; title?: string }) {
  const { data } = useStoreData((s) => s.listIntentions());
  const shown = byStatus(data ?? []).filter((i) => i.status === "growing" && (!dimensionId || i.dimensionIds.includes(dimensionId)));
  if (!shown.length) return null;
  return (
    <section>
      <div className="flex items-baseline justify-between">
        <p className="label">{title}</p>
        <Link href="/intentions" className="text-xs text-plum-soft">
          See all
        </Link>
      </div>
      <ul className="mt-3 space-y-3">
        {shown.map((i) => (
          <li key={i.id}>
            <IntentionCard intention={i} />
          </li>
        ))}
      </ul>
    </section>
  );
}
