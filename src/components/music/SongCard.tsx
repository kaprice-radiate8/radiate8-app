"use client";

/**
 * SONG CARD
 * Cover art, title, artist, and a play button.
 * `featured` makes it the large "Today's Dedication" version.
 */
import { Pause, Play } from "lucide-react";
import type { Song } from "@/content/music";
import { useAudio } from "./AudioProvider";
import { CoverArt } from "./CoverArt";

export function SongCard({ song, featured = false, eyebrow }: { song: Song; featured?: boolean; eyebrow?: string }) {
  const { toggle, isPlaying, currentSong, progress } = useAudio();
  const playing = isPlaying(song.id);
  const showProgress = currentSong?.id === song.id;

  return (
    <div className={featured ? "card p-5" : "py-2"}>
      {eyebrow && <p className="label mb-4">{eyebrow}</p>}
      <div className="flex items-center gap-4">
        <CoverArt colors={song.cover} size={featured ? 84 : 56} spinning={playing} />
        <div className="min-w-0 flex-1">
          <p className={`truncate font-serif text-espresso ${featured ? "text-2xl leading-tight" : "text-lg"}`}>{song.title}</p>
          <p className="truncate text-sm text-cocoa">{song.artist}</p>
        </div>
        <button
          type="button"
          onClick={() => toggle(song)}
          aria-label={playing ? `Pause ${song.title}` : `Play ${song.title}`}
          className={`flex shrink-0 items-center justify-center rounded-full bg-terracotta text-cream shadow-md transition-transform duration-300 active:scale-95 ${featured ? "h-14 w-14" : "h-11 w-11"}`}
        >
          {playing ? <Pause size={featured ? 22 : 18} fill="currentColor" /> : <Play size={featured ? 22 : 18} fill="currentColor" className="ml-0.5" />}
        </button>
      </div>
      {featured && (
        <div className="mt-5 h-[3px] overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-terracotta/80 transition-[width] duration-300 ease-linear" style={{ width: `${showProgress ? progress * 100 : 0}%` }} />
        </div>
      )}
    </div>
  );
}
