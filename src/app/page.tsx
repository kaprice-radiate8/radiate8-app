/**
 * HOME / TODAY
 * The daily landing place: greeting, the flower she's growing, two gentle
 * invitations (shift how you feel, or take ten minutes for yourself), a mood
 * check-in, and a way into the day's focus. First-time visitors are sent
 * to the welcome screens first.
 */
import { Greeting } from "@/components/today/Greeting";
import { MoodCheckIn } from "@/components/today/MoodCheckIn";
import { AttentionPrompt } from "@/components/today/AttentionPrompt";
import { DedicationInvitation, FeelInvitation } from "@/components/today/Invitations";
import { OnboardingGate } from "@/components/onboarding/OnboardingGate";
import { BloomCard } from "@/components/bloom/BloomCard";
import { content, dimensionIndex } from "@/lib/content";

export default async function TodayPage() {
  const [activities, dedications, dimensionOf] = await Promise.all([content.listActivities(), content.listDedications(), dimensionIndex()]);
  return (
    <OnboardingGate>
      <div className="space-y-5">
        <Greeting />
        <div className="rise [animation-delay:120ms]">
          <BloomCard dimensionOf={dimensionOf} />
        </div>
        <div className="rise [animation-delay:200ms]">
          <FeelInvitation activities={activities} />
        </div>
        <div className="rise [animation-delay:280ms]">
          <DedicationInvitation dedications={dedications} />
        </div>
        <div className="rise [animation-delay:360ms]">
          <MoodCheckIn />
        </div>
        <div className="rise [animation-delay:440ms]">
          <AttentionPrompt />
        </div>
      </div>
    </OnboardingGate>
  );
}
