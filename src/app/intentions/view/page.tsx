/**
 * ONE 90-DAY INTENTION (web address: /intentions/view?id=...)
 * Intentions live on her device, so the page is built once and reads which
 * one to show from the address. That keeps it working offline.
 */
import type { Metadata } from "next";
import { Suspense } from "react";
import { IntentionScreen } from "@/components/intentions/IntentionScreen";

export const metadata: Metadata = { title: "Your intention" };

export default function IntentionPage() {
  return (
    <Suspense fallback={null}>
      <IntentionScreen />
    </Suspense>
  );
}
