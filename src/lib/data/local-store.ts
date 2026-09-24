/**
 * BROWSER STORAGE (localStorage)
 *
 * Saves everything on the person's own device. Works fully offline.
 * Nothing leaves the phone. Clearing browser data clears this too.
 *
 * When the Supabase backend arrives, a new file (supabase-store.ts)
 * will provide the same functions, and src/lib/data/index.ts will
 * simply point at that one instead.
 */
import type {
  AttentionEntry,
  DataStore,
  JournalEntry,
  MoodEntry,
  Profile,
  WheelScores,
} from "./types";

/** Every key is prefixed so it never collides with other sites or old versions. */
const PREFIX = "rhythm:v1:";
const KEYS = {
  profile: PREFIX + "profile",
  wheel: PREFIX + "wheel",
  moods: PREFIX + "moods",
  attention: PREFIX + "attention",
  journal: PREFIX + "journal",
  drafts: PREFIX + "drafts",
};

/** Keep the attention log from growing forever (roughly a year of gentle use). */
const MAX_ATTENTION_ENTRIES = 2000;

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

/** Save without telling every screen (used for drafts, which save on each keystroke). */
function writeQuietly(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked. The app keeps working for this session.
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked. The app keeps working for this session.
  }
  listeners.forEach((fn) => fn());
}

// ---- the store ---------------------------------------------------------

export const localStore: DataStore = {
  async getProfile() {
    return { ...defaultProfile, ...read<Partial<Profile>>(KEYS.profile, {}) };
  },
  async saveProfile(profile) {
    write(KEYS.profile, profile);
  },

  async getWheelScores() {
    return read<WheelScores>(KEYS.wheel, {});
  },
  async setWheelScore(dimensionId, score) {
    const scores = read<WheelScores>(KEYS.wheel, {});
    scores[dimensionId] = Math.max(0, Math.min(10, Math.round(score)));
    write(KEYS.wheel, scores);
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

  async logAttention(dimensionId, source) {
    const log = read<AttentionEntry[]>(KEYS.attention, []);
    log.push({ dimensionId, source, at: new Date().toISOString() });
    write(KEYS.attention, log.slice(-MAX_ATTENTION_ENTRIES));
  },
  async getAttention(sinceISO) {
    return read<AttentionEntry[]>(KEYS.attention, []).filter((e) => e.at >= sinceISO);
  },

  async listJournal(dimensionId) {
    const all = read<JournalEntry[]>(KEYS.journal, []);
    const pages = dimensionId ? all.filter((e) => e.dimensionId === dimensionId) : all;
    return [...pages].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
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
