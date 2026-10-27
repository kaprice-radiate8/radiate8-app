/**
 * MEMBER ACCOUNT STORAGE (Supabase)
 *
 * The same functions as local-store.ts, saving to the member's private
 * account instead of the device. Row-level security in the database makes
 * sure every query only ever reaches her own rows; this file never needs
 * to filter by member itself, and new rows are stamped with her id by the
 * database. Tables: supabase/migrations.
 *
 * Saving functions throw SaveError when something didn't save. Loading
 * functions throw LoadError, so screens keep what they had instead of
 * showing an empty page (see use-store-data.ts and ConnectionNotice).
 *
 * Unfinished writing (drafts) stays on the device, as it's saved on every keystroke.
 */
import { intentions as intentionRules, type DimensionId, type MoodId, type MovementId } from "@/config/app.config";
import { addDays, dayKey } from "@/lib/dates";
import { supabase } from "@/lib/supabase/client";
import { LoadError, SaveError } from "./errors";
import { localStore } from "./local-store";
import type {
  ActivityLog,
  Assessment,
  BecomeChoice,
  DailyAction,
  DataStore,
  DedicationNote,
  Intention,
  JournalEntry,
  Milestone,
  VisionItem,
  WeeklyAction,
} from "./types";

type Row = Record<string, unknown>;

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((fn) => fn());

/** Load rows, or throw LoadError (and tell the connection notice). */
async function load<T = Row[]>(query: PromiseLike<{ data: unknown; error: unknown }>): Promise<T> {
  const { data, error } = await query;
  if (error) {
    if (typeof window !== "undefined") window.dispatchEvent(new Event("radiate:unreachable"));
    throw new LoadError(error);
  }
  return data as T;
}

/** Save, then tell every screen. Throws SaveError if it didn't save. */
async function save<T = Row>(query: PromiseLike<{ data: unknown; error: unknown }>): Promise<T> {
  let result: { data: unknown; error: unknown };
  try {
    result = await query;
  } catch (cause) {
    throw new SaveError(cause);
  }
  if (result.error) throw new SaveError(result.error);
  notify();
  return result.data as T;
}

async function memberId(): Promise<string> {
  const { data } = await supabase().auth.getSession();
  if (!data.session) throw new SaveError("Not signed in");
  return data.session.user.id;
}

const now = () => new Date().toISOString();
const db = () => supabase();

// ---- rows → app shapes ---------------------------------------------------

const toAssessment = (r: Row): Assessment => {
  const scores = (r.assessment_scores as Row[] | null) ?? [];
  return {
    id: r.id as string,
    takenAt: r.taken_at as string,
    noticing: (r.noticing as string) ?? "",
    places: Object.fromEntries(scores.map((s) => [s.dimension_id, s.score])) as Assessment["places"],
    notes: Object.fromEntries(scores.filter((s) => s.note).map((s) => [s.dimension_id, s.note])) as Assessment["notes"],
  };
};

const toJournal = (r: Row): JournalEntry => ({
  id: r.id as string,
  dimensionIds: r.dimension_ids as DimensionId[],
  movement: r.movement as MovementId,
  prompt: r.prompt as string,
  text: r.text as string,
  createdAt: r.created_at as string,
  updatedAt: r.updated_at as string,
});

const toChoice = (r: Row): BecomeChoice => ({
  id: r.id as string,
  dimensionIds: r.dimension_ids as DimensionId[],
  text: r.text as string,
  livedAt: (r.lived_at as string | null) ?? null,
  createdAt: r.created_at as string,
  updatedAt: r.updated_at as string,
});

const toIntention = (r: Row): Intention => ({
  id: r.id as string,
  title: r.title as string,
  vision: r.vision as string,
  dimensionIds: r.dimension_ids as DimensionId[],
  becomeChoiceId: (r.become_choice_id as string | null) ?? null,
  startsOn: r.starts_on as string,
  endsOn: r.ends_on as string,
  status: r.status as Intention["status"],
  reachedAt: (r.reached_at as string | null) ?? null,
  createdAt: r.created_at as string,
  updatedAt: r.updated_at as string,
});

