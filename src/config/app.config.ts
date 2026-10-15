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
// 3. THE RADIATE 8 (names and order from the Radiate build brief)
// ------------------------------------------------------------
// The order here is the order around the wheel, starting at the top
// and moving clockwise. `id` is used in web addresses and saved data:
// rename freely, but never change an `id` once women are using the app.
export const dimensions = [
  {
    id: "health",
    name: "Health & Body",
    subtitle: "Energy, rest, movement, and how you care for your body",
    /** How this dimension reads inside a sentence. */
    phrase: "your health and body",
    icon: "heart-pulse",
    accent: "#A9B39A",
  },
  {
    id: "relationships",
    name: "Relationships & Love",
    subtitle: "The hearts you hold, and the ones who hold yours",
    phrase: "love and your relationships",
    icon: "heart",
    accent: "#C99199",
  },
  {
    id: "career",
    name: "Career & Purpose",
    subtitle: "Your work, your calling, and the mark you make",
    phrase: "your career and purpose",
    icon: "briefcase",
    accent: "#7B5A78",
  },
  {
    id: "finance",
    name: "Finance",
    subtitle: "Abundance, ease, and a steady foundation",
    phrase: "your finances",
    icon: "coins",
    accent: "#A88B6C",
  },
  {
    // Not nature or sustainability: her home, her spaces, and the people around her.
    id: "environment",
    name: "Environment",
    subtitle: "Your home, your spaces, your community, and the people around you",
    phrase: "your home and surroundings",
    icon: "house",
    accent: "#93AAAA",
  },
  {
    id: "growth",
    name: "Growth",
    subtitle: "Learning, stretching, and becoming",
    phrase: "your growth",
    icon: "sprout",
    accent: "#8E9C7C",
  },
  {
    id: "joy",
    name: "Joy",
    subtitle: "Play, delight, and what lights you up",
    phrase: "joy",
    icon: "sun",
    accent: "#D3A45C",
  },
  {
    id: "spirit",
    name: "Spirit",
    subtitle: "Faith, purpose, inner peace, intuition, and meaning",
    phrase: "your spirit",
    icon: "flame",
    accent: "#9A86A6",
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
// 5. REFLECT → BLOOM → BECOME
// ------------------------------------------------------------
// The three movements of the Radiate method. Their prompts live in
// src/content/prompts.ts
export const movements = [
  { id: "reflect", title: "Reflect", question: "Where am I now?" },
  { id: "bloom", title: "Bloom", question: "What do I want?" },
  { id: "become", title: "Become", question: "What will I choose?" },
] as const;

export type MovementId = (typeof movements)[number]["id"];

// ------------------------------------------------------------
// 5b. DAILY ACTIVITY: "How do you want to feel?"
// ------------------------------------------------------------
// The two paths into a Daily Activity. The labels are WORKING NAMES,
// not approved branding: change `label` and `line` here freely.
// The `id` is saved with each activity, so keep it as it is.
export const feelingPaths = [
  {
    id: "energize",
    label: "Rev Up",
    line: "Wake up, move, and feel bright and confident",
    icon: "sun",
  },
  {
    id: "settle",
    label: "Calm / Reset",
    line: "Slow down, breathe, and feel steady again",
    icon: "waves",
  },
] as const;

export type FeelingPathId = (typeof feelingPaths)[number]["id"];

export function getFeelingPath(id: string) {
  return feelingPaths.find((p) => p.id === id);
}

// ------------------------------------------------------------
// 5c. HER BLOOM: petals, flowers and 90-day bouquets
// ------------------------------------------------------------
// Each thing she does that grows a petal adds one to her current flower.
// When a flower has all its petals, it's finished and a new one begins.
// At the end of each season, every flower is gathered into a bouquet.
// Petals are never lost: nothing wilts, shrinks or resets.
export const bloom = {
  petalsPerFlower: 8,
  seasonDays: 90,
  /** What grows a petal. Daily Activities are off for now; set to true to count them. */
  grows: {
    reflections: true, // Reflect, Bloom or Become writing
    assessments: true, // a Radiate 8
    dedicationNotes: true, // writing in a Dedication
    livedChoices: true, // a Become choice marked as lived: a gold-edged petal
    livedActions: true, // a weekly action, or today's one meaningful action, lived
    milestones: true, // a milestone or a whole 90-day intention reached: a gold-edged petal
    dailyActivities: false,
  },
} as const;

// ------------------------------------------------------------
// 5d. 90-DAY INTENTIONS (the goal planner)
// ------------------------------------------------------------
// When a Become choice is ready to be lived, she can shape it into a
// 90-day intention, with a few milestones and small weekly actions.
// Today then offers "one meaningful action". These are suggestions for the
// screens, never limits: she can always add more.
export const intentions = {
  days: 90,
  /** The planner gently mentions this many as a comfortable number to hold at once. */
  comfortableIntentions: 3,
  /** How many milestones and first actions the planting flow asks for. */
  milestonesAtPlanting: 3,
  actionsAtPlanting: 3,
} as const;

// ------------------------------------------------------------
// 6. HOW THE RADIATE 8 DESCRIBES WHERE SHE IS
// ------------------------------------------------------------
// The assessment is saved on a 0 to 10 scale so changes can be compared
// over time, but she only ever sees these words, never a number.
export const placeWords = [
  { upTo: 2, words: "Asking for tenderness" },
  { upTo: 4, words: "Quietly waiting" },
  { upTo: 6, words: "Finding its footing" },
  { upTo: 8, words: "Growing warm" },
  { upTo: 10, words: "Radiant" },
] as const;

/** The gentle words for a place on the scale. */
export function wordsFor(value: number): string {
  return (placeWords.find((p) => value <= p.upTo) ?? placeWords[placeWords.length - 1]).words;
}
