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
  /**
   * The name shown in the app. The brand guide says to use "Radiate 8" in
   * public-facing copy while the app name is still being chosen
   * (working options: Rhythm 8, Rhythm, Becoming).
   */
  appName: "Radiate 8",
  /** Shorter name shown under the icon on a phone's home screen. */
  shortName: "Radiate 8",
  /** The brand this app belongs to. */
  brandName: "Radiate 8",
  company: "Radiate Collective, LLC",
  /** Shown on the opening screen. */
  tagline: "Come back to yourself.",
  /** The brand promise. */
  promise: "The art of becoming fully alive.",
  /** The Radiate 8 method, used as the handwritten accent line. */
  triads: ["Reflect. Bloom. Become."],
  /** Used for browser and search previews. */
  description:
    "Your daily practice companion from Radiate 8. Reflect. Bloom. Become.",
} as const;

// ------------------------------------------------------------
// 2. COLORS
// ------------------------------------------------------------
// Each color becomes a Tailwind class automatically.
// Example: `plum` can be used as bg-plum, text-plum, border-plum.
// Keep the names the same and just change the hex values.
// Main and secondary colors come straight from the Radiate 8 brand guide.
// Brand readability rule: plum for text, gold and taupe for decoration only.
export const colors = {
  // Main palette
  /** Plum: wordmarks, text, buttons, and dark surfaces */
  plum: "#4B304A",
  /** Gold: arcs, dots, and signature details (decorative, not for small text) */
  gold: "#C18D4A",
  /** Ivory: primary background and text on plum */
  ivory: "#F4E7D8",

  // Secondary palette
  /** Blush: quiet cards, gentle highlights, and the pale numeral 8 */
  blush: "#E8D2CD",
  /** Taupe: supporting surfaces, fine dividers, neutral details */
  taupe: "#B8A999",

  // Supporting tints, made from the colors above
  /** Softer plum for secondary text (still easy to read on ivory) */
  plumSoft: "#6E5569",
  /** Lighter ivory for gentle gradients and chips */
  ivoryLight: "#F9F1E7",
  /** Linen: card surfaces that float over the ivory background */
  linen: "#FCF8F2",
  /** Hairlines and dividers (a pale taupe) */
  line: "#E4D6C8",
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
    accent: "#7B5A78",
  },
  {
    id: "health",
    name: "Health",
    subtitle: "Body, energy, and how you care for you",
    icon: "heart-pulse",
    accent: "#A9B39A",
  },
  {
    id: "relationships",
    name: "Relationships and Love",
    subtitle: "The hearts you hold and who holds yours",
    icon: "heart",
    accent: "#C99199",
  },
  {
    id: "joy",
    name: "Joy",
    subtitle: "Play, delight, and what lights you up",
    icon: "sun",
    accent: "#D3A45C",
  },
  {
    id: "growth",
    name: "Growth",
    subtitle: "Learning, stretching, and becoming",
    icon: "sprout",
    accent: "#8E9C7C",
  },
  {
    id: "stillness",
    name: "Stillness and Spirit",
    subtitle: "Quiet, faith, and your inner knowing",
    icon: "moon",
    accent: "#9A86A6",
  },
  {
    id: "environment",
    name: "Environment",
    subtitle: "Your home, your spaces, your surroundings",
    icon: "leaf",
    accent: "#93AAAA",
  },
  {
    id: "finances",
    name: "Finances",
    subtitle: "Abundance, ease, and a steady foundation",
    icon: "coins",
    accent: "#A88B6C",
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
  { id: "calm", label: "Calm", icon: "flower", reply: "Let that ease travel with you." },
  { id: "hopeful", label: "Hopeful", icon: "sun", reply: "Beautiful. Let the day meet you." },
  { id: "tender", label: "Tender", icon: "heart", reply: "Go gently with yourself today." },
  { id: "tired", label: "Tired", icon: "moon", reply: "Rest is part of the rhythm too." },
  { id: "full", label: "Full", icon: "sparkles", reply: "Let that light spill over." },
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
