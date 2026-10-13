"use client";

import { useSyncExternalStore } from "react";
import { dayNumber } from "./content/pick";

const noSubscribe = () => () => {};

/**
 * Today's day number in her own time zone, so daily choices turn over at
 * her midnight. While pre-rendering on the server it is 0, then the
 * browser fills in the real day.
 */
export function useToday() {
  return useSyncExternalStore(noSubscribe, () => dayNumber(), () => 0);
}
