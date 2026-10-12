/**
 * MUSIC CONTENT
 *
 * Placeholder songs for now. To add a real song later:
 *   1. Put the audio file in public/audio/ (or use a streaming link)
 *   2. Add an entry to `songs` below
 *   3. Add its id to the dedication rotation below
 *
 * `cover` is a pair of colors used to paint soft gradient cover art,
 * so no image files are needed until real artwork exists.
 */
export type Song = {
  id: string;
  title: string;
  artist: string;
  src: string;
  /** Two colors blended into gentle cover art */
  cover: [string, string];
};

export const songs: Song[] = [
  {
    id: "golden-hour",
    title: "Golden Hour Homecoming",
    artist: "Placeholder Artist",
    src: "/audio/golden-hour.wav",
    cover: ["#E3BC85", "#C18D4A"],
  },
  {
    id: "morning-tide",
    title: "Morning Tide",
    artist: "Placeholder Artist",
    src: "/audio/morning-tide.wav",
    cover: ["#EAD9CF", "#B8A999"],
  },
  {
    id: "still-water",
    title: "Still Water",
    artist: "Placeholder Artist",
    src: "/audio/still-water.wav",
    cover: ["#E8D2CD", "#8E6F8B"],
  },
];

export function getSong(id: string): Song | undefined {
  return songs.find((s) => s.id === id);
}

/**
 * Today's Dedication rotates through this list, one song per day.
 * Later this can come from the backend so it can be set for everyone.
 */
const dedicationRotation = ["golden-hour", "morning-tide", "still-water"];

export function getTodaysDedication(date = new Date()): Song {
  const dayNumber = Math.floor(date.getTime() / 86_400_000);
  const id = dedicationRotation[dayNumber % dedicationRotation.length];
  return getSong(id) ?? songs[0];
}
