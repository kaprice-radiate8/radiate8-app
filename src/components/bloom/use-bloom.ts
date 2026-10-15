"use client";

/**
 * Her bloom, ready to draw: every season, the one she's in now, and what
 * she saw last time (so new petals and finished bouquets can be celebrated once).
 */
import type { DimensionId } from "@/config/app.config";
import { buildSeasons, collectPetals } from "@/lib/bloom";
import { useStoreData } from "@/lib/data";

export function useBloom(dimensionOf: Record<string, DimensionId | undefined>) {
  const { data, ready } = useStoreData(async (s) => {
    const [profile, journal, assessments, choices, notes, activities, seen, intentions, milestones, weeklyActions, dailyActions] = await Promise.all([
      s.getProfile(),
      s.listJournal(),
      s.listAssessments(),
      s.listBecomeChoices(),
      s.listDedicationNotes(),
      s.listActivityLog(),
      s.getBloomSeen(),
      s.listIntentions(),
      s.listMilestones(),
      s.listWeeklyActions(),
      s.listDailyActions(),
    ]);
    const petals = collectPetals({ journal, assessments, choices, notes, activities, intentions, milestones, weeklyActions, dailyActions, dimensionOf });
    const seasons = buildSeasons(petals, profile.onboardedAt);
    return { seasons, season: seasons.at(-1)!, totalPetals: petals.length, seen };
  });
  return { bloom: data, ready };
}
