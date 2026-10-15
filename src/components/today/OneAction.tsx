"use client";

/**
 * ONE MEANINGFUL ACTION, on Today
 *
 * One small thing for today: one of this week's actions from an intention
 * she's growing, or something in her own words. When she has lived it, it
 * opens a petal. Nothing carries over and nothing is counted if she doesn't:
 * tomorrow simply asks again.
 */
import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { oneActionPrompt } from "@/content/prompts";
import { store, todayKey, useStoreData } from "@/lib/data";
import { thisWeek } from "@/lib/intentions";
import { SaveNotice } from "../SaveNotice";

const SUGGESTIONS = 3;

export function OneAction() {
  const today = todayKey();
  const { data, ready } = useStoreData(async (s) => {
    const [chosen, intentions, actions] = await Promise.all([s.getDailyAction(today), s.listIntentions(), s.listWeeklyActions()]);
    const growing = intentions.filter((i) => i.status === "growing");
    const titleOf = (id: string | null) => intentions.find((i) => i.id === id)?.title;
    const open = thisWeek(actions, today).filter((a) => !a.livedAt && growing.some((i) => i.id === a.intentionId));
    return { chosen, growing, open, titleOf };
  });
  const [ownWords, setOwnWords] = useState("");
  const [problem, setProblem] = useState<string | null>(null);

  const attempt = (save: () => Promise<unknown>) =>
    save().then(
      () => setProblem(null),
      () => setProblem("That didn't save. Please try again in a moment."),
    );

  if (!ready || !data) return null;
  const { chosen, growing, open, titleOf } = data;

  // ---- She has chosen today's action ----
  if (chosen) {
    const from = titleOf(chosen.intentionId);
    return (
      <section className={`card p-5 transition-shadow duration-700 ${chosen.livedAt ? "ring-1 ring-gold/60" : ""}`} aria-label="One meaningful action">
        <p className="label">One meaningful action</p>
        <p className="mt-2 font-serif text-2xl leading-snug text-plum">{chosen.text}</p>
        {from && <p className="mt-1 text-sm text-plum-soft">Toward &ldquo;{from}&rdquo;</p>}
        {chosen.livedAt ? (
          <div className="rise mt-4 flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-ivory" aria-hidden="true">
              <Check size={16} strokeWidth={2} />
            </span>
            <p className="flex-1 font-serif text-xl text-plum italic">Lived today. Beautifully done.</p>
            <button type="button" onClick={() => attempt(() => store.setDailyActionLived(today, false))} className="px-2 py-1 text-xs text-plum-soft">
              Not yet
            </button>
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => attempt(() => store.setDailyActionLived(today, true))}
              className="rounded-full bg-plum px-5 py-2.5 text-sm font-medium text-ivory transition-transform active:scale-[0.98]"
            >
              I lived this
            </button>
            <button type="button" onClick={() => attempt(() => store.clearDailyAction(today))} className="rounded-full px-4 py-2.5 text-sm text-plum-soft">
              Choose another
            </button>
          </div>
        )}
        <SaveNotice className="mt-4" message={problem} />
      </section>
    );
  }

  // ---- Nothing chosen yet: offer this week's actions, or her own words ----
  async function chooseOwn(e: React.FormEvent) {
    e.preventDefault();
    const text = ownWords.trim();
    if (!text) return;
    await attempt(async () => {
      await store.setDailyAction(today, { text, weeklyActionId: null, intentionId: null });
      setOwnWords("");
    });
  }

  return (
    <section className="card p-5" aria-label="One meaningful action">
      <p className="label">One meaningful action</p>
      <h2 className="mt-2 font-serif text-2xl text-plum">{oneActionPrompt}</h2>

      {open.length > 0 && (
        <ul className="mt-4 space-y-2">
          {open.slice(0, SUGGESTIONS).map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => attempt(() => store.setDailyAction(today, { text: a.title, weeklyActionId: a.id, intentionId: a.intentionId }))}
                className="w-full rounded-2xl bg-blush/50 px-4 py-3 text-left transition-all hover:bg-blush/80 active:scale-[0.99]"
              >
                <span className="block font-serif text-lg leading-snug text-plum">{a.title}</span>
                <span className="block text-xs text-plum-soft">From &ldquo;{titleOf(a.intentionId)}&rdquo;</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={chooseOwn} className="mt-4 flex items-center gap-2">
        <input
          aria-label="Today's action, in your own words"
          value={ownWords}
          onChange={(e) => setOwnWords(e.target.value)}
          placeholder={open.length ? "Or in your own words..." : "Today, I will..."}
          className="min-w-0 flex-1 border-b border-line bg-transparent py-2 font-serif text-lg text-plum outline-none placeholder:text-plum-soft/40 focus:border-plum"
        />
        <button type="submit" disabled={!ownWords.trim()} className="rounded-full border border-plum px-4 py-2 text-sm text-plum transition-opacity disabled:opacity-30">
          Choose
        </button>
      </form>

      {growing.length === 0 ? (
        <p className="mt-4 text-sm text-plum-soft">
          Want your days to grow toward something?{" "}
          <Link href="/intentions/new" className="text-plum underline decoration-gold underline-offset-4">
            Plant a 90-day intention
          </Link>
        </p>
      ) : (
        open.length === 0 && (
          <p className="mt-4 text-sm text-plum-soft">
            <Link href="/intentions" className="text-plum underline decoration-gold underline-offset-4">
              Add this week&rsquo;s actions
            </Link>{" "}
            to your intentions, and they&rsquo;ll be offered here.
          </p>
        )
      )}
      <SaveNotice className="mt-4" message={problem} />
    </section>
  );
}
