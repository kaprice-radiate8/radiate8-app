"use client";

/**
 * REFLECT → BLOOM → BECOME (web address: /radiate8/explore)
 *
 * She chooses one or more dimensions, then moves through the three
 * movements with the brief's questions. Writing is kept as a draft while
 * she types. Any movement can be skipped. Become ends with a choice in
 * her own words, saved and shown back to her gently. This is guided
 * reflection, not a goal-setting worksheet: no deadlines, no checkboxes.
 */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, RefreshCw } from "lucide-react";
import { getDimension, movements, wordsFor, type DimensionId, type MovementId } from "@/config/app.config";
import { prompts } from "@/content/prompts";
import { store, useStoreData, type BecomeChoice } from "@/lib/data";
import { AutoGrowTextarea } from "../journal/AutoGrowTextarea";
import { DimensionPicker } from "../radiate8/DimensionPicker";
import { SaveNotice } from "../SaveNotice";

type Step = "choose" | MovementId | "done";

const primaryButton =
  "inline-flex w-full items-center justify-center rounded-full bg-plum px-6 py-3.5 text-sm font-medium tracking-[0.14em] text-ivory uppercase transition-all active:scale-[0.98] disabled:opacity-40";

/** Dimensions named in the link (?d=joy,career), if any. */
function fromLink(param: string | null): DimensionId[] {
  return (param ?? "")
    .split(",")
    .map((id) => getDimension(id)?.id)
    .filter((id): id is DimensionId => id !== undefined);
}

export function Journey() {
  const params = useSearchParams();
  const linked = fromLink(params.get("d"));
  const [chosen, setChosen] = useState<DimensionId[]>(linked);
  // Arriving with dimensions already chosen (from Today or a dimension page) starts at Reflect.
  const [step, setStep] = useState<Step>(linked.length ? "reflect" : "choose");
  const [savedChoice, setSavedChoice] = useState<BecomeChoice | null>(null);
  const { data: assessments } = useStoreData((s) => s.listAssessments());
  const latest = assessments?.[0];

  if (step === "choose") {
    return (
      <div>
        <Link href="/radiate8" className="-ml-1 inline-flex items-center gap-1 py-2 text-sm text-plum-soft">
          <ChevronLeft size={18} strokeWidth={1.4} /> Radiate 8
        </Link>
        <p className="label mt-4">Reflect, Bloom, Become</p>
        <h1 className="mt-3 font-serif text-4xl text-plum">What would you like to explore?</h1>
        <p className="mt-3 text-plum-soft">Choose one or more. You decide what matters now.</p>
        <div className="mt-6">
          <DimensionPicker
            selected={chosen}
            onChange={setChosen}
            hint={latest ? (id) => wordsFor(latest.places[id]) : undefined}
          />
        </div>
        <button type="button" disabled={chosen.length === 0} onClick={() => setStep("reflect")} className={`${primaryButton} mt-6`}>
          Begin with Reflect
        </button>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="flex min-h-[65dvh] flex-col justify-center text-center">
        <p className="label">Become</p>
        {savedChoice ? (
          <>
            <h1 className="mt-3 font-serif text-4xl text-plum">Your choice is saved</h1>
            <p className="mt-6 font-serif text-3xl leading-snug text-plum italic">&ldquo;{savedChoice.text}&rdquo;</p>
            <p className="mt-6 font-script text-4xl text-plum">Live it gently.</p>
          </>
        ) : (
          <>
            <h1 className="mt-3 font-serif text-4xl text-plum">Your reflections are saved</h1>
            <p className="mt-4 text-plum-soft">Come back to Become whenever a choice feels ready.</p>
          </>
        )}
        <div className="mt-8 space-y-3">
          <Link href="/radiate8" className={primaryButton}>
            Back to your Radiate 8
          </Link>
          {/* When Moments arrives, this becomes the main step: "Save a moment from today". */}
          <p className="text-sm text-plum-soft">Soon you&rsquo;ll be able to save a moment of living it, right here.</p>
        </div>
      </div>
    );
  }

  const index = movements.findIndex((m) => m.id === step);
  const next: Step = index < movements.length - 1 ? movements[index + 1].id : "done";
  return (
    <Movement
      key={step}
      movement={step}
      dimensionIds={chosen}
      onBack={() => setStep(index === 0 ? "choose" : movements[index - 1].id)}
      onDone={(choice) => {
        if (choice) setSavedChoice(choice);
        setStep(next);
      }}
    />
  );
}

