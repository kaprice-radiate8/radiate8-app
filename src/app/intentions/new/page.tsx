/** PLANT A 90-DAY INTENTION (web address: /intentions/new?from=<Become choice id>) */
import type { Metadata } from "next";
import { Suspense } from "react";
import { PlantIntention } from "@/components/intentions/PlantIntention";

export const metadata: Metadata = { title: "Plant an intention" };

export default function NewIntentionPage() {
  // Which Become choice it grows from is in the address, only known in the browser.
  return (
    <Suspense fallback={null}>
      <PlantIntention />
    </Suspense>
  );
}
