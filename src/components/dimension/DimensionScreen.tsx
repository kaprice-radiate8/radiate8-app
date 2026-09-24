"use client";

/**
 * DIMENSION SCREEN
 * First version: the dimension's header, its current score, the five
 * reflection sections (writing space arrives in the next build step),
 * and its songs.
 */
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { brand, getDimension, reflectionSections, type DimensionId } from "@/config/app.config";
import { dimensionSongs, getSong } from "@/content/music";
import { useStoreData } from "@/lib/data";
import { Icon } from "../Icon";
import { SongCard } from "../music/SongCard";

export function DimensionScreen({ dimensionId }: { dimensionId: DimensionId }) {
  const d = getDimension(dimensionId)!;
  const { data: scores } = useStoreData((s) => s.getWheelScores());
  const score = scores?.[d.id];
  const songList = dimensionSongs[d.id].map(getSong).filter((s) => s !== undefined);

  return (
    <div>
      <Link href="/wheel" className="-ml-1 inline-flex items-center gap-1 py-2 text-sm text-plum-soft">
        <ChevronLeft size={18} strokeWidth={1.4} /> Wheel
      </Link>

      <header className="relative mt-4 overflow-hidden rounded-[2rem] p-6" style={{ background: `linear-gradient(145deg, ${d.accent}33, ${d.accent}10)` }}>
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-linen/80" style={{ color: d.accent }}>
          <Icon name={d.icon} size={26} />
        </span>
        <h1 className="mt-5 font-serif text-4xl text-plum">{d.name}</h1>
        <p className="mt-2 text-plum-soft">{d.subtitle}</p>
        {score !== undefined && (
          <p className="mt-4 label">
            Feeling {score} of 10 today
          </p>
        )}
      </header>

      <section className="mt-8">
        <p className="label">Reflect</p>
        <p className="mt-1 font-script text-4xl text-plum">{brand.triads[0]}</p>
        <ol className="mt-4 space-y-3">
          {reflectionSections.map((section, i) => (
            <li key={section.id} className="card flex items-center gap-4 p-5">
              <span className="font-serif text-2xl text-plum-soft/50">{i + 1}</span>
              <span className="font-serif text-xl text-plum">{section.title}</span>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-center text-sm text-plum-soft/80">Your writing space for each section opens here soon.</p>
      </section>

      <section className="card mt-8 p-5">
        <p className="label">Songs for {d.name}</p>
        <div className="mt-3 divide-y divide-line/70">
          {songList.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      </section>
    </div>
  );
}
