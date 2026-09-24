"use client";

/**
 * JOURNAL COMPOSER: the page you write on.
 *
 * - Choose one of the five reflection sections
 * - A gentle prompt to respond to ("Another prompt" moves to the next one)
 * - Ruled paper that keeps your words safe as you type (a draft is saved
 *   for each section, so you can leave and come back)
 * - "Save reflection" adds the page to this dimension's journal
 */
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowRight, RefreshCw } from "lucide-react";
import { reflectionSections, type Dimension, type ReflectionSectionId } from "@/config/app.config";
import { getPrompts } from "@/content/prompts";
import { store } from "@/lib/data";
import { AutoGrowTextarea } from "./AutoGrowTextarea";

const noSubscribe = () => () => {};
const todayLabel = () => new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

export function JournalComposer({ dimension }: { dimension: Dimension }) {
  const [sectionId, setSectionId] = useState<ReflectionSectionId>("celebrate");
  const [promptIndex, setPromptIndex] = useState(0);
  const [text, setText] = useState("");
  const [savedNote, setSavedNote] = useState(false);
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const draftKey = `${dimension.id}:${sectionId}`;
  const prompts = getPrompts(dimension.id, sectionId);
  const prompt = prompts[promptIndex % prompts.length];
  // Today's date, read on the device (blank while the page is pre-built on the server).
  const today = useSyncExternalStore(noSubscribe, todayLabel, () => "\u00a0");

  // When the section changes, bring back any unfinished writing for it.
  useEffect(() => {
    let active = true;
    store.getDraft(draftKey).then((draft) => {
      if (active) setText(draft);
    });
    return () => {
      active = false;
    };
  }, [draftKey]);

  // Save a draft shortly after typing pauses, so nothing is ever lost.
  function onWrite(value: string) {
    setText(value);
    setSavedNote(false);
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => store.setDraft(draftKey, value), 400);
  }

  function chooseSection(id: ReflectionSectionId) {
    if (draftTimer.current) {
      clearTimeout(draftTimer.current);
      store.setDraft(draftKey, text); // keep what was written in the section being left
    }
    setSectionId(id);
    setPromptIndex(0);
    setSavedNote(false);
  }

  async function save() {
    const words = text.trim();
    if (!words) return;
    if (draftTimer.current) clearTimeout(draftTimer.current);
    await store.addJournalEntry({ dimensionId: dimension.id, sectionId, prompt, text: words });
    await store.setDraft(draftKey, "");
    await store.logAttention(dimension.id, "reflection");
    setText("");
    setPromptIndex((i) => i + 1); // a fresh prompt for next time
    setSavedNote(true);
  }

  return (
    <section>
      {/* The five sections, as soft tabs you can scroll sideways */}
      <div className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none]">
        <div className="flex w-max gap-2" role="tablist" aria-label="Reflection sections">
          {reflectionSections.map((s, i) => {
            const active = s.id === sectionId;
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => chooseSection(s.id)}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm whitespace-nowrap transition-all duration-500 ${
                  active ? "border-plum bg-plum text-ivory" : "border-line bg-linen/70 text-plum-soft hover:border-taupe"
                }`}
              >
                <span className={`font-serif text-base ${active ? "text-gold" : "text-plum-soft/70"}`}>{i + 1}</span>
                {s.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* The prompt */}
      <div key={`${sectionId}-${promptIndex}`} className="rise mt-6">
        <p className="font-serif text-2xl leading-snug text-plum italic">{prompt}</p>
        <button
          type="button"
          onClick={() => setPromptIndex((i) => i + 1)}
          className="mt-2 inline-flex items-center gap-1.5 text-sm text-plum-soft transition-colors hover:text-plum"
        >
          <RefreshCw size={14} strokeWidth={1.6} /> Another prompt
        </button>
      </div>

      {/* The paper */}
      <div className="mt-5 overflow-hidden rounded-[1.5rem] shadow-[0_18px_40px_-24px_rgb(75_48_74/0.3)]">
        <p className="label bg-linen px-5 pt-5 pb-1 pl-10">{today}</p>
        <label htmlFor={`journal-${dimension.id}`} className="sr-only">
          Your reflection
        </label>
        <AutoGrowTextarea
          id={`journal-${dimension.id}`}
          value={text}
          onChange={(e) => onWrite(e.target.value)}
          placeholder="Today, I am noticing..."
          minRows={7}
          className="px-5 pt-0 pb-8 pl-10 font-serif text-xl leading-8 text-plum outline-none placeholder:text-plum-soft/40"
        />
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={save}
          disabled={!text.trim()}
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-plum px-5 py-3.5 text-sm font-medium tracking-[0.12em] text-ivory uppercase transition-all active:scale-95 disabled:opacity-40"
        >
          Save reflection <ArrowRight size={16} strokeWidth={1.6} />
        </button>
      </div>
      <p className="mt-3 text-right" aria-live="polite">
        {savedNote ? (
          <span className="rise inline-block font-serif text-lg text-plum italic">Saved to your journal.</span>
        ) : (
          <span className="text-xs text-plum-soft/80">Your words are kept safe on this device as you write.</span>
        )}
      </p>
    </section>
  );
}
