/** ONE DEDICATION (web address: /dedications/the-room-around-you) */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DedicationScreen } from "@/components/dedications/DedicationScreen";
import { content } from "@/lib/content";

// Build every live Dedication ahead of time so it opens instantly and offline.
export async function generateStaticParams() {
  return (await content.listDedications()).map((d) => ({ id: d.id }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/dedications/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: (await content.getDedication(id))?.title };
}

export default async function OneDedicationPage({ params }: PageProps<"/dedications/[id]">) {
  const { id } = await params;
  const dedication = await content.getDedication(id);
  if (!dedication) notFound();
  return <DedicationScreen dedication={dedication} />;
}
