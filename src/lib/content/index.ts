/**
 * Everything screens need for Daily Activities and Dedications, in one import:
 *   import { content, activityForToday } from "@/lib/content";
 */
export { content, dimensionIndex, type ContentSource } from "./source";
export { activityForToday, dedicationForToday, songLinks, dayNumber } from "./pick";
export * from "./types";
