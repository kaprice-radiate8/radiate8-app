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
import { intentions as intentionRules } from "@/config/app.config";
import { addDays, dayKey } from "@/lib/dates";
import { blobToDataUrl, prepareImage } from "@/lib/images";
import type {
  ActivityLog,
  Assessment,
  BecomeChoice,
  BloomSeen,
  DailyAction,
  DataStore,
  DedicationNote,
  Intention,
  JournalEntry,
  Milestone,
  MoodEntry,
  Profile,
  VisionItem,
  WeeklyAction,
} from "./types";
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
  bloomSeen: PREFIX + "bloom-seen",
  drafts: PREFIX + "drafts",
  intentions: PREFIX + "intentions",
  milestones: PREFIX + "milestones",
  weeklyActions: PREFIX + "weekly-actions",
  dailyActions: PREFIX + "daily-actions",
  vision: PREFIX + "vision-items",
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

/** Tell every screen that data changed, so they refresh. */
function notify() {
  listeners.forEach((fn) => fn());
}

/** Save, then tell every screen so they refresh. Throws SaveError if saving fails. */
function write(key: string, value: unknown) {
  writeQuietly(key, value);
  notify();
}

/** Change the records whose id matches, keeping everything else as it is. */
function patch<T extends { id: string }>(key: string, id: string, change: (item: T) => T) {
  write(
    key,
    read<T[]>(key, []).map((item) => (item.id === id ? change(item) : item)),
  );
}

