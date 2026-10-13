/** ONE DAILY ACTIVITY (web address: /activity/hand-on-heart) */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ActivityScreen } from "@/components/activity/ActivityScreen";
import { content } from "@/lib/content";

// Build every live activity ahead of time so it opens instantly and offline.
export async function generateStaticParams() {
  return (await content.listActivities()).map((a) => ({ id: a.id }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/activity/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: (await content.getActivity(id))?.title };
}

export default async function OneActivityPage({ params }: PageProps<"/activity/[id]">) {
  const { id } = await params;
  const activity = await content.getActivity(id);
  if (!activity) notFound();
  // "Try a different one": the next activity on the same path.
  const path = await content.listActivities(activity.path);
  const next = path[(path.findIndex((a) => a.id === id) + 1) % path.length];
  return <ActivityScreen key={id} activity={activity} anotherId={next.id === id ? undefined : next.id} />;
}
