/** DAILY ACTIVITY: "How do you want to feel?" */
import type { Metadata } from "next";
import { FeelingChooser } from "@/components/activity/FeelingChooser";
import { content } from "@/lib/content";

export const metadata: Metadata = { title: "Daily Activity" };

export default async function ActivityPage() {
  return <FeelingChooser activities={await content.listActivities()} />;
}
