/**
 * HER BLOOM: turns what she has done into petals, flowers and bouquets.
 *
 * - Each reflection, Radiate 8, Dedication writing, lived Become choice and
 *   lived action is one petal (see `bloom.grows` in app.config.ts).
 *   Milestones and intentions she reached are gold-edged petals.
 * - A petal's color is the dimension it's about.
 * - Every `petalsPerFlower` petals finish a flower, and a new one begins.
 * - Her seasons are 90 days from her own first day. When a season ends,
 *   its flowers are gathered into a bouquet, kept for good.
 * Nothing is ever taken away: no wilting, no resets, no counting misses.
 */
import { bloom, type DimensionId } from "@/config/app.config";
import type { ActivityLog, Assessment, BecomeChoice, DailyAction, DedicationNote, Intention, JournalEntry, Milestone, WeeklyAction } from "./data/types";

export type Petal = {
  at: string;
  dimensionId: DimensionId | null;
  /** A goal reached: a Become choice she lived. */
  gold: boolean;
};

export type Season = {
  index: number;
  startsAt: Date;
  /** The day its bouquet is gathered. */
  endsAt: Date;
  /** Finished flowers, then the one still opening (if it has any petals). */
  flowers: Petal[][];
  petals: number;
  finished: boolean;
};

const DAY = 86_400_000;

type Sources = {
  journal: JournalEntry[];
  assessments: Assessment[];
  choices: BecomeChoice[];
  notes: DedicationNote[];
  activities: ActivityLog[];
  intentions: Intention[];
  milestones: Milestone[];
  weeklyActions: WeeklyAction[];
  dailyActions: DailyAction[];
  /** First dimension tag of each Dedication and Daily Activity, by id. */
  dimensionOf: Record<string, DimensionId | undefined>;
};

/** The dimension she placed highest in a Radiate 8. */
function brightest(a: Assessment): DimensionId | null {
  const entries = Object.entries(a.places) as [DimensionId, number][];
  if (!entries.length) return null;
  return entries.reduce((best, cur) => (cur[1] > best[1] ? cur : best))[0];
}

export function collectPetals(s: Sources): Petal[] {
  const petals: Petal[] = [];
  const g = bloom.grows;
  if (g.reflections) for (const e of s.journal) petals.push({ at: e.createdAt, dimensionId: e.dimensionIds[0] ?? null, gold: false });
  if (g.assessments) for (const a of s.assessments) petals.push({ at: a.takenAt, dimensionId: brightest(a), gold: false });
  if (g.dedicationNotes) for (const n of s.notes) petals.push({ at: n.createdAt, dimensionId: s.dimensionOf[n.dedicationId] ?? null, gold: false });
  if (g.livedChoices) for (const c of s.choices) if (c.livedAt) petals.push({ at: c.livedAt, dimensionId: c.dimensionIds[0] ?? null, gold: true });
  if (g.livedActions || g.milestones) {
    const dimensionOfIntention = (id: string | null) => s.intentions.find((i) => i.id === id)?.dimensionIds[0] ?? null;
    if (g.livedActions) {
      for (const a of s.weeklyActions) if (a.livedAt) petals.push({ at: a.livedAt, dimensionId: dimensionOfIntention(a.intentionId), gold: false });
      // A daily action that is one of her weekly actions already opened its petal above.
      for (const d of s.dailyActions) if (d.livedAt && !d.weeklyActionId) petals.push({ at: d.livedAt, dimensionId: dimensionOfIntention(d.intentionId), gold: false });
    }
    if (g.milestones) {
      for (const m of s.milestones) if (m.reachedAt) petals.push({ at: m.reachedAt, dimensionId: dimensionOfIntention(m.intentionId), gold: true });
      for (const i of s.intentions) if (i.reachedAt) petals.push({ at: i.reachedAt, dimensionId: i.dimensionIds[0] ?? null, gold: true });
    }
  }
  if (g.dailyActivities) for (const l of s.activities) petals.push({ at: l.at, dimensionId: s.dimensionOf[l.activityId] ?? null, gold: false });
  return petals.sort((a, b) => a.at.localeCompare(b.at));
}

/** Split petals into flowers of `petalsPerFlower`, the last one possibly still opening. */
function intoFlowers(petals: Petal[]): Petal[][] {
  const flowers: Petal[][] = [];
  for (let i = 0; i < petals.length; i += bloom.petalsPerFlower) flowers.push(petals.slice(i, i + bloom.petalsPerFlower));
  return flowers;
}

/** Her day one, at local midnight. */
function startOfDay(iso: string) {
  const d = new Date(iso);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Every season from her first day until now, oldest first. The last one is
 * the season she is in. `firstDay` is when she joined (or her first petal).
 */
export function buildSeasons(petals: Petal[], firstDay: string | null, now = new Date()): Season[] {
  const start = startOfDay(firstDay ?? petals[0]?.at ?? now.toISOString());
  const length = bloom.seasonDays * DAY;
  const current = Math.max(0, Math.floor((now.getTime() - start.getTime()) / length));
  const bySeason: Petal[][] = Array.from({ length: current + 1 }, () => []);
  for (const p of petals) {
    const i = Math.min(current, Math.max(0, Math.floor((new Date(p.at).getTime() - start.getTime()) / length)));
    bySeason[i].push(p);
  }
  return bySeason.map((ps, index) => ({
    index,
    startsAt: new Date(start.getTime() + index * length),
    endsAt: new Date(start.getTime() + (index + 1) * length),
    flowers: intoFlowers(ps),
    petals: ps.length,
    finished: index < current,
  }));
}

/** The flower she's growing now, and how many are finished this season. */
export function currentFlower(season: Season) {
  const last = season.flowers.at(-1);
  const opening = last && last.length < bloom.petalsPerFlower ? last : [];
  const finished = season.flowers.length - (opening.length ? 1 : 0);
  return { opening, finished };
}
