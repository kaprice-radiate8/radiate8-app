/**
 * HOME / TODAY
 * The daily landing place: greeting, today's song, a mood check-in,
 * and a gentle way into the day's focus.
 * First-time visitors are sent to the welcome screens first.
 */
import { Greeting } from "@/components/today/Greeting";
import { MoodCheckIn } from "@/components/today/MoodCheckIn";
import { AttentionPrompt } from "@/components/today/AttentionPrompt";
import { TodaysDedication } from "@/components/today/TodaysDedication";
import { OnboardingGate } from "@/components/onboarding/OnboardingGate";

export default function TodayPage() {
  return (
    <OnboardingGate>
      <div className="space-y-5">
        <Greeting />
        <div className="rise [animation-delay:120ms]">
          <TodaysDedication />
        </div>
        <div className="rise [animation-delay:220ms]">
          <MoodCheckIn />
        </div>
        <div className="rise [animation-delay:320ms]">
          <AttentionPrompt />
        </div>
      </div>
    </OnboardingGate>
  );
}
