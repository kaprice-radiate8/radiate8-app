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

  /** Unfinished writing, kept safe while typing. `key` identifies the page being written. */
  getDraft(key: string): Promise<string>;
  setDraft(key: string, text: string): Promise<void>;

  /** Be told whenever any saved data changes. Returns a function to stop listening. */
  subscribe(listener: () => void): () => void;
}
