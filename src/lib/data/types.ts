/**
 * DATA SHAPES
 *
 * These describe every piece of information the app saves.
 * They stay the same whether data lives in the browser (today)
 * or in Supabase (later).
 */
import type { DimensionId, MoodId, ReflectionSectionId } from "@/config/app.config";

/** The person using the app. */
export type Profile = {
  name: string;
  /** Set once onboarding is finished. */
  onboardedAt: string | null;
};

/** Wheel scores, 0 to 10, one per dimension. Missing means "not yet rated". */
export type WheelScores = Partial<Record<DimensionId, number>>;

/** One daily "How are you arriving today?" answer. */
export type MoodEntry = {
  /** Calendar day, like "2026-09-24" */
  date: string;
  moodId: MoodId;
  at: string;
};

/** Where a moment of attention came from. Powers the "My Rhythm" view. */
export type AttentionSource = "today" | "wheel" | "reflection" | "moment";

/** A small record each time a dimension receives some attention. */
export type AttentionEntry = {
  dimensionId: DimensionId;
  source: AttentionSource;
  at: string;
};

/** One journal page: a written reflection on one dimension. */
export type JournalEntry = {
  id: string;
  dimensionId: DimensionId;
  /** Which reflection section it was written in ("celebrate", "release", ...) */
  sectionId: ReflectionSectionId;
  /** The prompt that was showing, kept so the page reads well later */
  prompt: string;
  text: string;
  createdAt: string;
  updatedAt: string;
};

/** What is needed to write a new page (the store fills in id and dates). */
export type NewJournalEntry = Pick<JournalEntry, "dimensionId" | "sectionId" | "prompt" | "text">;

/**
 * THE CONTRACT
 * Any storage (browser, Supabase, anything else) must provide these functions.
 * Every function returns a Promise so a network backend fits without changes.
 */
export interface DataStore {
  getProfile(): Promise<Profile>;
  saveProfile(profile: Profile): Promise<void>;

  getWheelScores(): Promise<WheelScores>;
  setWheelScore(dimensionId: DimensionId, score: number): Promise<void>;

  getMood(date: string): Promise<MoodEntry | null>;
  setMood(date: string, moodId: MoodEntry["moodId"]): Promise<void>;

  logAttention(dimensionId: DimensionId, source: AttentionSource): Promise<void>;
  getAttention(sinceISO: string): Promise<AttentionEntry[]>;

  /** Journal pages, newest first. Pass a dimension to see only its pages. */
  listJournal(dimensionId?: DimensionId): Promise<JournalEntry[]>;
  addJournalEntry(entry: NewJournalEntry): Promise<JournalEntry>;
  updateJournalEntry(id: string, text: string): Promise<void>;
  deleteJournalEntry(id: string): Promise<void>;

  /** Unfinished writing, kept safe while typing. `key` identifies the page being written. */
  getDraft(key: string): Promise<string>;
  setDraft(key: string, text: string): Promise<void>;

  /** Be told whenever any saved data changes. Returns a function to stop listening. */
  subscribe(listener: () => void): () => void;
}
