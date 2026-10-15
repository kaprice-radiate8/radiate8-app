"use client";

/**
 * THE RADIATE 8 ASSESSMENT (web address: /radiate8/assess)
 *
 * One dimension at a time, she places where she feels she is today.
 * The place is kept as 0 to 10 so changes can be compared over time,
 * but she only ever sees gentle words. Then: "What do you notice?",
 * then she chooses where she'd like to place her attention.
 */
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { dimensions, wordsFor, type DimensionId } from "@/config/app.config";
import { noticingPrompts } from "@/content/prompts";
import { store, useStoreData } from "@/lib/data";
import { Icon } from "../Icon";
import { AutoGrowTextarea } from "../journal/AutoGrowTextarea";
import { SaveNotice } from "../SaveNotice";
import { Wheel } from "../wheel/Wheel";
import { DimensionPicker } from "./DimensionPicker";

const DIMENSION_STEPS = dimensions.length; // steps 0 to 7
const NOTICE_STEP = DIMENSION_STEPS; // step 8
const CHOOSE_STEP = DIMENSION_STEPS + 1; // step 9

const startingPlaces = Object.fromEntries(dimensions.map((d) => [d.id, 5])) as Record<DimensionId, number>;

const primaryButton =
  "inline-flex items-center justify-center rounded-full bg-plum px-6 py-3.5 text-sm font-medium tracking-[0.14em] text-ivory uppercase transition-all active:scale-[0.98] disabled:opacity-40";

