/** ONBOARDING (web address: /welcome) */
import { Suspense } from "react";
import { Onboarding } from "@/components/onboarding/Onboarding";

export const metadata = { title: "Welcome" };

export default function WelcomePage() {
  // Which step to open on is in the address (?step=name), only known in the browser.
  return (
    <Suspense fallback={null}>
      <Onboarding />
    </Suspense>
  );
}
