/**
 * THE CONTENT SWITCH
 *
 * Screens get Daily Activities and Dedications from `content` below.
 * Today it reads the records written in src/content/. When the admin
 * system arrives, write a source with the same functions that reads
 * from it (for example, Supabase tables) and change the last line.
 * Only live content is ever returned: active, and published on or before today.
 */
import { activities } from "@/content/activities";
import { dedications } from "@/content/dedications";
import type { DimensionId, FeelingPathId } from "@/config/app.config";
import type { DailyActivity, Dedication } from "./types";

export interface ContentSource {
  listActivities(path?: FeelingPathId): Promise<DailyActivity[]>;
  getActivity(id: string): Promise<DailyActivity | undefined>;
  listDedications(): Promise<Dedication[]>;
  getDedication(id: string): Promise<Dedication | undefined>;
}

/** Active, and its publish day has arrived. */
function isLive(item: { active: boolean; publishOn: string }, today = new Date().toISOString().slice(0, 10)) {
  return item.active && item.publishOn <= today;
}

const localContent: ContentSource = {
  async listActivities(path) {
    return activities.filter((a) => isLive(a) && (!path || a.path === path));
  },
  async getActivity(id) {
    return activities.find((a) => a.id === id && isLive(a));
  },
  async listDedications() {
    return dedications.filter((d) => isLive(d));
  },
  async getDedication(id) {
    return dedications.find((d) => d.id === id && isLive(d));
  },
};

export const content: ContentSource = localContent;

/** The first dimension tag of every live activity and Dedication, by id (for petal colors). */
export async function dimensionIndex(): Promise<Record<string, DimensionId | undefined>> {
  const [acts, deds] = await Promise.all([content.listActivities(), content.listDedications()]);
  return Object.fromEntries([...acts, ...deds].map((x) => [x.id, x.dimensionTags[0]]));
}