export function AssessmentFlow() {
  const router = useRouter();
  const { data: past } = useStoreData((s) => s.listAssessments());
  // -1 = the gentle introduction
  const [step, setStep] = useState(-1);
  const [places, setPlaces] = useState(startingPlaces);
  const [notes, setNotes] = useState<Partial<Record<DimensionId, string>>>({});
  const [noticing, setNoticing] = useState("");
  const [chosen, setChosen] = useState<DimensionId[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  const isFirst = past !== undefined && past.length === 0;

  async function save() {
    setSaving(true);
    try {
      const cleanNotes = Object.fromEntries(
        Object.entries(notes).filter(([, v]) => v && v.trim()).map(([k, v]) => [k, v!.trim()]),
      ) as Partial<Record<DimensionId, string>>;
      await store.addAssessment({ places, notes: cleanNotes, noticing: noticing.trim() });
      setSaveFailed(false);
      setStep(CHOOSE_STEP);
    } catch {
      setSaveFailed(true);
    } finally {
      setSaving(false);
    }
  }

  // ---- Introduction ----
  if (step === -1) {
    return (
      <div className="flex min-h-[70dvh] flex-col justify-center">
        <p className="label">The Radiate 8</p>
        <h1 className="mt-3 font-serif text-[2.6rem] text-plum">{isFirst ? "Let\u2019s begin with where you are" : "Where are you today?"}</h1>
        <p className="mt-4 text-plum-soft">
          You&rsquo;ll move through eight dimensions of your life, one at a time. There is no perfect score here, and nothing to fix.
          Simply notice where you are today.
        </p>
        <div className="mx-auto mt-6 w-full max-w-[260px]">
          <Wheel scores={{}} decorative />
        </div>
        <button type="button" onClick={() => setStep(0)} className={`${primaryButton} mt-6 w-full`}>
          Begin
        </button>
        {!isFirst && (
          <Link href="/radiate8" className="mt-3 py-2 text-center text-sm text-plum-soft">
            Not now
          </Link>
        )}
      </div>
    );
  }

  // ---- After saving: where would she like to place her attention? ----
  if (step === CHOOSE_STEP) {
    return (
      <div>
        <p className="label">Saved to your Radiate 8</p>
        <h1 className="mt-3 font-serif text-4xl text-plum">Where would you like to place your attention?</h1>
        <p className="mt-3 text-plum-soft">Choose one or more. You decide what matters now.</p>
        <div className="mt-6">
          <DimensionPicker selected={chosen} onChange={setChosen} hint={(id) => wordsFor(places[id])} />
        </div>
        <button
          type="button"
          disabled={chosen.length === 0}
          onClick={() => router.push(`/radiate8/explore?d=${chosen.join(",")}`)}
          className={`${primaryButton} mt-6 w-full`}
        >
          Begin Reflect, Bloom, Become
        </button>
        <Link href="/radiate8" className="mt-3 block py-2 text-center text-sm text-plum-soft">
          Not now
        </Link>
      </div>
    );
  }

  // ---- What do you notice? ----
  if (step === NOTICE_STEP) {
    return (
      <div>
        <BackButton onClick={() => setStep(DIMENSION_STEPS - 1)} />
        <div className="mx-auto mt-2 w-full max-w-[280px]">
          <Wheel scores={places} decorative />
        </div>
        <h1 className="mt-4 font-serif text-4xl text-plum">What do you notice?</h1>
        <ul className="mt-3 space-y-1">
          {noticingPrompts.map((p) => (
            <li key={p} className="font-serif text-lg text-plum-soft italic">
              {p}
            </li>
          ))}
        </ul>
        <div className="mt-5 overflow-hidden rounded-[1.5rem] shadow-[0_18px_40px_-24px_rgb(75_48_74/0.3)]">
          <AutoGrowTextarea
            aria-label="What do you notice?"
            value={noticing}
            onChange={(e) => setNoticing(e.target.value)}
            onDictate={setNoticing}
            placeholder="I notice..."
            minRows={5}
            className="px-5 pt-3 pb-6 pl-10 font-serif text-xl leading-8 text-plum outline-none placeholder:text-plum-soft/40"
          />
        </div>
        <SaveNotice
          className="mt-4"
          message={saveFailed ? "This didn't save, but everything you placed is still here. Please try again in a moment." : null}
        />
        <button type="button" onClick={save} disabled={saving} className={`${primaryButton} mt-5 w-full`}>
          Save this reflection
        </button>
      </div>
    );
  }

  // ---- One dimension ----
  const d = dimensions[step];
  const value = places[d.id];
  return (
    <div>
      <div className="flex items-center justify-between">
        <BackButton onClick={() => setStep(step - 1)} />
        <Progress current={step} />
        <span className="w-9" />
      </div>

      <div key={d.id} className="rise mt-6">
        <span className="flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: `${d.accent}26`, color: d.accent }}>
          <Icon name={d.icon} size={26} />
        </span>
        <h1 className="mt-5 font-serif text-4xl text-plum">{d.name}</h1>
        <p className="mt-2 text-plum-soft">{d.subtitle}</p>

        <p className="label mt-8">Where do you feel you are today?</p>
        <p className="mt-3 min-h-10 font-serif text-3xl text-plum italic" aria-live="polite">
          {wordsFor(value)}
        </p>
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={value}
          onChange={(e) => setPlaces({ ...places, [d.id]: Number(e.target.value) })}
          aria-label={`Where you feel you are in ${d.name}`}
          aria-valuetext={wordsFor(value)}
          className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full"
          style={{
            accentColor: d.accent,
            background: `linear-gradient(to right, ${d.accent} ${value * 10}%, var(--r8-line) ${value * 10}%)`,
          }}
        />

        <label htmlFor={`note-${d.id}`} className="label mt-8 block">
          A few words, if you like
        </label>
        <input
          id={`note-${d.id}`}
          value={notes[d.id] ?? ""}
          onChange={(e) => setNotes({ ...notes, [d.id]: e.target.value })}
          placeholder="What comes to mind?"
          className="mt-2 w-full border-b border-line bg-transparent pb-2 font-serif text-xl text-plum outline-none placeholder:text-plum-soft/40 focus:border-plum"
        />
      </div>

      <button type="button" onClick={() => setStep(step + 1)} className={`${primaryButton} mt-10 w-full`}>
        Continue
      </button>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label="Back" className="-ml-2 rounded-full p-2 text-plum-soft">
      <ChevronLeft size={22} strokeWidth={1.4} />
    </button>
  );
}

/** Eight small dots, one per dimension. */
function Progress({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`Dimension ${current + 1} of ${DIMENSION_STEPS}`}>
      {dimensions.map((d, i) => (
        <span
          key={d.id}
          className={`h-1.5 rounded-full transition-all duration-500 ${i === current ? "w-5 bg-gold" : i < current ? "w-1.5 bg-gold/60" : "w-1.5 bg-taupe/50"}`}
        />
      ))}
    </div>
  );
}
