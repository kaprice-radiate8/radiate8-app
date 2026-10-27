"use client";

/**
 * PLANT A 90-DAY INTENTION (web address: /intentions/new?from=<choice id>)
 *
 * Four gentle steps: what she'd love to grow (and where in her life),
 * why it matters, a few milestones, and this week's first small actions.
 * Only the first step is needed; everything else can be left for later.
 * Arriving from a Become choice starts with her own words already there.
 * Arriving from her vision board (?vision=<item id>) shows the image, starts
 * with its words, and links the image to the new intention.
 */
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getDimension, intentions as rules, type DimensionId } from "@/config/app.config";
import { plantingPrompts as ask } from "@/content/prompts";
import { store, useStoreData, type VisionItem } from "@/lib/data";
import { dayKey, weekOf } from "@/lib/dates";
import { AutoGrowTextarea } from "../journal/AutoGrowTextarea";
import { DimensionPicker } from "../radiate8/DimensionPicker";
import { SaveNotice } from "../SaveNotice";

const STEPS = 4;

const primaryButton =
  "inline-flex w-full items-center justify-center rounded-full bg-plum px-6 py-3.5 text-sm font-medium tracking-[0.14em] text-ivory uppercase transition-all active:scale-[0.98] disabled:opacity-40";
const lineInput =
  "w-full border-b border-line bg-transparent pb-2 font-serif text-xl text-plum outline-none placeholder:text-plum-soft/40 focus:border-plum";

/** Dimensions named in the link (?d=joy,career), if any. */
function fromLink(param: string | null): DimensionId[] {
  return (param ?? "")
    .split(",")
    .map((id) => getDimension(id)?.id)
    .filter((id): id is DimensionId => id !== undefined);
}

export function PlantIntention() {
  const params = useSearchParams();
  const fromId = params.get("from");
  const visionId = params.get("vision");
  const { data, ready } = useStoreData(async (s) => {
    const [choices, visionItems] = await Promise.all([s.listBecomeChoices(), visionId ? s.listVisionItems() : Promise.resolve([])]);
    return { choices, visionItems };
  });
  if (!ready) return null;
  const choice = fromId ? data?.choices.find((c) => c.id === fromId) : undefined;
  const visionItem = visionId ? data?.visionItems.find((v) => v.id === visionId) : undefined;
  return (
    <Steps
      becomeChoiceId={choice?.id ?? null}
      visionItem={visionItem ?? null}
      startTitle={choice?.text ?? visionItem?.words ?? ""}
      startDimensions={choice?.dimensionIds ?? fromLink(params.get("d"))}
    />
  );
}

