/** YOUR 90-DAY INTENTIONS (web address: /intentions) */
import type { Metadata } from "next";
import { IntentionsHome } from "@/components/intentions/IntentionsHome";

export const metadata: Metadata = { title: "Your intentions" };

export default function IntentionsPage() {
  return <IntentionsHome />;
}
