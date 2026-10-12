/**
 * REFLECT → BLOOM → BECOME PROMPTS
 *
 * The questions come straight from the Radiate build brief. In the journey,
 * "Another question" moves to the next one in the list.
 *
 * Voice (from the brand guide): an invitation, never a demand.
 * Warm, grounded, personal. No em dashes.
 */
import type { MovementId } from "@/config/app.config";

export const prompts: Record<MovementId, string[]> = {
  reflect: [
    "Where am I now?",
    "What am I noticing?",
    "What feels alive here?",
    "What feels neglected?",
    "What am I grateful for?",
  ],
  bloom: [
    "What do I want?",
    "What would make this area of my life feel more alive?",
    "What would I love to experience, create, change, or explore?",
  ],
  become: [
    "What am I choosing?",
    "What experience, action, practice, conversation, adventure, or commitment could bring this intention to life?",
  ],
};

/** Gentle questions offered after an assessment ("What do you notice?"). */
export const noticingPrompts = [
  "What feels alive?",
  "What feels quiet or neglected?",
  "Does anything surprise you?",
];