const newestFirst = <T extends { createdAt: string }>(items: T[]) =>
  [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

/** Save a new vision item at the end of her board. */
function addVisionItem(item: Pick<VisionItem, "kind" | "imageUrl" | "words" | "dimensionId">): VisionItem {
  const all = read<VisionItem[]>(KEYS.vision, []);
  const now = new Date().toISOString();
  const saved: VisionItem = {
    ...item,
    id: newId(),
    intentionId: null,
    position: Math.max(0, ...all.map((v) => v.position)) + 1,
    createdAt: now,
    updatedAt: now,
  };
  write(KEYS.vision, [...all, saved]);
  return saved;
}

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

  async setBecomeChoiceLived(id, lived) {
    const all = read<BecomeChoice[]>(KEYS.choices, []);
    const now = new Date().toISOString();
    write(
      KEYS.choices,
      all.map((c) => (c.id === id ? { ...c, livedAt: lived ? now : null, updatedAt: now } : c)),
    );
  },

  async listIntentions() {
    return newestFirst(read<Intention[]>(KEYS.intentions, []));
  },
  async addIntention(intention, milestones, firstActions) {
    const now = new Date().toISOString();
    const saved: Intention = {
      ...intention,
      id: newId(),
      startsOn: dayKey(),
      endsOn: addDays(dayKey(), intentionRules.days),
      status: "growing",
      reachedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    const newMilestones: Milestone[] = milestones.map((title) => ({ id: newId(), intentionId: saved.id, title, reachedAt: null, createdAt: now }));
    const newActions: WeeklyAction[] = firstActions.map((a) => ({
      id: newId(),
      intentionId: saved.id,
      title: a.title,
      weekOf: a.weekOf,
      livedAt: null,
      createdAt: now,
      updatedAt: now,
    }));
    // The intention is saved last, so if anything fails nothing half-made ever shows.
    writeQuietly(KEYS.milestones, [...read<Milestone[]>(KEYS.milestones, []), ...newMilestones]);
    writeQuietly(KEYS.weeklyActions, [...read<WeeklyAction[]>(KEYS.weeklyActions, []), ...newActions]);
    write(KEYS.intentions, [...read<Intention[]>(KEYS.intentions, []), saved]);
    return saved;
  },
  async updateIntention(id, changes) {
    const now = new Date().toISOString();
    patch<Intention>(KEYS.intentions, id, (i) => ({
      ...i,
      ...changes,
      // Reaching it is remembered with the day; moving it back clears that.
      reachedAt: changes.status === undefined ? i.reachedAt : changes.status === "reached" ? (i.reachedAt ?? now) : null,
      updatedAt: now,
    }));
  },
  async renewIntention(id, startsOn) {
    patch<Intention>(KEYS.intentions, id, (i) => ({
      ...i,
      startsOn,
      endsOn: addDays(startsOn, intentionRules.days),
      status: "growing",
      reachedAt: null,
      updatedAt: new Date().toISOString(),
    }));
  },
  async deleteIntention(id) {
    const actions = read<WeeklyAction[]>(KEYS.weeklyActions, []);
    writeQuietly(
      KEYS.weeklyActions,
      actions.filter((a) => a.intentionId !== id),
    );
    writeQuietly(
      KEYS.milestones,
      read<Milestone[]>(KEYS.milestones, []).filter((m) => m.intentionId !== id),
    );
    // Her daily actions stay in her history, in her words; they just no longer point here.
    const days = read<Record<string, DailyAction>>(KEYS.dailyActions, {});
    for (const day of Object.values(days)) {
      if (day.intentionId === id) Object.assign(day, { intentionId: null, weeklyActionId: null });
    }
    writeQuietly(KEYS.dailyActions, days);
    // Images linked to it stay on her board, unlinked.
    writeQuietly(
      KEYS.vision,
      read<VisionItem[]>(KEYS.vision, []).map((v) => (v.intentionId === id ? { ...v, intentionId: null } : v)),
    );
    write(
      KEYS.intentions,
      read<Intention[]>(KEYS.intentions, []).filter((i) => i.id !== id),
    );
  },

  async listMilestones(intentionId) {
    const all = read<Milestone[]>(KEYS.milestones, []);
    return (intentionId ? all.filter((m) => m.intentionId === intentionId) : all).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },
  async addMilestone(intentionId, title) {
    const saved: Milestone = { id: newId(), intentionId, title, reachedAt: null, createdAt: new Date().toISOString() };
    write(KEYS.milestones, [...read<Milestone[]>(KEYS.milestones, []), saved]);
    return saved;
  },
  async setMilestoneReached(id, reached) {
    patch<Milestone>(KEYS.milestones, id, (m) => ({ ...m, reachedAt: reached ? new Date().toISOString() : null }));
  },
  async deleteMilestone(id) {
    write(
      KEYS.milestones,
      read<Milestone[]>(KEYS.milestones, []).filter((m) => m.id !== id),
    );
  },

  async listWeeklyActions(intentionId) {
    const all = read<WeeklyAction[]>(KEYS.weeklyActions, []);
    return (intentionId ? all.filter((a) => a.intentionId === intentionId) : all).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },
  async addWeeklyAction(action) {
    const now = new Date().toISOString();
    const saved: WeeklyAction = { ...action, id: newId(), livedAt: null, createdAt: now, updatedAt: now };
    write(KEYS.weeklyActions, [...read<WeeklyAction[]>(KEYS.weeklyActions, []), saved]);
    return saved;
  },
  async setWeeklyActionLived(id, lived) {
    const now = new Date().toISOString();
    const livedAt = lived ? now : null;
    const days = read<Record<string, DailyAction>>(KEYS.dailyActions, {});
    for (const day of Object.values(days)) if (day.weeklyActionId === id) day.livedAt = livedAt;
    writeQuietly(KEYS.dailyActions, days);
    patch<WeeklyAction>(KEYS.weeklyActions, id, (a) => ({ ...a, livedAt, updatedAt: now }));
  },
  async moveWeeklyAction(id, weekOf) {
    patch<WeeklyAction>(KEYS.weeklyActions, id, (a) => ({ ...a, weekOf, updatedAt: new Date().toISOString() }));
  },
  async deleteWeeklyAction(id) {
    const days = read<Record<string, DailyAction>>(KEYS.dailyActions, {});
    for (const day of Object.values(days)) if (day.weeklyActionId === id) day.weeklyActionId = null;
    writeQuietly(KEYS.dailyActions, days);
    write(
      KEYS.weeklyActions,
      read<WeeklyAction[]>(KEYS.weeklyActions, []).filter((a) => a.id !== id),
    );
  },

  async listDailyActions() {
    return Object.values(read<Record<string, DailyAction>>(KEYS.dailyActions, {})).sort((a, b) => b.date.localeCompare(a.date));
  },
  async getDailyAction(date) {
    return read<Record<string, DailyAction>>(KEYS.dailyActions, {})[date] ?? null;
  },
  async setDailyAction(date, action) {
    const days = read<Record<string, DailyAction>>(KEYS.dailyActions, {});
    // Choosing a weekly action she already lived keeps it lived.
    const weekly = action.weeklyActionId ? read<WeeklyAction[]>(KEYS.weeklyActions, []).find((a) => a.id === action.weeklyActionId) : undefined;
    const saved: DailyAction = { ...action, date, livedAt: weekly?.livedAt ?? null, at: new Date().toISOString() };
    days[date] = saved;
    write(KEYS.dailyActions, days);
    return saved;
  },
  async setDailyActionLived(date, lived) {
    const days = read<Record<string, DailyAction>>(KEYS.dailyActions, {});
    const day = days[date];
    if (!day) return;
    if (day.weeklyActionId) return localStore.setWeeklyActionLived(day.weeklyActionId, lived);
    day.livedAt = lived ? new Date().toISOString() : null;
    write(KEYS.dailyActions, days);
  },
  async clearDailyAction(date) {
    const days = read<Record<string, DailyAction>>(KEYS.dailyActions, {});
    delete days[date];
    write(KEYS.dailyActions, days);
  },

  async listVisionItems() {
    return [...read<VisionItem[]>(KEYS.vision, [])].sort((a, b) => a.position - b.position || a.createdAt.localeCompare(b.createdAt));
  },
  async addVisionImage(image, details) {
    // On the device, photos are kept smaller: browser storage holds only a few megabytes.
    let imageUrl: string;
    try {
      imageUrl = await blobToDataUrl((await prepareImage(image.blob, 900, 0.75)).blob);
    } catch (cause) {
      throw new SaveError(cause);
    }
    return addVisionItem({ kind: "image", imageUrl, ...details });
  },
  async addVisionWords(details) {
    return addVisionItem({ kind: "words", imageUrl: null, ...details });
  },
  async updateVisionItem(id, changes) {
    patch<VisionItem>(KEYS.vision, id, (v) => ({ ...v, ...changes, updatedAt: new Date().toISOString() }));
  },
  async reorderVisionItems(ids) {
    const order = new Map(ids.map((id, i) => [id, i + 1]));
    write(
      KEYS.vision,
      read<VisionItem[]>(KEYS.vision, []).map((v) => ({ ...v, position: order.get(v.id) ?? v.position })),
    );
  },
  async deleteVisionItem(id) {
    write(
      KEYS.vision,
      read<VisionItem[]>(KEYS.vision, []).filter((v) => v.id !== id),
    );
  },

  async getBloomSeen() {
    return { petals: 0, bouquets: 0, ...read<Partial<BloomSeen>>(KEYS.bloomSeen, {}) };
  },
  async setBloomSeen(seen) {
    // Quietly: this only remembers what she has seen, so no screen needs to refresh.
    writeQuietly(KEYS.bloomSeen, seen);
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
