/**
 * ============================================================
 *  APP CONFIG: the one file to edit for name, colors, and the 8
 * ============================================================
 *
 * Everything that defines the "feel" of the app lives here:
 *   1. The app name and taglines
 *   2. The color palette (every color in the app comes from here)
 *   3. The 8 dimensions (name, subtitle, icon, accent color)
 *   4. Mood check-in options and reflection prompt sections
 *
 * Change a value, save, and the whole app updates.
 *
 * Icons: use any icon name listed in src/components/Icon.tsx
 * (for example "sun", "heart", "leaf"). Add more there if you like.
 */

// ------------------------------------------------------------
// 1. NAME AND WORDS
// ------------------------------------------------------------
export const brand = {
  /** The app's name. "Rhythm" is a placeholder until the final name is chosen. */
  appName: "Rhythm",
  /** Shorter name shown under the icon on a phone's home screen. */
  shortName: "Rhythm",
  /** The brand this app belongs to. */
  brandName: "Radiate 8",
  company: "Radiate Collective, LLC",
  /** Shown on the opening screen. */
  tagline: "Come back to yourself.",
  /** Gentle triads used as accent lines around the app. */
  triads: ["Reflect, Release, Reach", "Reflect, Bloom, Become"],
  /** Used for browser and search previews. */
  description:
    "Your daily practice companion from Radiate 8. Reflect, Bloom, Become.",
} as const;

// ------------------------------------------------------------
// 2. COLORS
// ------------------------------------------------------------
// Each color becomes a Tailwind class automatically.
// Example: `cream` can be used as bg-cream, text-cream, border-cream.
// Keep the names the same and just change the hex values.
export const colors = {
  /** Page background: warm sand */
  sand: "#EFE3D3",
  /** Lighter sand for gradients */
  sandLight: "#F6EDE1",
  /** Card surface: soft cream */
  cream: "#FBF6EE",
  /** Primary accent: terracotta */
  terracotta: "#C26A4A",
  /** Softer earthy accent: clay */
  clay: "#D49A7A",
  /** Muted rose */
  rose: "#C99A94",
  /** Golden-hour glow */
  gold: "#D8A865",
  /** Main text: deep espresso */
  espresso: "#3B2A22",
  /** Secondary text: softer brown */
  cocoa: "#7A5E50",
  /** Hairlines and dividers */
  line: "#E6D6C3",
} as const;

// ------------------------------------------------------------
// 3. THE 8 DIMENSIONS
// ------------------------------------------------------------
// The order here is the order around the wheel, starting at the top
// and moving clockwise. `id` is used in web addresses and saved data,
// so change names freely but avoid changing an `id` once people use the app.
export const dimensions = [
  {
    id: "career",
    name: "Career",
    subtitle: "Purpose, work, and the mark you make",
    icon: "briefcase",
    accent: "#C26A4A",
  },
  {
    id: "health",
    name: "Health",
    subtitle: "Body, energy, and how you care for you",
    icon: "heart-pulse",
    accent: "#D8A865",
  },
  {
    id: "relationships",
    name: "Relationships and Love",
    subtitle: "The hearts you hold and who holds yours",
    icon: "heart",
    accent: "#C98A8A",
  },
  {
    id: "joy",
    name: "Joy",
    subtitle: "Play, delight, and what lights you up",
    icon: "sun",
    accent: "#E0B35A",
  },
  {
    id: "growth",
    name: "Growth",
    subtitle: "Learning, stretching, and becoming",
    icon: "sprout",
    accent: "#9A9A6A",
  },
  {
    id: "stillness",
    name: "Stillness and Spirit",
    subtitle: "Quiet, faith, and your inner knowing",
    icon: "moon",
    accent: "#A08AA0",
  },
  {
    id: "environment",
    name: "Environment",
    subtitle: "Your home, your spaces, your surroundings",
    icon: "leaf",
    accent: "#8FA38A",
  },
  {
    id: "finances",
    name: "Finances",
    subtitle: "Abundance, ease, and a steady foundation",
    icon: "coins",
    accent: "#B88A5E",
  },
] as const;

/** The type of a single dimension, derived from the list above. */
export type Dimension = (typeof dimensions)[number];
/** One of "career" | "health" | ... */
export type DimensionId = Dimension["id"];

/** Look up a dimension by its id. */
export function getDimension(id: string): Dimension | undefined {
  return dimensions.find((d) => d.id === id);
}

// ------------------------------------------------------------
// 4. MOOD CHECK-IN ("How are you arriving today?")
// ------------------------------------------------------------
export const moods = [
  { id: "tender", label: "Tender", reply: "Go gently with yourself today." },
  { id: "tired", label: "Tired", reply: "Rest is part of the rhythm too." },
  { id: "steady", label: "Steady", reply: "Steady is its own kind of strong." },
  { id: "open", label: "Open", reply: "Beautiful. Let the day meet you." },
  { id: "radiant", label: "Radiant", reply: "Let that light spill over." },
] as const;

export type MoodId = (typeof moods)[number]["id"];

// ------------------------------------------------------------
// 5. REFLECTION SECTIONS (used on each dimension's page)
// ------------------------------------------------------------
export const reflectionSections = [
  { id: "celebrate", title: "Celebrate What Is" },
  { id: "see", title: "See Yourself Clearly" },
  { id: "release", title: "What Gets To Go" },
  { id: "keep", title: "What Gets To Stay" },
  { id: "forward", title: "Looking Forward" },
] as const;
