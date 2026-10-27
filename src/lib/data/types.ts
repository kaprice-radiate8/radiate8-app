/**
 * DATA SHAPES
 *
 * These describe every piece of information the app saves.
 * They stay the same whether data lives in the browser (today)
 * or in Supabase (later).
 */
import type { DimensionId, MoodId, MovementId } from "@/config/app.config";

/** The person using the app. */
export type Profile = {
  name: string;
  /** Set once onboarding is finished. */
  onboardedAt: string | null;
};

/** One daily "How are you arriving today?" answer. */
export type MoodEntry = {
  /** Calendar day, like "2026-09-24" */
  date: string;
  moodId: MoodId;
  at: string;
};

/**
 * One Radiate 8 assessment, saved with its date so it can be compared later.
 * Places are 0 to 10 behind the scenes; she only ever sees words.
 */
export type Assessment = {
  id: string;
  takenAt: string;
  places: Record<DimensionId, number>;
  /** A few words she added for a dimension, if any. */
  notes: Partial<Record<DimensionId, string>>;
  /** Her answer to "What do you notice?" */
  noticing: string;
};

export type NewAssessment = Omit<Assessment, "id" | "takenAt">;

/** One page of writing in Reflect, Bloom or Become. */
export type JournalEntry = {
  id: string;
  /** The dimensions she was exploring (one or more). */
  dimensionIds: DimensionId[];
  movement: MovementId;
  /** The question that was showing, kept so the page reads well later */
  prompt: string;
  text: string;
  createdAt: string;
  updatedAt: string;
};

export type NewJournalEntry = Pick<JournalEntry, "dimensionIds" | "movement" | "prompt" | "text">;

/**
 * Something she chose to live, from the Become movement.
 * Shown back to her gently: no deadlines, no checkmarks, no reminders.
 */
export type BecomeChoice = {
  id: string;
  dimensionIds: DimensionId[];
  text: string;
  createdAt: string;
  updatedAt: string;
  /** When she marked it as lived (a goal reached). Grows a gold-edged petal. */
  livedAt?: string | null;
};

export type NewBecomeChoice = Pick<BecomeChoice, "dimensionIds" | "text">;

/**
 * THE CONTRACT
 * Any storage (browser, Supabase, anything else) must provide these functions.
 * Every function returns a Promise so a network backend fits without changes.
 *
 * Saving functions must reject with a SaveError (see errors.ts) when the data
 * was not saved, so screens never say "Saved" when it wasn't.
 */
/**
 * A Daily Activity she finished, and, if she chose to say, how she feels now.
 * Kept for her own history and future Progress Stories. Never used for streaks.
 */
export type ActivityLog = {
  id: string;
  activityId: string;
  felt: string | null;
  at: string;
};

export type NewActivityLog = Pick<ActivityLog, "activityId" | "felt">;

/** What she chose to write during a Dedication (always optional). */
export type DedicationNote = {
  id: string;
  dedicationId: string;
  text: string;
  createdAt: string;
};

export type NewDedicationNote = Pick<DedicationNote, "dedicationId" | "text">;

/** What her bloom looked like the last time she saw it, so new petals can grow in. */
export type BloomSeen = {
  petals: number;
  /** How many finished 90-day bouquets she has already been shown. */
  bouquets: number;
};

// ---- 90-day intentions, milestones, weekly and daily actions ----
//
// Become choices are her words; an intention is a choice she has decided to
// shape into 90 days. Everything here counts what she lived, never what she
// missed: nothing is overdue, nothing turns red, nothing resets.

/**
 * growing: she's living it now. resting: set down for a while, by her choice.
 * reached: she says she arrived. (Letting an intention go deletes it.)
 */
export type IntentionStatus = "growing" | "resting" | "reached";

