/**
 * Which Daily Activity and which Dedication to offer today.
 * Runs on her phone, so "today" turns over at her own midnight.
 */
import type { DimensionId, FeelingPathId } from "@/config/app.config";
import type { DailyActivity, Dedication, Song } from "./types";

/** Whole days since 1970 in her own time zone, so the choice changes at her midnight. */
export function dayNumber(date = new Date()): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
}

/** One activity per path per day, rotating through what's live. */
export function activityForToday(list: DailyActivity[], path: FeelingPathId, day = dayNumber()) {
  const inPath = list.filter((a) => a.path === path);
  return inPath.length ? inPath[day % inPath.length] : undefined;
}

/**
 * Today's Dedication.
 * - A featured Dedication comes first.
 * - Otherwise, every other day she's offered one tagged to a dimension she's
 *   been focusing on (her Become choices and recent reflections), and on the
 *   other days something to discover, so it never feels like homework.
 */
export function dedicationForToday(list: Dedication[], focus: DimensionId[], day = dayNumber()) {
  const featured = list.filter((d) => d.featured);
  if (featured.length) return { dedication: featured[day % featured.length], forDimension: undefined };

  if (focus.length && day % 2 === 0) {
    const matching = list.filter((d) => d.dimensionTags.some((t) => focus.includes(t)));
    if (matching.length) {
      const dedication = matching[Math.floor(day / 2) % matching.length];
      return { dedication, forDimension: dedication.dimensionTags.find((t) => focus.includes(t)) };
    }
  }
  return { dedication: list.length ? list[day % list.length] : undefined, forDimension: undefined };
}

/** Where to open a song: the chosen links, or a search in each music service. */
export function songLinks(song: Song) {
  const q = encodeURIComponent(`${song.title} ${song.artist}`);
  return [
    { service: "Spotify", href: song.links?.spotify ?? `https://open.spotify.com/search/${q}` },
    { service: "Apple Music", href: song.links?.appleMusic ?? `https://music.apple.com/us/search?term=${q}` },
    { service: "YouTube Music", href: song.links?.youtubeMusic ?? `https://music.youtube.com/search?q=${q}` },
  ];
}