function Steps({
  becomeChoiceId,
  visionItem,
  startTitle,
  startDimensions,
}: {
  becomeChoiceId: string | null;
  visionItem: VisionItem | null;
  startTitle: string;
  startDimensions: DimensionId[];
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState(startTitle);
  const [dimensionIds, setDimensionIds] = useState(startDimensions);
  const [vision, setVision] = useState("");
  const [milestones, setMilestones] = useState<string[]>(Array(rules.milestonesAtPlanting).fill(""));
  const [actions, setActions] = useState<string[]>(Array(rules.actionsAtPlanting).fill(""));
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  const filled = (list: string[]) => list.map((t) => t.trim()).filter(Boolean);

  async function plant() {
    setSaving(true);
    try {
      const week = weekOf(dayKey());
      const saved = await store.addIntention(
        { title: title.trim(), vision: vision.trim(), dimensionIds, becomeChoiceId },
        filled(milestones),
        filled(actions).map((a) => ({ title: a, weekOf: week })),
      );
      // The intention is safely planted; if the link to her image doesn't save, she can link it from the board.
      if (visionItem) await store.updateVisionItem(visionItem.id, { intentionId: saved.id }).catch(() => {});
      router.replace(`/intentions/view?id=${saved.id}&planted=1`);
    } catch {
      // Not saved: everything she wrote stays on the screen.
      setSaveFailed(true);
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        {step === 0 ? (
          <Link href="/intentions" aria-label="Back" className="-ml-2 rounded-full p-2 text-plum-soft">
            <ChevronLeft size={22} strokeWidth={1.4} />
          </Link>
        ) : (
          <button type="button" onClick={() => setStep(step - 1)} aria-label="Back" className="-ml-2 rounded-full p-2 text-plum-soft">
            <ChevronLeft size={22} strokeWidth={1.4} />
          </button>
        )}
        <div className="flex items-center gap-1.5" aria-label={`Step ${step + 1} of ${STEPS}`}>
          {Array.from({ length: STEPS }, (_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? "w-5 bg-gold" : i < step ? "w-1.5 bg-gold/60" : "w-1.5 bg-taupe/50"}`} />
          ))}
        </div>
        <span className="w-9" />
      </div>

      <div key={step} className="rise mt-6">
        <p className="label">A 90-day intention</p>

        {step === 0 && (
          <>
            {visionItem?.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- private, short-lived links; not suited to the image optimizer
              <img src={visionItem.imageUrl} alt={visionItem.words || "From your vision board"} className="mt-4 max-h-56 w-auto rounded-2xl" />
            )}
            <h1 className="mt-3 font-serif text-4xl text-plum">{ask.title}</h1>
            <label htmlFor="intention-title" className="sr-only">
              Your intention
            </label>
            <input
              id="intention-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="I would love to..."
              className={`${lineInput} mt-6 text-2xl`}
            />
            <p className="label mt-8">Where in your life does it live?</p>
            <div className="mt-3">
              <DimensionPicker selected={dimensionIds} onChange={setDimensionIds} />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h1 className="mt-3 font-serif text-4xl text-plum">{ask.vision}</h1>
            <p className="mt-3 font-serif text-lg text-plum-soft italic">{ask.visionHint}</p>
            <div className="mt-5 overflow-hidden rounded-[1.5rem] shadow-[0_18px_40px_-24px_rgb(75_48_74/0.3)]">
              <AutoGrowTextarea
                aria-label={ask.vision}
                value={vision}
                onChange={(e) => setVision(e.target.value)}
                onDictate={setVision}
                placeholder="It matters because..."
                minRows={5}
                className="px-5 pt-3 pb-6 pl-10 font-serif text-xl leading-8 text-plum outline-none placeholder:text-plum-soft/40"
              />
            </div>
          </>
        )}

        {step === 2 && (
          <ListStep
            heading={ask.milestones}
            hint={ask.milestonesHint}
            items={milestones}
            onChange={setMilestones}
            label={(i) => `Milestone ${i + 1}`}
            placeholder={(i) => ["By the first month...", "Halfway there...", "By the end..."][i] ?? "And..."}
          />
        )}

        {step === 3 && (
          <ListStep
            heading={ask.actions}
            hint={ask.actionsHint}
            items={actions}
            onChange={setActions}
            label={(i) => `This week's action ${i + 1}`}
            placeholder={(i) => (i === 0 ? "This week, I will..." : "And perhaps...")}
          />
        )}
      </div>

      <SaveNotice
        className="mt-5"
        message={saveFailed ? "Your intention didn't save, but everything you wrote is still here. Please try again in a moment." : null}
      />

      <div className="mt-8">
        {step < STEPS - 1 ? (
          <button type="button" onClick={() => setStep(step + 1)} disabled={step === 0 && (!title.trim() || dimensionIds.length === 0)} className={primaryButton}>
            Continue
          </button>
        ) : (
          <button type="button" onClick={plant} disabled={saving} className={primaryButton}>
            Plant this intention
          </button>
        )}
      </div>
    </div>
  );
}

function ListStep({
  heading,
  hint,
  items,
  onChange,
  label,
  placeholder,
}: {
  heading: string;
  hint: string;
  items: string[];
  onChange: (items: string[]) => void;
  label: (i: number) => string;
  placeholder: (i: number) => string;
}) {
  return (
    <>
      <h1 className="mt-3 font-serif text-4xl text-plum">{heading}</h1>
      <p className="mt-3 text-plum-soft">{hint}</p>
      <ol className="mt-6 space-y-5">
        {items.map((value, i) => (
          <li key={i} className="flex items-baseline gap-3">
            <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-gold/70" />
            <input
              aria-label={label(i)}
              value={value}
              onChange={(e) => onChange(items.map((v, j) => (j === i ? e.target.value : v)))}
              placeholder={placeholder(i)}
              className={lineInput}
            />
          </li>
        ))}
      </ol>
    </>
  );
}
