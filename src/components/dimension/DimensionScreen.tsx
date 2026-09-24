"use client";

/**
 * DIMENSION SCREEN
 * The dimension's header and current score, its journal (write a new
 * page, then read back every page written here), and its songs.
 */
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { brand, getDimension, type DimensionId } from "@/config/app.config";
import { dimensionSongs, getSong } from "@/content/music";
import { useStoreData } from "@/lib/data";
import { Icon } from "../Icon";
import { JournalComposer } from "../journal/JournalComposer";
import { JournalPages } from "../journal/JournalPages";
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

      {/* The journal: write a new page, then see every page written here */}
      <section className="mt-8">
        <p className="label">Your journal</p>
        <p className="mt-1 mb-5 font-script text-4xl text-plum">{brand.triads[0]}</p>
        <JournalComposer dimension={d} />
      </section>

      <div className="mt-10">
        <JournalPages dimensionId={d.id} />
      </div>

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
