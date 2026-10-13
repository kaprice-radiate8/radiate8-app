/** DEDICATIONS: Today's Dedication, and others to discover */
import type { Metadata } from "next";
import { DedicationsHome } from "@/components/dedications/DedicationsHome";
import { content } from "@/lib/content";

export const metadata: Metadata = { title: "Dedications" };

export default async function DedicationsPage() {
  return <DedicationsHome dedications={await content.listDedications()} />;
}
