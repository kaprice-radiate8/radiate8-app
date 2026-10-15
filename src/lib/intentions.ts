/**
 * 90-DAY INTENTIONS: the gentle arithmetic behind 90-day intentions.
 *
 * Only what she lived is ever counted. There is no "3 of 5", no overdue,
 * no percentage: an intention simply has a week it's in, and what she did.
 */
import { intentions as rules } from "@/config/app.config";
import type { Intention, WeeklyAction } from "./data/types";
import { daysBetween, dayKey, weekOf } from "./dates";

export const WEEKS_IN_INTENTION = Math.ceil(rules.days / 7);

/** Which week of its 90 days an intention is in (1 to 13), from today. */
export function weekNumber(intention: Intention, today = dayKey()): number {
  const days = Math.max(0, daysBetween(intention.startsOn, today));
  return Math.min(WEEKS_IN_INTENTION, Math.floor(days / 7) + 1);
}

/** Its 90 days have come full circle and she hasn't said how it went yet. */
export function cameFullCircle(intention: Intention, today = dayKey()): boolean {
  return intention.status === "growing" && today >= intention.endsOn;
}

/** This week's actions for an intention: the ones in the week that holds `today`. */
export function thisWeek(actions: WeeklyAction[], today = dayKey()) {
  const week = weekOf(today);
  return actions.filter((a) => a.weekOf === week);
}

/**
 * Actions from earlier weeks she hasn't lived yet. They are never shown as
 * missed; she's simply offered the chance to bring one forward if it still calls.
 */
export function stillWaiting(actions: WeeklyAction[], today = dayKey()) {
  const week = weekOf(today);
  return actions.filter((a) => a.weekOf < week && !a.livedAt);
}

/** Everything she lived, newest first. */
export function lived(actions: WeeklyAction[]) {
  return actions.filter((a) => a.livedAt).sort((a, b) => b.livedAt!.localeCompare(a.livedAt!));
}

/** Growing first (newest first), then resting, then reached. */
export function byStatus(intentions: Intention[]) {
  const rank = { growing: 0, resting: 1, reached: 2 } as const;
  return [...intentions].sort((a, b) => rank[a.status] - rank[b.status] || b.createdAt.localeCompare(a.createdAt));
}
