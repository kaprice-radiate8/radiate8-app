/** YOUR BLOOM: this season's flower, finished flowers and every bouquet */
import type { Metadata } from "next";
import { GardenScreen } from "@/components/bloom/GardenScreen";
import { dimensionIndex } from "@/lib/content";

export const metadata: Metadata = { title: "Your bloom" };

export default async function BloomPage() {
  return <GardenScreen dimensionOf={await dimensionIndex()} />;
}
