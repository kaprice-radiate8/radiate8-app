"use client";

/**
 * ONE DEDICATION (web address: /dedications/the-room-around-you)
 *
 * Read, listen or watch, then a practice, a question to leave with, and
 * an optional page to write on. Nothing to complete: it simply ends
 * with thanks for the time she gave herself.
 */
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Clock } from "lucide-react";
import { getDimension } from "@/config/app.config";
import type { Dedication } from "@/lib/content";
import { store, useStoreData } from "@/lib/data";
import { dayLabel } from "@/lib/dates";
import { Artwork } from "../Artwork";
import { AutoGrowTextarea } from "../journal/AutoGrowTextarea";
import { SaveNotice } from "../SaveNotice";

export function DedicationScreen({ dedication }: { dedication: Dedication }) {
  const d = dedication;

  return (
    <article>
      <Link href="/dedications" className="-ml-1 inline-flex items-center gap-1 py-2 text-sm text-plum-soft">
        <ChevronLeft size={18} strokeWidth={1.4} /> Dedications
      </Link>

      <header className="rise mt-4">
        <Artwork colors={d.artworkColors} url={d.artworkUrl} size={null} className="h-48 w-full rounded-[1.75rem]" />
        <p className="label mt-6">Dedication</p>
        <h1 className="mt-2 font-serif text-5xl leading-none text-plum">{d.title}</h1>
        <p className="mt-3 flex flex-wrap items-center gap-x-1.5 text-sm text-plum-soft">
          <Clock size={14} strokeWidth={1.6} aria-hidden="true" /> About {d.durationMinutes} minutes · {d.author}
        </p>
        {d.dimensionTags.length > 0 && (
          <p className="mt-3 flex flex-wrap gap-1.5">
            {d.dimensionTags.map((id) => {
              const dim = getDimension(id)!;
              return (
                <span key={id} className="rounded-full px-2.5 py-1 text-xs text-plum" style={{ backgroundColor: `${dim.accent}26` }}>
                  {dim.name}
                </span>
              );
            })}
          </p>
        )}
      </header>

      {d.audioUrl && <audio controls preload="none" src={d.audioUrl} className="mt-6 w-full" aria-label={`Listen to ${d.title}`} />}
      {d.videoUrl && <video controls preload="none" src={d.videoUrl} className="mt-6 w-full rounded-2xl" aria-label={`Watch ${d.title}`} />}

      <div className="rise mt-8 space-y-5 [animation-delay:150ms]">
        {d.body.map((p, i) => (
          <p key={i} className="font-serif text-xl leading-8 text-plum">
            {p}
          </p>
        ))}
      </div>

      {d.practice && (
        <section className="card mt-10 p-6">
          <p className="label">Practice</p>
          <h2 className="mt-2 font-serif text-3xl text-plum">{d.practice.title}</h2>
          <ol className="mt-4 space-y-3">
            {d.practice.steps.map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="font-serif text-xl leading-7 text-gold">{i + 1}</span>
                <span className="text-plum">{step}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="mt-10 text-center">
        <p className="label">To leave with</p>
        <p className="mt-3 font-serif text-3xl leading-snug text-plum italic">{d.reflection}</p>
      </section>

      {d.journalPrompt && <Writing dedication={d} />}

      <p className="mt-12 text-center font-script text-4xl text-plum">Thank you for this time.</p>
      <div className="mt-6 text-center">
        <Link href="/" className="text-sm text-plum-soft">
          Back to Today
        </Link>
      </div>
    </article>
  );
}

/** An optional page to write on, and what she wrote here before. */
function Writing({ dedication }: { dedication: Dedication }) {
  const { data: notes } = useStoreData((s) => s.listDedicationNotes(dedication.id));
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await store.addDedicationNote({ dedicationId: dedication.id, text: text.trim() });
    } catch {
      setSaveFailed(true);
      setSaving(false);
      return;
    }
    setSaveFailed(false);
    setSaving(false);
    setText("");
    setOpen(false);
  }

  return (
    <section className="mt-10">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full rounded-full border border-line py-3.5 text-sm tracking-[0.14em] text-plum uppercase transition-colors hover:border-taupe"
        >
          Write, if you like
        </button>
      ) : (
        <div className="rise">
          <p className="font-serif text-2xl leading-snug text-plum italic">{dedication.journalPrompt}</p>
          <div className="mt-4 overflow-hidden rounded-[1.5rem] shadow-[0_18px_40px_-24px_rgb(75_48_74/0.3)]">
            <AutoGrowTextarea
              aria-label={dedication.journalPrompt}
              value={text}
              onChange={(e) => setText(e.target.value)}
              minRows={5}
              autoFocus
              className="px-5 pt-3 pb-6 pl-10 font-serif text-xl leading-8 text-plum outline-none"
            />
          </div>
          <SaveNotice className="mt-4" message={saveFailed ? "This didn't save, but your words are still here. Please try again in a moment." : null} />
          <button
            type="button"
            onClick={save}
            disabled={saving || !text.trim()}
            className="mt-4 w-full rounded-full bg-plum px-6 py-3.5 text-sm font-medium tracking-[0.14em] text-ivory uppercase transition-all active:scale-[0.98] disabled:opacity-40"
          >
            Keep these words
          </button>
        </div>
      )}

      {notes && notes.length > 0 && (
        <ul className="mt-6 space-y-3">
          {notes.map((n) => (
            <li key={n.id} className="card px-5 py-4">
              <p className="label text-plum-soft">{dayLabel(n.createdAt)}</p>
              <p className="mt-2 font-serif text-xl leading-snug whitespace-pre-wrap text-plum">{n.text}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
