/**
 * DIMENSION DETAIL (web address: /dimension/career, /dimension/joy, ...)
 * One page is created for each of the 8 dimensions in app.config.ts.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dimensions, getDimension } from "@/config/app.config";
import { DimensionScreen } from "@/components/dimension/DimensionScreen";

// Build all 8 pages ahead of time so they open instantly and offline.
export function generateStaticParams() {
  return dimensions.map((d) => ({ id: d.id }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/dimension/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: getDimension(id)?.name };
}

export default async function DimensionPage({ params }: PageProps<"/dimension/[id]">) {
  const { id } = await params;
  const dimension = getDimension(id);
  if (!dimension) notFound();
  return <DimensionScreen dimensionId={dimension.id} />;
}
