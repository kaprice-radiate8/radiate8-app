"use client";

/**
 * HER FLOWER, ON TODAY
 * The flower she's growing this season. New petals open as she arrives;
 * a finished flower and a gathered bouquet each get one quiet moment.
 */
import { useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { bloom as rules, type DimensionId } from "@/config/app.config";
import { currentFlower } from "@/lib/bloom";
import { store } from "@/lib/data";
import { longDate } from "@/lib/dates";
import { Bouquet, Flower } from "./FlowerArt";
import { useBloom } from "./use-bloom";

export function BloomCard({ dimensionOf }: { dimensionOf: Record<string, DimensionId | undefined> }) {
  const { bloom, ready } = useBloom(dimensionOf);
  const remembered = useRef(false);

  // Remember what she has now seen, once per visit, so these petals don't grow again.
  useEffect(() => {
    if (!bloom || remembered.current) return;
    remembered.current = true;
    store.setBloomSeen({ ...bloom.seen, petals: bloom.totalPetals }).catch(() => {});
  }, [bloom]);

  if (!ready || !bloom) return null;
  const { season, seasons, seen, totalPetals } = bloom;
  const gathered = seasons.filter((s) => s.finished);

  // A season just ended and she hasn't seen its bouquet yet.
  if (gathered.length > seen.bouquets) {
    const last = gathered.at(-1)!;
    return (
      <Link href="/bloom" className="card block overflow-hidden p-5">
        <p className="label">Your bloom</p>
        <h2 className="mt-2 font-serif text-3xl text-plum">Your bouquet is ready</h2>
        <Bouquet flowers={last.flowers} label="Your bouquet from last season" className="mx-auto mt-2 max-w-[280px]" />
        <p className="flex items-center justify-between text-sm text-plum-soft">
          <span>Everything you grew these 90 days</span>
          <ChevronRight size={18} strokeWidth={1.4} />
        </p>
      </Link>
    );
  }

  const { opening, finished } = currentFlower(season);
  const newPetals = Math.max(0, totalPetals - seen.petals);
  // Her last petal just filled a flower: show it full, once, before the next begins.
  const justFinished = newPetals > 0 && opening.length === 0 && finished > 0;
  const shown = justFinished ? season.flowers.at(-1)! : opening;
  const freshFrom = Math.max(0, shown.length - newPetals);

  return (
    <Link href="/bloom" className="card flex items-center gap-5 p-5">
      <Flower petals={shown} size={112} freshFrom={freshFrom} label={`Your flower: ${shown.length} of ${rules.petalsPerFlower} petals`} />
      <span className="min-w-0 flex-1">
        <span className="label block">Your bloom</span>
        {justFinished ? (
          <span className="rise mt-2 block font-script text-3xl leading-tight text-plum">A flower is finished.</span>
        ) : (
          <span className="mt-2 block font-serif text-2xl leading-tight text-plum">
            {season.petals === 0 ? "Your first petal is waiting" : opening.length ? `${opening.length} of ${rules.petalsPerFlower} petals` : "A new flower begins"}
          </span>
        )}
        <span className="mt-1 block text-sm leading-snug text-plum-soft">
          {finished > 0
            ? `${finished} ${finished === 1 ? "flower" : "flowers"} finished this season`
            : season.petals === 0
              ? "Each reflection opens one."
              : `Gathered into a bouquet on ${longDate(season.endsAt.toISOString())}`}
        </span>
      </span>
      <ChevronRight size={20} strokeWidth={1.4} className="shrink-0 text-plum-soft" />
    </Link>
  );
}
