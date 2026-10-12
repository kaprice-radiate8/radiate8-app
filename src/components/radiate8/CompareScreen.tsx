"use client";

/**
 * COMPARE TWO REFLECTIONS (web address: /radiate8/compare)
 * Two Radiate 8s side by side (earlier on the left by default),
 * and what moved, in words only.
 * Nothing is "better" or "worse" here: just what she notices.
 */
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { dimensions, wordsFor } from "@/config/app.config";
import { useStoreData, type Assessment } from "@/lib/data";
import { longDate } from "@/lib/dates";
import { Icon } from "../Icon";
import { Wheel } from "../wheel/Wheel";

export function CompareScreen() {
  const params = useSearchParams();
  const { data: assessments, ready } = useStoreData((s) => s.listAssessments());
  // Which two to compare: the link that opened this page can name the earlier one.
  const [leftId, setLeftId] = useState<string | null>(params.get("with"));
  const [rightId, setRightId] = useState<string | null>(null);

  if (!ready) return null;
  const all = assessments ?? [];

  if (all.length < 2) {
    return (
      <div>
        <Back />
        <h1 className="mt-4 font-serif text-4xl text-plum">See what&rsquo;s changed</h1>
        <p className="mt-3 text-plum-soft">After you reflect on your Radiate 8 a second time, you can see the two side by side here.</p>
      </div>
    );
  }

  // Defaults: the newest on the right, the one before it on the left.
  const right = all.find((a) => a.id === rightId) ?? all[0];
  const left = all.find((a) => a.id === leftId && a.id !== right.id) ?? all.find((a) => a.id !== right.id)!;

  return (
    <div className="space-y-6">
      <Back />
      <header>
        <p className="label">The Radiate 8</p>
        <h1 className="mt-2 font-serif text-4xl text-plum">See what&rsquo;s changed</h1>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <Side assessment={left} all={all} onPick={setLeftId} />
        <Side assessment={right} all={all} onPick={setRightId} />
      </div>

      <ul className="card divide-y divide-line/70 px-5 py-1">
        {dimensions.map((d) => {
          const before = wordsFor(left.places[d.id]);
          const after = wordsFor(right.places[d.id]);
          return (
            <li key={d.id} className="flex gap-3 py-3.5">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${d.accent}22`, color: d.accent }}>
                <Icon name={d.icon} size={15} />
              </span>
              <span className="min-w-0">
                <span className="block font-serif text-lg leading-tight text-plum">{d.name}</span>
                <span className="block text-sm text-plum-soft">
                  {before === after ? (
                    <span className="italic">{after}</span>
                  ) : (
                    <>
                      <span className="italic">{before}</span> <span aria-hidden="true">→</span>
                      <span className="sr-only"> then </span> <span className="italic text-plum">{after}</span>
                    </>
                  )}
                </span>
              </span>
            </li>
          );
        })}
      </ul>

      {(left.noticing || right.noticing) && (
        <section className="space-y-3">
          <p className="label">What you noticed</p>
          {[left, right].map((a) =>
            a.noticing ? (
              <div key={a.id} className="card p-5">
                <p className="text-xs text-plum-soft">{longDate(a.takenAt)}</p>
                <p className="mt-1 font-serif text-lg whitespace-pre-wrap text-plum italic">{a.noticing}</p>
              </div>
            ) : null,
          )}
        </section>
      )}
    </div>
  );
}

function Back() {
  return (
    <Link href="/radiate8" className="-ml-1 inline-flex items-center gap-1 py-2 text-sm text-plum-soft">
      <ChevronLeft size={18} strokeWidth={1.4} /> Radiate 8
    </Link>
  );
}

function Side({ assessment, all, onPick }: { assessment: Assessment; all: Assessment[]; onPick: (id: string) => void }) {
  return (
    <div className="text-center">
      <Wheel scores={assessment.places} decorative />
      <label className="sr-only" htmlFor={`pick-${assessment.id}`}>
        Choose a reflection
      </label>
      <select
        id={`pick-${assessment.id}`}
        value={assessment.id}
        onChange={(e) => onPick(e.target.value)}
        className="mt-1 w-full rounded-full border border-line bg-linen/70 px-3 py-2 text-center text-xs text-plum"
      >
        {all.map((a) => (
          <option key={a.id} value={a.id}>
            {longDate(a.takenAt)}
          </option>
        ))}
      </select>
    </div>
  );
}
