"use client";

/**
 * BECOME CHOICES
 * What she chose to live, shown back to her gently.
 * No deadlines, no checkmarks, no reminders: just her own words, kept.
 * When she has lived one, she can say so, and it opens a gold-edged petal.
 * When she's ready to live one, she can shape it into a 90-day intention.
 */
import { useState } from "react";
import Link from "next/link";
import { getDimension, type DimensionId } from "@/config/app.config";
import { store, useStoreData, type BecomeChoice } from "@/lib/data";
import { dayLabel } from "@/lib/dates";
import { SaveNotice } from "../SaveNotice";

export function BecomeChoices({ dimensionId, empty }: { dimensionId?: DimensionId; empty?: string }) {
  const { data: choices, ready } = useStoreData((s) => s.listBecomeChoices(dimensionId));
  if (!ready) return null;

  return (
    <section>
      <p className="label">Your Become choices</p>
      {!choices?.length ? (
        empty ? <p className="mt-3 font-serif text-lg text-plum-soft italic">{empty}</p> : null
      ) : (
        <ul className="mt-3 space-y-3">
          {choices.map((c) => (
            <Choice key={c.id} choice={c} />
          ))}
        </ul>
      )}
    </section>
  );
}

function Choice({ choice }: { choice: BecomeChoice }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  async function saveEdit() {
    if (editing === null) return;
    const words = editing.trim();
    if (words) {
      try {
        await store.updateBecomeChoice(choice.id, words);
      } catch {
        setProblem("Your change didn't save. It's still here, so please try again in a moment.");
        return;
      }
    }
    setProblem(null);
    setEditing(null);
  }

  async function setLived(lived: boolean) {
    try {
      await store.setBecomeChoiceLived(choice.id, lived);
      setProblem(null);
    } catch {
      setProblem("That didn't save. Please try again in a moment.");
    }
  }

  async function letGo() {
    try {
      await store.deleteBecomeChoice(choice.id);
    } catch {
      setProblem("This choice couldn't be let go just now. Please try again in a moment.");
      setConfirming(false);
    }
  }

  return (
    <li className="card overflow-hidden">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="block w-full p-5 text-left">
        <p className="flex flex-wrap items-center gap-x-2 text-xs text-plum-soft">
          <span>Chosen {dayLabel(choice.createdAt).toLowerCase() === "today" ? "today" : `on ${dayLabel(choice.createdAt)}`}</span>
          {choice.livedAt && (
            <span className="rounded-full border border-gold px-2 py-0.5 text-plum">
              Lived {dayLabel(choice.livedAt).toLowerCase() === "today" ? "today" : `on ${dayLabel(choice.livedAt)}`}
            </span>
          )}
        </p>
        {editing === null && <p className="mt-2 font-serif text-2xl leading-snug text-plum">{choice.text}</p>}
        <p className="mt-3 flex flex-wrap gap-1.5">
          {choice.dimensionIds.map((id) => {
            const d = getDimension(id);
            return d ? (
              <span key={id} className="rounded-full px-2.5 py-1 text-[0.7rem] text-plum" style={{ backgroundColor: `${d.accent}26` }}>
                {d.name}
              </span>
            ) : null;
          })}
        </p>
      </button>

      {editing !== null && (
        <div className="px-5 pb-5">
          <input
            value={editing}
            onChange={(e) => setEditing(e.target.value)}
            aria-label="Edit your choice"
            autoFocus
            className="w-full border-b border-line bg-transparent pb-2 font-serif text-2xl text-plum outline-none focus:border-plum"
          />
          <div className="mt-3 flex justify-end gap-2">
            <button type="button" onClick={() => { setEditing(null); setProblem(null); }} className="rounded-full px-4 py-2 text-sm text-plum-soft">
              Cancel
            </button>
            <button type="button" onClick={saveEdit} className="rounded-full bg-plum px-5 py-2 text-sm font-medium text-ivory">
              Save changes
            </button>
          </div>
        </div>
      )}

      {open && editing === null && !confirming && !choice.livedAt && (
        <Link href={`/intentions/new?from=${choice.id}`} className="mx-5 mb-3 flex items-center justify-center rounded-full bg-blush/60 px-4 py-2.5 text-sm text-plum">
          Shape it into a 90-day intention
        </Link>
      )}
      {open && editing === null && (
        <div className="flex items-center justify-end gap-2 border-t border-line/70 px-5 py-3">
          {confirming ? (
            <>
              <p className="mr-auto text-sm text-plum-soft">Let this choice go?</p>
              <button type="button" onClick={() => setConfirming(false)} className="rounded-full px-3 py-1.5 text-sm text-plum">
                Keep it
              </button>
              <button type="button" onClick={letGo} className="rounded-full bg-plum px-4 py-1.5 text-sm text-ivory">
                Let it go
              </button>
            </>
          ) : (
            <>
              {choice.livedAt ? (
                <button type="button" onClick={() => setLived(false)} className="mr-auto rounded-full px-3 py-1.5 text-sm text-plum-soft">
                  Not lived yet
                </button>
              ) : (
                <button type="button" onClick={() => setLived(true)} className="mr-auto rounded-full border border-gold px-4 py-1.5 text-sm text-plum">
                  I lived this
                </button>
              )}
              <button type="button" onClick={() => setEditing(choice.text)} className="rounded-full px-3 py-1.5 text-sm text-plum">
                Edit
              </button>
              <button type="button" onClick={() => setConfirming(true)} className="rounded-full px-3 py-1.5 text-sm text-plum-soft">
                Let it go
              </button>
            </>
          )}
        </div>
      )}
      <SaveNotice message={problem} className="mx-5 mb-5" />
    </li>
  );
}
