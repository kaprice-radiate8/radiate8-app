/**
 * Everything screens need from the data layer, in one import:
 *   import { store, useStoreData, todayKey } from "@/lib/data";
 */
export { store } from "./store";
export { useStoreData } from "./use-store-data";
export { SaveError } from "./errors";
export * from "./types";

/** Today's date as "YYYY-MM-DD" in the person's own time zone. */
export { dayKey as todayKey } from "@/lib/dates";