/** A 90-day intention (the brief's "90-day goal"). */
export type Intention = {
  id: string;
  title: string;
  /** Why it matters to her: the vision behind it, in her words. May be empty. */
  vision: string;
  dimensionIds: DimensionId[];
  /** The Become choice it grew from, if any. */
  becomeChoiceId: string | null;
  /** Calendar days, like "2026-10-15". Her season is 90 days from `startsOn`. */
  startsOn: string;
  endsOn: string;
  status: IntentionStatus;
  reachedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NewIntention = Pick<Intention, "title" | "vision" | "dimensionIds" | "becomeChoiceId">;
export type IntentionChanges = Partial<Pick<Intention, "title" | "vision" | "dimensionIds" | "status">>;

/** A sign she's on her way. Reaching one opens a gold-edged petal. */
export type Milestone = {
  id: string;
  intentionId: string;
  title: string;
  reachedAt: string | null;
  createdAt: string;
};

/** A small thing she'd like to do in a given week, toward an intention. */
export type WeeklyAction = {
  id: string;
  intentionId: string;
  title: string;
  /** The Monday that starts its week, like "2026-10-12". */
  weekOf: string;
  livedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NewWeeklyAction = Pick<WeeklyAction, "intentionId" | "title" | "weekOf">;

/** Today's one meaningful action: one of her weekly actions, or her own words. */
export type DailyAction = {
  /** Calendar day, like "2026-10-15" (one per day). */
  date: string;
  text: string;
  /** Set when she chose one of her weekly actions. */
  weeklyActionId: string | null;
  intentionId: string | null;
  livedAt: string | null;
  at: string;
};

export type NewDailyAction = Pick<DailyAction, "text" | "weeklyActionId" | "intentionId">;

// ---- Vision board ----

/**
 * One item on her vision board: an image or a few words, perhaps tagged with
 * a dimension, perhaps linked to one of her 90-day intentions.
 */
export type VisionItem = {
  id: string;
  kind: "image" | "words";
  /** Where to show the image from (a private, short-lived link). Null for words. */
  imageUrl: string | null;
  /** The words: the whole item for a words item, a caption for an image. */
  words: string;
  dimensionId: DimensionId | null;
  intentionId: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
};

export type NewVisionItem = Pick<VisionItem, "words" | "dimensionId">;
export type VisionItemChanges = Partial<Pick<VisionItem, "words" | "dimensionId" | "intentionId">>;

/** A photo ready to save: already resized, with location data removed (see lib/images.ts). */
export type PreparedImage = { blob: Blob; width: number; height: number };

export interface DataStore {
  getProfile(): Promise<Profile>;
  saveProfile(profile: Profile): Promise<void>;

  getMood(date: string): Promise<MoodEntry | null>;
  setMood(date: string, moodId: MoodEntry["moodId"]): Promise<void>;

  /** Assessments, newest first. */
  listAssessments(): Promise<Assessment[]>;
  addAssessment(assessment: NewAssessment): Promise<Assessment>;
  deleteAssessment(id: string): Promise<void>;

  /** Journal pages, newest first. Pass a dimension to see only pages that include it. */
  listJournal(dimensionId?: DimensionId): Promise<JournalEntry[]>;
  addJournalEntry(entry: NewJournalEntry): Promise<JournalEntry>;
  updateJournalEntry(id: string, text: string): Promise<void>;
  deleteJournalEntry(id: string): Promise<void>;

  /** Become choices, newest first. Pass a dimension to see only choices that include it. */
  listBecomeChoices(dimensionId?: DimensionId): Promise<BecomeChoice[]>;
  addBecomeChoice(choice: NewBecomeChoice): Promise<BecomeChoice>;
  updateBecomeChoice(id: string, text: string): Promise<void>;
  deleteBecomeChoice(id: string): Promise<void>;
  /** Mark a Become choice as lived (or not yet). */
  setBecomeChoiceLived(id: string, lived: boolean): Promise<void>;

  /** Unfinished writing, kept safe while typing. `key` identifies the page being written. */
  listActivityLog(): Promise<ActivityLog[]>;
  logActivity(log: NewActivityLog): Promise<ActivityLog>;

  listDedicationNotes(dedicationId?: string): Promise<DedicationNote[]>;
  addDedicationNote(note: NewDedicationNote): Promise<DedicationNote>;

  /** Her intentions, newest first. */
  listIntentions(): Promise<Intention[]>;
  /** Plant an intention with its first milestones and this week's first actions, all at once. */
  addIntention(intention: NewIntention, milestones: string[], firstActions: { title: string; weekOf: string }[]): Promise<Intention>;
  updateIntention(id: string, changes: IntentionChanges): Promise<void>;
  /** Begin a fresh 90 days for the same intention, from `startsOn`. */
  renewIntention(id: string, startsOn: string): Promise<void>;
  /** Let it go: removes the intention, its milestones and its weekly actions. */
  deleteIntention(id: string): Promise<void>;

  /** Milestones, in the order she added them. */
  listMilestones(intentionId?: string): Promise<Milestone[]>;
  addMilestone(intentionId: string, title: string): Promise<Milestone>;
  setMilestoneReached(id: string, reached: boolean): Promise<void>;
  deleteMilestone(id: string): Promise<void>;

  /** Weekly actions, oldest first. */
  listWeeklyActions(intentionId?: string): Promise<WeeklyAction[]>;
  addWeeklyAction(action: NewWeeklyAction): Promise<WeeklyAction>;
  /** Mark lived (or not yet). Also updates today's one action if it is this one. */
  setWeeklyActionLived(id: string, lived: boolean): Promise<void>;
  /** Bring an action into another week (used to carry one forward). */
  moveWeeklyAction(id: string, weekOf: string): Promise<void>;
  deleteWeeklyAction(id: string): Promise<void>;

  /** All of her daily actions, newest first. */
  listDailyActions(): Promise<DailyAction[]>;
  getDailyAction(date: string): Promise<DailyAction | null>;
  setDailyAction(date: string, action: NewDailyAction): Promise<DailyAction>;
  /** Mark today's action lived (or not yet). If it's a weekly action, that one is marked too. */
  setDailyActionLived(date: string, lived: boolean): Promise<void>;
  clearDailyAction(date: string): Promise<void>;

  /** Her vision board, in her order. */
  listVisionItems(): Promise<VisionItem[]>;
  /** Add a photo to the end of her board. */
  addVisionImage(image: PreparedImage, details: NewVisionItem): Promise<VisionItem>;
  /** Add a few words to the end of her board. */
  addVisionWords(details: NewVisionItem): Promise<VisionItem>;
  updateVisionItem(id: string, changes: VisionItemChanges): Promise<void>;
  /** Put her items in this order (every id, first to last). */
  reorderVisionItems(ids: string[]): Promise<void>;
  /** Remove an item (and its photo). */
  deleteVisionItem(id: string): Promise<void>;

  getBloomSeen(): Promise<BloomSeen>;
  setBloomSeen(seen: BloomSeen): Promise<void>;

  getDraft(key: string): Promise<string>;
  setDraft(key: string, text: string): Promise<void>;

  /** Be told whenever any saved data changes. Returns a function to stop listening. */
  subscribe(listener: () => void): () => void;
}
