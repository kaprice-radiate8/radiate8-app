"use client";

/**
 * ONBOARDING (web address: /welcome)
 *
 * Four gentle screens the first time someone opens the app:
 *   1. Welcome: the name and "Come back to yourself."
 *   2. The method: Reflect. Bloom. Become.
 *   3. The Radiate 8 wheel, filling softly
 *   4. "What should we call you?"
 *
 * The words come from the Radiate 8 brand guide. Edit them in `steps` below.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { brand } from "@/config/app.config";
import { store, useStoreData, type WheelScores } from "@/lib/data";
import { MicroMark } from "../MicroMark";
import { PaleEight } from "../PaleEight";
import { Wheel } from "../wheel/Wheel";

const TOTAL_STEPS = 4;

/** The method, from the brand guide ("03 / The Method"). */
const method = [
  { word: "Reflect", text: "Notice what is present across your life, without judging what you find.", question: "How are you arriving today?" },
  { word: "Bloom", text: "Make room for creativity, connection and a small act of exploration.", question: "What would feel nourishing?" },
  { word: "Become", text: "Recognize the moments that show the life you are creating.", question: "What are you discovering?" },
];

/** Example fullness for the wheel preview on step 3. Not saved anywhere. */
const previewScores: WheelScores = {
  career: 6, health: 7, relationships: 8, joy: 5, growth: 7, stillness: 4, environment: 6, finances: 5,
};

export function Onboarding() {
  const router = useRouter();
  const { data: profile } = useStoreData((s) => s.getProfile());
  const [step, setStep] = useState(0);
  const [name, setName] = useState<string | null>(null);
  const [wheelScores, setWheelScores] = useState<WheelScores>({});

  // On the wheel step, let the petals fill a moment after it appears.
  useEffect(() => {
    if (step !== 2) return;
    const timer = setTimeout(() => setWheelScores(previewScores), 350);
    return () => {
      clearTimeout(timer);
      setWheelScores({});
    };
  }, [step]);

  const nameValue = name ?? profile?.name ?? "";

  async function finish(skipName = false) {
    const current = profile ?? { name: "", onboardedAt: null };
    await store.saveProfile({
      ...current,
      name: skipName ? current.name : nameValue.trim(),
      onboardedAt: current.onboardedAt ?? new Date().toISOString(),
    });
    router.replace("/");
  }

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="flex min-h-[calc(100dvh-3rem)] flex-col">
      {/* Top: back button and progress dots */}
      <div className="flex h-10 items-center justify-between">
        <button
          type="button"
          onClick={back}
          aria-label="Back"
          className={`-ml-2 rounded-full p-2 text-plum-soft transition-opacity duration-500 ${step === 0 ? "pointer-events-none opacity-0" : ""}`}
        >
          <ChevronLeft size={22} strokeWidth={1.4} />
        </button>
        <div className="flex items-center gap-2" aria-label={`Step ${step + 1} of ${TOTAL_STEPS}`}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-700 ${i === step ? "w-6 bg-gold" : i < step ? "w-1.5 bg-gold/60" : "w-1.5 bg-taupe/50"}`}
            />
          ))}
        </div>
        <span className="w-9" />
      </div>

      {/* Middle: the current step. `key` makes each step rise in fresh. */}
      <div key={step} className="rise flex flex-1 flex-col justify-center py-6">
        {step === 0 && (
          <div className="text-center">
            <div className="relative mx-auto flex h-56 w-40 items-center justify-center">
              <PaleEight size={220} className="absolute animate-breathe" />
              <MicroMark height={120} className="relative" />
            </div>
            <p className="mt-8 font-serif text-2xl tracking-[0.32em] text-plum uppercase">{brand.appName}</p>
            <h1 className="mt-6 font-serif text-[2.75rem] text-plum">{brand.tagline}</h1>
            <p className="mx-auto mt-4 max-w-xs text-plum-soft">{brand.promise}</p>
          </div>
        )}

        {step === 1 && (
          <div>
            <p className="label">A small daily ritual</p>
            <h1 className="mt-3 font-serif text-[2.6rem] text-plum">Reflect. Bloom. Become.</h1>
            <ol className="mt-8 space-y-6">
              {method.map((m, i) => (
                <li key={m.word} className="rise flex gap-4" style={{ animationDelay: `${200 + i * 180}ms` }}>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blush font-serif text-lg text-plum">{i + 1}</span>
                  <div>
                    <p className="font-serif text-2xl text-plum">{m.word}</p>
                    <p className="mt-1 text-plum-soft">{m.text}</p>
                    <p className="mt-1 font-serif text-lg text-plum italic">{m.question}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {step === 2 && (
          <div className="text-center">
            <div className="mx-auto w-full max-w-[300px]">
              <Wheel scores={wheelScores} decorative />
            </div>
            <p className="label mt-6">The Radiate 8</p>
            <h1 className="mt-3 font-serif text-4xl text-plum">Your whole life, in eight dimensions</h1>
            <p className="mx-auto mt-4 max-w-xs text-plum-soft">
              Notice what already feels full, and gently tend to what is asking for you.
            </p>
            <p className="mt-4 font-script text-4xl text-plum">One small moment is enough.</p>
          </div>
        )}

        {step === 3 && (
          <form
            id="name-form"
            onSubmit={(e) => {
              e.preventDefault();
              finish();
            }}
          >
            <p className="label">Before we begin</p>
            <h1 className="mt-3 font-serif text-[2.6rem] text-plum">What should we call you?</h1>
            <p className="mt-3 text-plum-soft">So we can greet you by name. It stays on this device.</p>
            <label htmlFor="welcome-name" className="sr-only">
              Your first name
            </label>
            <input
              id="welcome-name"
              value={nameValue}
              onChange={(e) => setName(e.target.value)}
              autoComplete="given-name"
              autoFocus
              placeholder="Your first name"
              className="mt-8 w-full border-b border-line bg-transparent pb-2 font-serif text-4xl text-plum outline-none placeholder:text-plum-soft/40 focus:border-plum"
            />
          </form>
        )}
      </div>

      {/* Bottom: one clear action */}
      <div className="space-y-3 pb-2">
        {step < TOTAL_STEPS - 1 ? (
          <button key="continue" type="button" onClick={next} className="w-full rounded-full bg-plum px-6 py-4 text-sm font-medium tracking-[0.2em] text-ivory uppercase transition-transform active:scale-[0.98]">
            {step === 0 ? "Begin" : "Continue"}
          </button>
        ) : (
          <>
            {/* A plain button (not "submit") so the tap that showed this step can't also press it */}
            <button key="come-in" type="button" onClick={() => finish()} className="w-full rounded-full bg-plum px-6 py-4 text-sm font-medium tracking-[0.2em] text-ivory uppercase transition-transform active:scale-[0.98]">
              Come in
            </button>
            <button type="button" onClick={() => finish(true)} className="w-full py-2 text-sm text-plum-soft">
              Skip for now
            </button>
          </>
        )}
      </div>
    </div>
  );
}
