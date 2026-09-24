/**
 * Everything screens need from the data layer, in one import:
 *   import { store, useStoreData, todayKey } from "@/lib/data";
 */
export { store } from "./store";
export { useStoreData } from "./use-store-data";
export * from "./types";

/** Today's date as "YYYY-MM-DD" in the person's own time zone. */
export function todayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
