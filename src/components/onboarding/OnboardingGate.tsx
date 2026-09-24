"use client";

/**
 * Sends first-time visitors to the welcome screens before Today.
 * Everyone who has finished (or skipped) onboarding goes straight in.
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStoreData } from "@/lib/data";

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: profile, ready } = useStoreData((s) => s.getProfile());
  const needsWelcome = ready && !profile?.onboardedAt;

  useEffect(() => {
    if (needsWelcome) router.replace("/welcome");
  }, [needsWelcome, router]);

  // Stay invisible until we know, so first-timers never see a flash of Today.
  return <div className={`transition-opacity duration-500 ${ready && !needsWelcome ? "opacity-100" : "opacity-0"}`}>{children}</div>;
}