/** One movement: a question, a page to write on, and (in Become) her choice. */
function Movement({
  movement,
  dimensionIds,
  onBack,
  onDone,
}: {
  movement: MovementId;
  dimensionIds: DimensionId[];
  onBack: () => void;
  onDone: (choice?: BecomeChoice) => void;
}) {
  const meta = movements.find((m) => m.id === movement)!;
  const list = prompts[movement];
  const [promptIndex, setPromptIndex] = useState(0);
  const prompt = list[promptIndex % list.length];
  const [text, setText] = useState("");
  const [choiceText, setChoiceText] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [draftsFailing, setDraftsFailing] = useState(false);
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftKey = `journey:${movement}:${[...dimensionIds].sort().join(",")}`;
  const isBecome = movement === "become";

  // Bring back any unfinished writing for this movement and these dimensions.
  useEffect(() => {
    let active = true;
    store.getDraft(draftKey).then((draft) => {
      if (active) setText(draft);
    });
    return () => {
      active = false;
    };
  }, [draftKey]);

  function onWrite(value: string) {
    setText(value);
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => {
      store.setDraft(draftKey, value).then(
        () => setDraftsFailing(false),
        () => setDraftsFailing(true),
      );
    }, 400);
  }

  async function saveAndContinue() {
    if (draftTimer.current) clearTimeout(draftTimer.current);
    const words = text.trim();
    const choice = choiceText.trim();
    setSaving(true);
    let saved: BecomeChoice | undefined;
    try {
      if (words) await store.addJournalEntry({ dimensionIds, movement, prompt, text: words });
      if (isBecome && choice) saved = await store.addBecomeChoice({ dimensionIds, text: choice });
    } catch {
      // Not saved: keep her words where they are and say so plainly.
      setSaveFailed(true);
      setSaving(false);
      return;
    }
    await store.setDraft(draftKey, "").catch(() => {});
    setSaving(false);
    onDone(saved);
  }

  const hasWords = text.trim().length > 0 || (isBecome && choiceText.trim().length > 0);

  return (
    <div>
      <div className="flex items-center justify-between">
        <button type="button" onClick={onBack} aria-label="Back" className="-ml-2 rounded-full p-2 text-plum-soft">
          <ChevronLeft size={22} strokeWidth={1.4} />
        </button>
        {/* Reflect · Bloom · Become, with where she is */}
        <ol className="flex items-center gap-2 text-[0.65rem] tracking-[0.18em] uppercase" aria-label="Movements">
          {movements.map((m) => (
            <li key={m.id} className={m.id === movement ? "font-medium text-plum" : "text-plum-soft/70"} aria-current={m.id === movement ? "step" : undefined}>
              {m.title}
            </li>
          ))}
        </ol>
        <span className="w-9" />
      </div>

      <div className="rise mt-6">
        <p className="flex flex-wrap gap-1.5">
          {dimensionIds.map((id) => {
            const d = getDimension(id)!;
            return (
              <span key={id} className="rounded-full px-2.5 py-1 text-xs text-plum" style={{ backgroundColor: `${d.accent}26` }}>
                {d.name}
              </span>
            );
          })}
        </p>
        <h1 className="mt-4 font-script text-6xl leading-none text-plum">{meta.title}</h1>

        <div key={promptIndex} className="rise mt-6">
          <p className="font-serif text-2xl leading-snug text-plum italic">{prompt}</p>
          {list.length > 1 && (
            <button
              type="button"
              onClick={() => setPromptIndex((i) => i + 1)}
              className="mt-2 inline-flex items-center gap-1.5 text-sm text-plum-soft transition-colors hover:text-plum"
            >
              <RefreshCw size={14} strokeWidth={1.6} /> Another question
            </button>
          )}
        </div>

        <div className="mt-5 overflow-hidden rounded-[1.5rem] shadow-[0_18px_40px_-24px_rgb(75_48_74/0.3)]">
          <AutoGrowTextarea
            aria-label={prompt}
            value={text}
            onChange={(e) => onWrite(e.target.value)}
            onDictate={onWrite}
            placeholder="Today, I am noticing..."
            minRows={6}
            className="px-5 pt-3 pb-6 pl-10 font-serif text-xl leading-8 text-plum outline-none placeholder:text-plum-soft/40"
          />
        </div>

        {isBecome && (
          <div className="mt-6">
            <label htmlFor="become-choice" className="label">
              Your choice, in a few words
            </label>
            <input
              id="become-choice"
              value={choiceText}
              onChange={(e) => setChoiceText(e.target.value)}
              placeholder="I choose to..."
              className="mt-2 w-full border-b border-line bg-transparent pb-2 font-serif text-2xl text-plum outline-none placeholder:text-plum-soft/40 focus:border-plum"
            />
          </div>
        )}
      </div>

      <SaveNotice
        className="mt-4"
        message={
          saveFailed
            ? "This didn't save, but your words are still here. Please try again in a moment."
            : draftsFailing
              ? "Drafts can't be kept on this device right now, so please save before you leave."
              : null
        }
      />

      <div className="mt-6 space-y-2">
        <button type="button" onClick={saveAndContinue} disabled={saving || !hasWords} className={primaryButton}>
          {isBecome ? "Save my choice" : `Save and continue to ${movements[movements.findIndex((m) => m.id === movement) + 1].title}`}
        </button>
        <button type="button" onClick={() => onDone()} className="w-full py-2 text-sm text-plum-soft">
          {isBecome ? "Not today" : "Skip for now"}
        </button>
      </div>
    </div>
  );
}
