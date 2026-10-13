/**
 * BROWSER STORAGE (localStorage)
 *
 * Saves everything on the person's own device. Works fully offline.
 * Nothing leaves the phone. Clearing browser data clears this too.
 *
 * When the Supabase backend arrives, a new file (supabase-store.ts)
 * will provide the same functions, and src/lib/data/store.ts will
 * simply point at that one instead.
 */
import type { ActivityLog, Assessment, BecomeChoice, DataStore, DedicationNote, JournalEntry, MoodEntry, Profile } from "./types";
import { SaveError } from "./errors";

/**
 * Every key is prefixed so it never collides with other sites or old versions.
 * v2 = the Radiate build brief's data shapes. Test data saved under the older
 * "rhythm:v1:" prefix is left untouched and no longer read.
 */
const PREFIX = "radiate:v2:";
const KEYS = {
  profile: PREFIX + "profile",
  moods: PREFIX + "moods",
  assessments: PREFIX + "assessments",
  journal: PREFIX + "journal",
  choices: PREFIX + "become-choices",
  activityLog: PREFIX + "activity-log",
  dedicationNotes: PREFIX + "dedication-notes",
  drafts: PREFIX + "drafts",
};

const defaultProfile: Profile = { name: "", onboardedAt: null };

// ---- small helpers ---------------------------------------------------

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    // Storage blocked (private mode) or unreadable: fall back quietly.
    return fallback;
  }
}

const listeners = new Set<() => void>();

/** A unique id for new records (works in every modern browser). */
function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Save without telling every screen (used for drafts, which save on each keystroke).
 * Throws SaveError if the browser refuses (storage full, or saving blocked).
 */
function writeQuietly(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (cause) {
    throw new SaveError(cause);
  }
}

/** Save, then tell every screen so they refresh. Throws SaveError if saving fails. */
function write(key: string, value: unknown) {
  writeQuietly(key, value);
  listeners.forEach((fn) => fn());
}

const newestFirst = <T extends { createdAt: string }>(items: T[]) =>
  [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

// ---- the store ---------------------------------------------------------

export const localStore: DataStore = {
  async getProfile() {
    return { ...defaultProfile, ...read<Partial<Profile>>(KEYS.profile, {}) };
  },
  async saveProfile(profile) {
    write(KEYS.profile, profile);
  },

  async getMood(date) {
    const moods = read<Record<string, MoodEntry>>(KEYS.moods, {});
    return moods[date] ?? null;
  },
  async setMood(date, moodId) {
    const moods = read<Record<string, MoodEntry>>(KEYS.moods, {});
    moods[date] = { date, moodId, at: new Date().toISOString() };
    write(KEYS.moods, moods);
  },

  async listAssessments() {
    return [...read<Assessment[]>(KEYS.assessments, [])].sort((a, b) => b.takenAt.localeCompare(a.takenAt));
  },
  async addAssessment(assessment) {
    const saved: Assessment = { ...assessment, id: newId(), takenAt: new Date().toISOString() };
    write(KEYS.assessments, [...read<Assessment[]>(KEYS.assessments, []), saved]);
    return saved;
  },
  async deleteAssessment(id) {
    write(
      KEYS.assessments,
      read<Assessment[]>(KEYS.assessments, []).filter((a) => a.id !== id),
    );
  },

  async listJournal(dimensionId) {
    const all = read<JournalEntry[]>(KEYS.journal, []);
    return newestFirst(dimensionId ? all.filter((e) => e.dimensionIds.includes(dimensionId)) : all);
  },
  async addJournalEntry(entry) {
    const now = new Date().toISOString();
    const page: JournalEntry = { ...entry, id: newId(), createdAt: now, updatedAt: now };
    write(KEYS.journal, [...read<JournalEntry[]>(KEYS.journal, []), page]);
    return page;
  },
  async updateJournalEntry(id, text) {
    const all = read<JournalEntry[]>(KEYS.journal, []);
    write(
      KEYS.journal,
      all.map((e) => (e.id === id ? { ...e, text, updatedAt: new Date().toISOString() } : e)),
    );
  },
  async deleteJournalEntry(id) {
    write(
      KEYS.journal,
      read<JournalEntry[]>(KEYS.journal, []).filter((e) => e.id !== id),
    );
  },

  async listBecomeChoices(dimensionId) {
    const all = read<BecomeChoice[]>(KEYS.choices, []);
    return newestFirst(dimensionId ? all.filter((c) => c.dimensionIds.includes(dimensionId)) : all);
  },
  async addBecomeChoice(choice) {
    const now = new Date().toISOString();
    const saved: BecomeChoice = { ...choice, id: newId(), createdAt: now, updatedAt: now };
    write(KEYS.choices, [...read<BecomeChoice[]>(KEYS.choices, []), saved]);
    return saved;
  },
  async updateBecomeChoice(id, text) {
    const all = read<BecomeChoice[]>(KEYS.choices, []);
    write(
      KEYS.choices,
      all.map((c) => (c.id === id ? { ...c, text, updatedAt: new Date().toISOString() } : c)),
    );
  },
  async deleteBecomeChoice(id) {
    write(
      KEYS.choices,
      read<BecomeChoice[]>(KEYS.choices, []).filter((c) => c.id !== id),
    );
  },

  async listActivityLog() {
    return [...read<ActivityLog[]>(KEYS.activityLog, [])].sort((a, b) => b.at.localeCompare(a.at));
  },
  async logActivity(log) {
    const saved: ActivityLog = { ...log, id: newId(), at: new Date().toISOString() };
    write(KEYS.activityLog, [...read<ActivityLog[]>(KEYS.activityLog, []), saved]);
    return saved;
  },

  async listDedicationNotes(dedicationId) {
    const all = read<DedicationNote[]>(KEYS.dedicationNotes, []);
    return newestFirst(dedicationId ? all.filter((n) => n.dedicationId === dedicationId) : all);
  },
  async addDedicationNote(note) {
    const saved: DedicationNote = { ...note, id: newId(), createdAt: new Date().toISOString() };
    write(KEYS.dedicationNotes, [...read<DedicationNote[]>(KEYS.dedicationNotes, []), saved]);
    return saved;
  },

  async getDraft(key) {
    return read<Record<string, string>>(KEYS.drafts, {})[key] ?? "";
  },
  async setDraft(key, text) {
    const drafts = read<Record<string, string>>(KEYS.drafts, {});
    if (text) drafts[key] = text;
    else delete drafts[key];
    writeQuietly(KEYS.drafts, drafts);
  },

  subscribe(listener) {
    listeners.add(listener);
    // Also react when the app is open in another tab and data changes there.
    const onStorage = (e: StorageEvent) => {
      if (e.key?.startsWith(PREFIX)) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  },
};
