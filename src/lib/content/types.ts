/**
 * CONTENT MODEL: Daily Activities and Dedications
 *
 * These shapes are written so an admin/content system can manage them
 * later without code changes. Each field maps to a field the brief asks
 * for, and to a column in the planned tables (see docs/content-model.md).
 *
 * Today the records live in src/content/activities.ts and
 * src/content/dedications.ts. When the admin system arrives, a new
 * ContentSource reads them from there instead (see ./source.ts).
 */
import type { DimensionId, FeelingPathId } from "@/config/app.config";

/** Everything published shares these: on/off, when it appears, and its tags. */
type Publishable = {
  /** Stable id, used in web addresses and saved history. Never change it once live. */
  id: string;
  /** Hidden from women when false (a draft, or retired). */
  active: boolean;
  /** "YYYY-MM-DD". Not shown before this day. */
  publishOn: string;
  /** Radiate 8 dimensions this speaks to (may be empty). Used for personalization. */
  dimensionTags: DimensionId[];
  /** Two colors for soft watercolor-style artwork until real artwork exists. */
  artworkColors: [string, string];
  /** Real artwork, when there is some (an image URL). */
  artworkUrl?: string;
};

/**
 * A song paired with an activity.
 * Commercial songs are never stored in the app: she opens them in her own
 * music service. `audioUrl` is only for music Radiate has the rights to
 * (for example, original music from Radiate artists).
 */
export type Song = {
  title: string;
  artist: string;
  /** Direct links, when chosen. Without them, the app links to a search for the song. */
  links?: { spotify?: string; appleMusic?: string; youtubeMusic?: string };
  /** Licensed or original audio Radiate may play directly. */
  audioUrl?: string;
};

/** DAILY ACTIVITY: about 30 seconds to 5 minutes to shift how she feels. */
export type DailyActivity = Publishable & {
  title: string;
  /** Which path it belongs to: Rev Up or Calm / Reset (working names). */
  path: FeelingPathId;
  /** One line: what this helps her feel. */
  purpose: string;
  /** The movement or practice, in a few words ("Shoulder rolls with slow breath"). */
  practice: string;
  durationMinutes: number;
  /** Short steps she can read, or hear read aloud. */
  guidance: string[];
  /** Recorded spoken guidance, when it exists. Otherwise the phone can read the steps aloud. */
  guidanceAudioUrl?: string;
  song: Song;
  /** The light question at the end ("What shifted?"). No writing required. */
  notice: string;
};

/** DEDICATION: about ten minutes for her own becoming. */
export type Dedication = Publishable & {
  title: string;
  /** One or two lines shown before she begins. */
  description: string;
  durationMinutes: number;
  /** The written piece, one paragraph per item. */
  body: string[];
  /** An optional practice inside the Dedication. */
  practice?: { title: string; steps: string[] };
  /** The question she leaves with. */
  reflection: string;
  /** Optional invitation to write. Never required. */
  journalPrompt?: string;
  /** Who it's from (Radiate, or a guest expert). */
  author: string;
  audioUrl?: string;
  videoUrl?: string;
  /** Themes that cross dimensions ("rest", "home", "childhood"). */
  themeTags: string[];
  /** Featured Dedications are offered first as Today's Dedication. */
  featured: boolean;
};
