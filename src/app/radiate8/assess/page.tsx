/** THE RADIATE 8 ASSESSMENT (web address: /radiate8/assess) */
import type { Metadata } from "next";
import { AssessmentFlow } from "@/components/radiate8/AssessmentFlow";

export const metadata: Metadata = { title: "Your Radiate 8" };

export default function AssessPage() {
  return <AssessmentFlow />;
}
