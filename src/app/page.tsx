/**
 * HOME / TODAY
 * The daily landing place: greeting, two gentle invitations (shift how you
 * feel, or take ten minutes for yourself), a mood check-in, and a way into
 * the day's focus. First-time visitors are sent to the welcome screens first.
 */
import { Greeting } from "@/components/today/Greeting";
import { MoodCheckIn } from "@/components/today/MoodCheckIn";
import { AttentionPrompt } from "@/components/today/AttentionPrompt";
import { DedicationInvitation, FeelInvitation } from "@/components/today/Invitations";
import { OnboardingGate } from "@/components/onboarding/OnboardingGate";
import { content } from "@/lib/content";

export default async function TodayPage() {
  const [activities, dedications] = await Promise.all([content.listActivities(), content.listDedications()]);
  return (
    <OnboardingGate>
      <div className="space-y-5">
        <Greeting />
        <div className="rise [animation-delay:120ms]">
          <FeelInvitation activities={activities} />
        </div>
        <div className="rise [animation-delay:220ms]">
          <DedicationInvitation dedications={dedications} />
        </div>
        <div className="rise [animation-delay:320ms]">
          <MoodCheckIn />
        </div>
        <div className="rise [animation-delay:420ms]">
          <AttentionPrompt />
        </div>
      </div>
    </OnboardingGate>
  );
}
