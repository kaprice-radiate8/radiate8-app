/** REFLECT → BLOOM → BECOME (web address: /radiate8/explore?d=joy,career) */
import type { Metadata } from "next";
import { Suspense } from "react";
import { Journey } from "@/components/journey/Journey";

export const metadata: Metadata = { title: "Reflect, Bloom, Become" };

export default function ExplorePage() {
  // The journey reads which dimensions to explore from the address, only known in the browser.
  return (
    <Suspense fallback={null}>
      <Journey />
    </Suspense>
  );
}
