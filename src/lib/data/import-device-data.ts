/**
 * BRING WHAT'S ON THIS PHONE INTO HER ACCOUNT (once per member, per device)
 *
 * Before accounts existed, everything was saved in the browser. The first
 * time she signs in on a device, it's all copied into her account, keeping
 * every id, so copying again never makes duplicates. The device copy is
 * left as it is, as a backup. Her name and first day are only filled in if
 * her account doesn't have them yet.
 */
import { supabase } from "@/lib/supabase/client";
import { localStore } from "./local-store";

const doneKey = (memberId: string) => `radiate:v2:imported:${memberId}`;

/** Copy this device's data into the signed-in account. Resolves true once it's all there. */
export async function importDeviceData(memberId: string): Promise<boolean> {
  try {
    if (localStorage.getItem(doneKey(memberId))) return true;
  } catch {
    return true; // Storage blocked: there's nothing on this device to bring.
  }

  const s = localStore;
  const [profile, seen, assessments, journal, choices, intentions, milestones, weekly, daily, activities, notes] = await Promise.all([
    s.getProfile(),
    s.getBloomSeen(),
    s.listAssessments(),
    s.listJournal(),
    s.listBecomeChoices(),
    s.listIntentions(),
    s.listMilestones(),
    s.listWeeklyActions(),
    s.listDailyActions(),
    s.listActivityLog(),
    s.listDedicationNotes(),
  ]);
  const moods = readMoods();

  const nothingHere =
    !profile.name && !profile.onboardedAt && !assessments.length && !journal.length && !choices.length && !intentions.length && !activities.length && !notes.length && !moods.length;
  if (nothingHere) {
    markDone(memberId);
    return true;
  }

  const db = supabase();
  const choiceIds = new Set(choices.map((c) => c.id));
  const intentionIds = new Set(intentions.map((i) => i.id));
  const weeklyIds = new Set(weekly.filter((w) => intentionIds.has(w.intentionId)).map((w) => w.id));

  // In order, so every reference points at something already there.
  const steps: [string, Record<string, unknown>[], string][] = [
    ["become_choices", choices.map((c) => ({ id: c.id, dimension_ids: c.dimensionIds, text: c.text, lived_at: c.livedAt ?? null, created_at: c.createdAt, updated_at: c.updatedAt })), "user_id,id"],
    [
      "goals",
      intentions.map((i) => ({
        id: i.id, title: i.title, vision: i.vision, dimension_ids: i.dimensionIds,
        become_choice_id: i.becomeChoiceId && choiceIds.has(i.becomeChoiceId) ? i.becomeChoiceId : null,
        starts_on: i.startsOn, ends_on: i.endsOn, status: i.status, reached_at: i.reachedAt, created_at: i.createdAt, updated_at: i.updatedAt,
      })),
      "user_id,id",
    ],
    ["milestones", milestones.filter((m) => intentionIds.has(m.intentionId)).map((m) => ({ id: m.id, goal_id: m.intentionId, title: m.title, reached_at: m.reachedAt, created_at: m.createdAt })), "user_id,id"],
    [
      "weekly_actions",
      weekly.filter((w) => intentionIds.has(w.intentionId)).map((w) => ({ id: w.id, goal_id: w.intentionId, title: w.title, week_of: w.weekOf, lived_at: w.livedAt, created_at: w.createdAt, updated_at: w.updatedAt })),
      "user_id,id",
    ],
    [
      "daily_actions",
      daily.map((d) => ({
        date: d.date, text: d.text, lived_at: d.livedAt, at: d.at,
        weekly_action_id: d.weeklyActionId && weeklyIds.has(d.weeklyActionId) ? d.weeklyActionId : null,
        goal_id: d.intentionId && intentionIds.has(d.intentionId) ? d.intentionId : null,
      })),
      "user_id,date",
    ],
    ["assessments", assessments.map((a) => ({ id: a.id, taken_at: a.takenAt, noticing: a.noticing ?? "" })), "user_id,id"],
    [
      "assessment_scores",
      assessments.flatMap((a) =>
        Object.entries(a.places).map(([dimension_id, score]) => ({
          assessment_id: a.id, dimension_id, score: Math.max(0, Math.min(10, Math.round(score))),
          note: a.notes?.[dimension_id as keyof typeof a.notes] ?? null,
        })),
      ),
      "user_id,assessment_id,dimension_id",
    ],
    ["journal_entries", journal.map((e) => ({ id: e.id, dimension_ids: e.dimensionIds, movement: e.movement, prompt: e.prompt, text: e.text, created_at: e.createdAt, updated_at: e.updatedAt })), "user_id,id"],
    ["moods", moods.map((m) => ({ date: m.date, mood_id: m.moodId, at: m.at })), "user_id,date"],
    ["activity_log", activities.map((l) => ({ id: l.id, activity_id: l.activityId, felt: l.felt, at: l.at })), "user_id,id"],
    ["dedication_notes", notes.map((n) => ({ id: n.id, dedication_id: n.dedicationId, text: n.text, created_at: n.createdAt })), "user_id,id"],
  ];

  for (const [table, rows, onConflict] of steps) {
    if (!rows.length) continue;
    // ignoreDuplicates: anything already in her account (from another phone, or an earlier try) is left as it is.
    const { error } = await db.from(table).upsert(rows, { onConflict, ignoreDuplicates: true });
    if (error) return false;
  }

  // Her name, first day and bloom: only filled in where her account is still empty.
  const { data: account, error: profileError } = await db.from("profiles").select("name, onboarded_at, bloom_seen_petals, bloom_seen_bouquets").maybeSingle();
  if (profileError || !account) return false;
  const { error: updateError } = await db
    .from("profiles")
    .update({
      name: account.name || profile.name,
      onboarded_at: account.onboarded_at ?? profile.onboardedAt,
      bloom_seen_petals: Math.max(account.bloom_seen_petals ?? 0, seen.petals),
      bloom_seen_bouquets: Math.max(account.bloom_seen_bouquets ?? 0, seen.bouquets),
    })
    .eq("id", memberId);
  if (updateError) return false;

  markDone(memberId);
  return true;
}

function markDone(memberId: string) {
  try {
    localStorage.setItem(doneKey(memberId), new Date().toISOString());
  } catch {
    // If this can't be remembered, the next sign-in simply checks again (nothing duplicates).
  }
}

/** Mood check-ins are kept by day on the device, with no "list" function in the store. */
function readMoods(): { date: string; moodId: string; at: string }[] {
  try {
    return Object.values(JSON.parse(localStorage.getItem("radiate:v2:moods") ?? "{}"));
  } catch {
    return [];
  }
}
