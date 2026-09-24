/**
 * JOURNAL PROMPTS
 *
 * Three prompts for each of the five reflection sections. In the journal,
 * the writer can tap "Another prompt" to move to the next one.
 *
 * {dimension} is replaced with the dimension's `phrase` from app.config.ts,
 * for example "your career" or "stillness and spirit".
 *
 * Voice (from the brand guide): an invitation, never a demand.
 * Warm, grounded, personal. No em dashes.
 *
 * To give one dimension its own prompts for a section, add them to
 * `dimensionPrompts` below. They are shown first, before the shared ones.
 */
import type { DimensionId, ReflectionSectionId } from "@/config/app.config";
import { getDimension } from "@/config/app.config";

const sharedPrompts: Record<ReflectionSectionId, string[]> = {
  celebrate: [
    "When it comes to {dimension}, what is already good, even in a small way?",
    "Name one moment lately when this part of your life felt full.",
    "What have you tended here that deserves to be honored?",
  ],
  see: [
    "When it comes to {dimension}, what feels true right now?",
    "What are you noticing, without needing to change it?",
    "What story have you been telling yourself here? Is it still yours?",
  ],
  release: [
    "What are you ready to set down around {dimension}?",
    "Which expectation feels heavier than it needs to be?",
    "What would it feel like to let this go, even a little?",
  ],
  keep: [
    "What do you want to keep close in this part of your life?",
    "Which habit, person, or belief is quietly holding you up?",
    "What feels like home here?",
  ],
  forward: [
    "What would feel nourishing for {dimension} this season?",
    "What is one small act of exploration you could try this week?",
    "Imagine {dimension} a year from now. What are you discovering?",
  ],
};

/** Optional extra prompts for a specific dimension and section. */
const dimensionPrompts: Partial<Record<DimensionId, Partial<Record<ReflectionSectionId, string[]>>>> = {
  health: { celebrate: ["What has your body carried you through lately?"] },
  relationships: { keep: ["Who makes you feel most like yourself?"] },
  stillness: { see: ["When did you last feel quiet inside? What was around you?"] },
  environment: { forward: ["What small change would make your space feel more like you?"] },
};

/** All prompts for one dimension and section, with {dimension} filled in. */
export function getPrompts(dimensionId: DimensionId, sectionId: ReflectionSectionId): string[] {
  const phrase = getDimension(dimensionId)?.phrase ?? "this part of your life";
  const list = [...(dimensionPrompts[dimensionId]?.[sectionId] ?? []), ...sharedPrompts[sectionId]];
  return list.map((p) => {
    const filled = p.replaceAll("{dimension}", phrase);
    // Capitalize if the phrase starts the sentence ("Joy a year from now" stays tidy).
    return filled.charAt(0).toUpperCase() + filled.slice(1);
  });
}
