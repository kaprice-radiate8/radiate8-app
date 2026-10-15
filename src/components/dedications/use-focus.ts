"use client";

/**
 * The dimensions she's been focusing on lately: the intentions she's
 * growing, and her Become choices and reflections in the last 30 days. Used to gently personalize
 * Today's Dedication, never to assign anything.
 */
import type { DimensionId } from "@/config/app.config";
import { useStoreData } from "@/lib/data";

const RECENT_DAYS = 30;

export function useFocus(): DimensionId[] {
  const { data } = useStoreData(async (s) => {
    const since = new Date(Date.now() - RECENT_DAYS * 86_400_000).toISOString();
    const [choices, pages, intentions] = await Promise.all([s.listBecomeChoices(), s.listJournal(), s.listIntentions()]);
    const recent = [...choices, ...pages].filter((x) => x.createdAt >= since);
    const growing = intentions.filter((i) => i.status === "growing");
    return [...new Set([...growing, ...recent].flatMap((x) => x.dimensionIds))];
  });
  return data ?? [];
}