const toMilestone = (r: Row): Milestone => ({
  id: r.id as string,
  intentionId: r.goal_id as string,
  title: r.title as string,
  reachedAt: (r.reached_at as string | null) ?? null,
  createdAt: r.created_at as string,
});

const toWeekly = (r: Row): WeeklyAction => ({
  id: r.id as string,
  intentionId: r.goal_id as string,
  title: r.title as string,
  weekOf: r.week_of as string,
  livedAt: (r.lived_at as string | null) ?? null,
  createdAt: r.created_at as string,
  updatedAt: r.updated_at as string,
});

const toDaily = (r: Row): DailyAction => ({
  date: r.date as string,
  text: r.text as string,
  weeklyActionId: (r.weekly_action_id as string | null) ?? null,
  intentionId: (r.goal_id as string | null) ?? null,
  livedAt: (r.lived_at as string | null) ?? null,
  at: r.at as string,
});

const toActivity = (r: Row): ActivityLog => ({ id: r.id as string, activityId: r.activity_id as string, felt: (r.felt as string | null) ?? null, at: r.at as string });

/** Photos live in her own folder of this private bucket, shown through links that expire. */
const PHOTOS = "member-media";
const PHOTO_LINK_SECONDS = 60 * 60;

const toVision = (r: Row, links: Map<string, string>): VisionItem => {
  const path = (r.media as Row | null)?.storage_path as string | undefined;
  return {
    id: r.id as string,
    kind: r.kind as VisionItem["kind"],
    imageUrl: path ? (links.get(path) ?? null) : null,
    words: r.words as string,
    dimensionId: (r.dimension_id as DimensionId | null) ?? null,
    intentionId: (r.goal_id as string | null) ?? null,
    position: r.position as number,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
};

/** A new item goes at the end: seconds since 1970 are always larger than a reordered position (1, 2, 3...). */
const endOfBoard = () => Math.floor(Date.now() / 1000);

const toNote = (r: Row): DedicationNote => ({
  id: r.id as string,
  dedicationId: r.dedication_id as string,
  text: r.text as string,
  createdAt: r.created_at as string,
});

// ---- the store -------------------------------------------------------------

export const supabaseStore: DataStore = {
  async getProfile() {
    const row = await load<Row | null>(db().from("profiles").select("name, onboarded_at").maybeSingle());
    return { name: (row?.name as string) ?? "", onboardedAt: (row?.onboarded_at as string | null) ?? null };
  },
  async saveProfile(profile) {
    const id = await memberId();
    await save(db().from("profiles").update({ name: profile.name, onboarded_at: profile.onboardedAt, updated_at: now() }).eq("id", id));
  },

  async getMood(date) {
    const row = await load<Row | null>(db().from("moods").select("*").eq("date", date).maybeSingle());
    return row ? { date: row.date as string, moodId: row.mood_id as MoodId, at: row.at as string } : null;
  },
  async setMood(date, moodId) {
    await memberId();
    await save(db().from("moods").upsert({ date, mood_id: moodId, at: now() }, { onConflict: "user_id,date" }));
  },

  async listAssessments() {
    const rows = await load(db().from("assessments").select("*, assessment_scores(*)").order("taken_at", { ascending: false }));
    return rows.map(toAssessment);
  },
  async addAssessment(assessment) {
    await memberId();
    const scores = Object.entries(assessment.places).map(([dimension_id, score]) => ({
      dimension_id,
      score,
      note: assessment.notes[dimension_id as DimensionId] ?? null,
    }));
    const row = await save(db().rpc("save_assessment", { noticing: assessment.noticing, scores }));
    const saved = row as unknown as Row;
    return { ...assessment, id: saved.id as string, takenAt: saved.taken_at as string };
  },
  async deleteAssessment(id) {
    await save(db().from("assessments").delete().eq("id", id));
  },

  async listJournal(dimensionId) {
    let q = db().from("journal_entries").select("*").order("created_at", { ascending: false });
    if (dimensionId) q = q.contains("dimension_ids", [dimensionId]);
    return (await load(q)).map(toJournal);
  },
  async addJournalEntry(entry) {
    await memberId();
    const row = await save(
      db().from("journal_entries").insert({ dimension_ids: entry.dimensionIds, movement: entry.movement, prompt: entry.prompt, text: entry.text }).select().single(),
    );
    return toJournal(row);
  },
  async updateJournalEntry(id, text) {
    await save(db().from("journal_entries").update({ text, updated_at: now() }).eq("id", id));
  },
  async deleteJournalEntry(id) {
    await save(db().from("journal_entries").delete().eq("id", id));
  },

  async listBecomeChoices(dimensionId) {
    let q = db().from("become_choices").select("*").order("created_at", { ascending: false });
    if (dimensionId) q = q.contains("dimension_ids", [dimensionId]);
    return (await load(q)).map(toChoice);
  },
  async addBecomeChoice(choice) {
    await memberId();
    const row = await save(db().from("become_choices").insert({ dimension_ids: choice.dimensionIds, text: choice.text }).select().single());
    return toChoice(row);
  },
  async updateBecomeChoice(id, text) {
    await save(db().from("become_choices").update({ text, updated_at: now() }).eq("id", id));
  },
  async deleteBecomeChoice(id) {
    await save(db().from("become_choices").delete().eq("id", id));
  },
  async setBecomeChoiceLived(id, lived) {
    await save(db().from("become_choices").update({ lived_at: lived ? now() : null, updated_at: now() }).eq("id", id));
  },

  async listIntentions() {
    return (await load(db().from("goals").select("*").order("created_at", { ascending: false }))).map(toIntention);
  },
  async addIntention(intention, milestones, firstActions) {
    await memberId();
    const startsOn = dayKey();
    const row = await save(
      db().rpc("plant_goal", {
        goal: {
          title: intention.title,
          vision: intention.vision,
          dimension_ids: intention.dimensionIds,
          become_choice_id: intention.becomeChoiceId,
          starts_on: startsOn,
          ends_on: addDays(startsOn, intentionRules.days),
        },
        milestone_titles: milestones,
        first_actions: firstActions.map((a) => ({ title: a.title, week_of: a.weekOf })),
      }),
    );
    return toIntention(row as unknown as Row);
  },
  async updateIntention(id, changes) {
    const patch: Row = { updated_at: now() };
    if (changes.title !== undefined) patch.title = changes.title;
    if (changes.vision !== undefined) patch.vision = changes.vision;
    if (changes.dimensionIds !== undefined) patch.dimension_ids = changes.dimensionIds;
    if (changes.status !== undefined) {
      patch.status = changes.status;
      if (changes.status !== "reached") patch.reached_at = null;
    }
    // Reaching it is remembered with the day (kept if it was already reached).
    if (changes.status === "reached") {
      const current = await load<Row | null>(db().from("goals").select("reached_at").eq("id", id).maybeSingle());
      patch.reached_at = (current?.reached_at as string | null) ?? now();
    }
    await save(db().from("goals").update(patch).eq("id", id));
  },
  async renewIntention(id, startsOn) {
    await save(
      db()
        .from("goals")
        .update({ starts_on: startsOn, ends_on: addDays(startsOn, intentionRules.days), status: "growing", reached_at: null, updated_at: now() })
        .eq("id", id),
    );
  },
  async deleteIntention(id) {
    // Its milestones and weekly actions go with it; daily actions stay in her history.
    await save(db().from("goals").delete().eq("id", id));
  },

  async listMilestones(intentionId) {
    let q = db().from("milestones").select("*").order("created_at", { ascending: true });
    if (intentionId) q = q.eq("goal_id", intentionId);
    return (await load(q)).map(toMilestone);
  },
  async addMilestone(intentionId, title) {
    await memberId();
    return toMilestone(await save(db().from("milestones").insert({ goal_id: intentionId, title }).select().single()));
  },
  async setMilestoneReached(id, reached) {
    await save(db().from("milestones").update({ reached_at: reached ? now() : null }).eq("id", id));
  },
  async deleteMilestone(id) {
    await save(db().from("milestones").delete().eq("id", id));
  },

  async listWeeklyActions(intentionId) {
    let q = db().from("weekly_actions").select("*").order("created_at", { ascending: true });
    if (intentionId) q = q.eq("goal_id", intentionId);
    return (await load(q)).map(toWeekly);
  },
  async addWeeklyAction(action) {
    await memberId();
    return toWeekly(await save(db().from("weekly_actions").insert({ goal_id: action.intentionId, title: action.title, week_of: action.weekOf }).select().single()));
  },
  async setWeeklyActionLived(id, lived) {
    const livedAt = lived ? now() : null;
    await save(db().from("daily_actions").update({ lived_at: livedAt }).eq("weekly_action_id", id));
    await save(db().from("weekly_actions").update({ lived_at: livedAt, updated_at: now() }).eq("id", id));
  },
  async moveWeeklyAction(id, weekOf) {
    await save(db().from("weekly_actions").update({ week_of: weekOf, updated_at: now() }).eq("id", id));
  },
  async deleteWeeklyAction(id) {
    await save(db().from("weekly_actions").delete().eq("id", id));
  },

  async listDailyActions() {
    return (await load(db().from("daily_actions").select("*").order("date", { ascending: false }))).map(toDaily);
  },
  async getDailyAction(date) {
    const row = await load<Row | null>(db().from("daily_actions").select("*").eq("date", date).maybeSingle());
    return row ? toDaily(row) : null;
  },
  async setDailyAction(date, action) {
    await memberId();
    // Choosing a weekly action she already lived keeps it lived.
    let livedAt: string | null = null;
    if (action.weeklyActionId) {
      const weekly = await load<Row | null>(db().from("weekly_actions").select("lived_at").eq("id", action.weeklyActionId).maybeSingle());
      livedAt = (weekly?.lived_at as string | null) ?? null;
    }
    const row = await save(
      db()
        .from("daily_actions")
        .upsert({ date, text: action.text, weekly_action_id: action.weeklyActionId, goal_id: action.intentionId, lived_at: livedAt, at: now() }, { onConflict: "user_id,date" })
        .select()
        .single(),
    );
    return toDaily(row);
  },
  async setDailyActionLived(date, lived) {
    const day = await supabaseStore.getDailyAction(date);
    if (!day) return;
    if (day.weeklyActionId) return supabaseStore.setWeeklyActionLived(day.weeklyActionId, lived);
    await save(db().from("daily_actions").update({ lived_at: lived ? now() : null }).eq("date", date));
  },
  async clearDailyAction(date) {
    await save(db().from("daily_actions").delete().eq("date", date));
  },

  async listActivityLog() {
    return (await load(db().from("activity_log").select("*").order("at", { ascending: false }))).map(toActivity);
  },
  async logActivity(log) {
    await memberId();
    return toActivity(await save(db().from("activity_log").insert({ activity_id: log.activityId, felt: log.felt }).select().single()));
  },

  async listDedicationNotes(dedicationId) {
    let q = db().from("dedication_notes").select("*").order("created_at", { ascending: false });
    if (dedicationId) q = q.eq("dedication_id", dedicationId);
    return (await load(q)).map(toNote);
  },
  async addDedicationNote(note) {
    await memberId();
    return toNote(await save(db().from("dedication_notes").insert({ dedication_id: note.dedicationId, text: note.text }).select().single()));
  },

  async listVisionItems() {
    const rows = await load(
      db().from("vision_items").select("*, media(storage_path)").eq("board", "main").order("position").order("created_at"),
    );
    const paths = rows.map((r) => (r.media as Row | null)?.storage_path as string | undefined).filter((p): p is string => Boolean(p));
    const links = new Map<string, string>();
    if (paths.length) {
      const signed = await load<{ path: string | null; signedUrl: string }[]>(db().storage.from(PHOTOS).createSignedUrls(paths, PHOTO_LINK_SECONDS));
      for (const link of signed) if (link.path && link.signedUrl) links.set(link.path, link.signedUrl);
    }
    return rows.map((r) => toVision(r, links));
  },
  async addVisionImage(image, details) {
    const member = await memberId();
    const mediaId = crypto.randomUUID();
    const path = `${member}/${mediaId}.jpg`;
    const photos = db().storage.from(PHOTOS);
    const { error: uploadError } = await photos.upload(path, image.blob, { contentType: "image/jpeg", cacheControl: "3600", upsert: false });
    if (uploadError) throw new SaveError(uploadError);
    try {
      await save(db().from("media").insert({ id: mediaId, storage_path: path, mime_type: "image/jpeg", bytes: image.blob.size, width: image.width, height: image.height }));
      const row = await save(
        db()
          .from("vision_items")
          .insert({ kind: "image", media_id: mediaId, words: details.words, dimension_id: details.dimensionId, position: endOfBoard() })
          .select("*, media(storage_path)")
          .single(),
      );
      const { data: link } = await photos.createSignedUrl(path, PHOTO_LINK_SECONDS);
      return toVision(row, new Map(link ? [[path, link.signedUrl]] : []));
    } catch (error) {
      // Don't leave a photo behind that nothing points at.
      await photos.remove([path]).catch(() => {});
      throw error;
    }
  },
  async addVisionWords(details) {
    await memberId();
    const row = await save(
      db().from("vision_items").insert({ kind: "words", words: details.words, dimension_id: details.dimensionId, position: endOfBoard() }).select().single(),
    );
    return toVision(row, new Map());
  },
  async updateVisionItem(id, changes) {
    const patch: Row = { updated_at: now() };
    if (changes.words !== undefined) patch.words = changes.words;
    if (changes.dimensionId !== undefined) patch.dimension_id = changes.dimensionId;
    if (changes.intentionId !== undefined) patch.goal_id = changes.intentionId;
    await save(db().from("vision_items").update(patch).eq("id", id));
  },
  async reorderVisionItems(ids) {
    await save(db().rpc("reorder_vision_items", { ids }));
  },
  async deleteVisionItem(id) {
    const item = await load<Row | null>(db().from("vision_items").select("media_id, media(storage_path)").eq("id", id).maybeSingle());
    if (!item) return;
    const path = (item.media as Row | null)?.storage_path as string | undefined;
    if (!item.media_id || !path) {
      await save(db().from("vision_items").delete().eq("id", id));
      return;
    }
    // The photo first, then its record (which removes the item with it).
    const { error } = await db().storage.from(PHOTOS).remove([path]);
    if (error) throw new SaveError(error);
    await save(db().from("media").delete().eq("id", item.media_id as string));
  },

  async getBloomSeen() {
    const row = await load<Row | null>(db().from("profiles").select("bloom_seen_petals, bloom_seen_bouquets").maybeSingle());
    return { petals: (row?.bloom_seen_petals as number) ?? 0, bouquets: (row?.bloom_seen_bouquets as number) ?? 0 };
  },
  async setBloomSeen(seen) {
    // Quietly: this only remembers what she has seen, so no screen needs to refresh.
    const id = await memberId();
    const { error } = await db().from("profiles").update({ bloom_seen_petals: seen.petals, bloom_seen_bouquets: seen.bouquets }).eq("id", id);
    if (error) throw new SaveError(error);
  },

  getDraft: (key) => localStore.getDraft(key),
  setDraft: (key, text) => localStore.setDraft(key, text),

  subscribe(listener) {
    listeners.add(listener);
    // Signing in or out changes whose data this is.
    const { data } = supabase().auth.onAuthStateChange((event) => {
      // Just after, never inside: Supabase asks that no query runs within this callback.
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") setTimeout(listener, 0);
    });
    return () => {
      listeners.delete(listener);
      data.subscription.unsubscribe();
    };
  },
};

/** Tell every screen that data changed (used after importing device data). */
export const refreshAll = notify;
