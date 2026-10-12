/** COMPARE TWO REFLECTIONS (web address: /radiate8/compare) */
import type { Metadata } from "next";
import { Suspense } from "react";
import { CompareScreen } from "@/components/radiate8/CompareScreen";

export const metadata: Metadata = { title: "See what's changed" };

export default function ComparePage() {
  // The screen reads the address (?with=...), which is only known in the browser.
  return (
    <Suspense fallback={null}>
      <CompareScreen />
    </Suspense>
  );
}
