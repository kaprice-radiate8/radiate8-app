"use client";

/**
 * YOUR BLOOM (web address: /bloom)
 * This season's flower and the ones she has finished, every bouquet she
 * has gathered, and what grows a petal. Nothing here counts what she missed.
 */
import { useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { bloom as rules, type DimensionId } from "@/config/app.config";
import { currentFlower, type Season } from "@/lib/bloom";
import { store } from "@/lib/data";
import { longDate } from "@/lib/dates";
import { Bouquet, Flower } from "./FlowerArt";
import { useBloom } from "./use-bloom";

const grows = [
  { on: rules.grows.reflections, words: "Writing in Reflect, Bloom or Become" },
  { on: rules.grows.assessments, words: "Taking your Radiate 8" },
  { on: rules.grows.dedicationNotes, words: "Writing in a Dedication" },
  { on: rules.grows.dailyActivities, words: "A Daily Activity" },
  { on: rules.grows.livedChoices, words: "Living a Become choice: a gold-edged petal" },
  { on: rules.grows.livedActions, words: "Living one of your actions" },
  { on: rules.grows.milestones, words: "Reaching a milestone or an intention: a gold-edged petal" },
].filter((g) => g.on);

function seasonDates(s: Season) {
  const last = new Date(s.endsAt.getTime() - 86_400_000);
  return `${longDate(s.startsAt.toISOString())} to ${longDate(last.toISOString())}`;
}

export function GardenScreen({ dimensionOf }: { dimensionOf: Record<string, DimensionId | undefined> }) {
  const { bloom, ready } = useBloom(dimensionOf);
  const remembered = useRef(false);
  const gathered = bloom?.seasons.filter((s) => s.finished) ?? [];

  // Seeing this page counts as seeing every petal and bouquet.
  useEffect(() => {
    if (!bloom || remembered.current) return;
    remembered.current = true;
    store.setBloomSeen({ petals: bloom.totalPetals, bouquets: bloom.seasons.filter((s) => s.finished).length }).catch(() => {});
  }, [bloom]);

  if (!ready || !bloom) return null;
  const { season, seen } = bloom;
  const { opening, finished } = currentFlower(season);
  const finishedFlowers = season.flowers.slice(0, finished);
  const newBouquet = gathered.length > seen.bouquets ? gathered.at(-1) : undefined;

  return (
    <div className="space-y-10">
      <Link href="/" className="-ml-1 inline-flex items-center gap-1 py-2 text-sm text-plum-soft">
        <ChevronLeft size={18} strokeWidth={1.4} /> Today
      </Link>

      <h1 className="text-center font-serif text-5xl text-plum">Your bloom</h1>

      {newBouquet && (
        <section className="card rise p-6 text-center">
          <p className="label">Your bouquet is ready</p>
          <h2 className="mt-2 font-serif text-4xl text-plum">Everything you grew</h2>
          <Bouquet flowers={newBouquet.flowers} label="Your bouquet from last season" className="mx-auto mt-2 max-w-[320px]" />
          <p className="font-script text-4xl text-plum">Look at what bloomed.</p>
          <p className="mt-2 text-sm text-plum-soft">{seasonDates(newBouquet)}</p>
        </section>
      )}

      <section className="text-center">
        <p className="label">This season</p>
        <div className="mt-4 flex justify-center">
          <Flower petals={opening} size={240} label={`The flower you're growing: ${opening.length} of ${rules.petalsPerFlower} petals`} />
        </div>
        <p className="mt-2 font-serif text-2xl text-plum">
          {opening.length ? `${opening.length} of ${rules.petalsPerFlower} petals` : season.petals ? "A new flower begins" : "Your first petal is waiting"}
        </p>
        <p className="mt-1 text-sm text-plum-soft">Gathered into a bouquet on {longDate(season.endsAt.toISOString())}</p>
      </section>

      {finishedFlowers.length > 0 && (
        <section>
          <p className="label">Finished this season</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {finishedFlowers.map((f, i) => (
              <li key={i}>
                <Flower petals={f} size={64} slots={false} label={`Finished flower ${i + 1}`} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card p-5">
        <p className="label">What opens a petal</p>
        <ul className="mt-3 space-y-2 text-plum">
          {grows.map((g) => (
            <li key={g.words} className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
              {g.words}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-plum-soft">
          Each petal takes the color of what it&rsquo;s about. Every {rules.petalsPerFlower} petals finish a flower, and every {rules.seasonDays} days your
          flowers are gathered into a bouquet. Petals are never lost.
        </p>
      </section>

      {gathered.length > 0 && (
        <section>
          <p className="label">Your bouquets</p>
          <ul className="mt-3 space-y-4">
            {[...gathered].reverse().map((s) => (
              <li key={s.index} className="card p-5">
                <Bouquet flowers={s.flowers} label={`Your bouquet from ${seasonDates(s)}`} className="mx-auto max-w-[260px]" />
                <p className="text-center font-serif text-xl text-plum">{seasonDates(s)}</p>
                <p className="text-center text-sm text-plum-soft">
                  {s.flowers.length ? `${s.flowers.length} ${s.flowers.length === 1 ? "flower" : "flowers"}` : "A bud, waiting for its season"}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
