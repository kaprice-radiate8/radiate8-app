"use client";

/**
 * YOUR INTENTIONS (web address: /intentions)
 * The 90-day intentions she's growing, the ones resting, and the ones she
 * reached, kept for good. She chooses what to hold: the screen only
 * mentions a comfortable number, it never limits or nudges.
 */
import Link from "next/link";
import { intentions as rules } from "@/config/app.config";
import { useStoreData } from "@/lib/data";
import { byStatus } from "@/lib/intentions";
import { IntentionCard } from "./IntentionList";

const primaryLink =
  "flex w-full items-center justify-center rounded-full bg-plum px-6 py-3.5 text-sm font-medium tracking-[0.14em] text-ivory uppercase transition-all active:scale-[0.98]";

export function IntentionsHome() {
  const { data, ready } = useStoreData((s) => s.listIntentions());
  if (!ready) return null;
  const all = byStatus(data ?? []);
  const growing = all.filter((i) => i.status === "growing");
  const resting = all.filter((i) => i.status === "resting");
  const reached = all.filter((i) => i.status === "reached");

  return (
    <div className="space-y-8">
      <header className="text-center">
        <p className="label">Become</p>
        <h1 className="mt-2 font-serif text-4xl text-plum">Your intentions</h1>
        <p className="mx-auto mt-3 max-w-xs text-plum-soft">
          What you&rsquo;ve chosen to grow over 90 days, one small action at a time.
        </p>
      </header>

      {growing.length === 0 ? (
        <section className="card p-6 text-center">
          <h2 className="font-serif text-2xl text-plum">Nothing planted yet</h2>
          <p className="mt-2 text-sm text-plum-soft">
            Start from a Become choice, or from something you&rsquo;ve been longing for. You&rsquo;ll shape it into milestones and a few small
            actions for this week.
          </p>
        </section>
      ) : (
        <section>
          <p className="label">Growing now</p>
          <ul className="mt-3 space-y-3">
            {growing.map((i) => (
              <li key={i.id}>
                <IntentionCard intention={i} />
              </li>
            ))}
          </ul>
          {growing.length >= rules.comfortableIntentions && (
            <p className="mt-3 text-center text-sm text-plum-soft italic">
              Many women find {rules.comfortableIntentions} at a time feels spacious. You know what&rsquo;s right for you.
            </p>
          )}
        </section>
      )}

      <Link href="/intentions/new" className={primaryLink}>
        Plant an intention
      </Link>

      {reached.length > 0 && (
        <section>
          <p className="label">Reached</p>
          <ul className="mt-3 space-y-3">
            {reached.map((i) => (
              <li key={i.id}>
                <IntentionCard intention={i} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {resting.length > 0 && (
        <section>
          <p className="label">Resting</p>
          <p className="mt-1 text-sm text-plum-soft">Set down for now. Pick one back up whenever it feels right.</p>
          <ul className="mt-3 space-y-3">
            {resting.map((i) => (
              <li key={i.id}>
                <IntentionCard intention={i} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
