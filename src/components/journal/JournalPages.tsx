"use client";

/**
 * JOURNAL PAGES: everything written for one dimension, newest first,
 * gathered under the day it was written. Tap a page to read all of it,
 * edit it, or let it go.
 */
import { useState } from "react";
import { reflectionSections, type DimensionId } from "@/config/app.config";
import { store, useStoreData, type JournalEntry } from "@/lib/data";
import { AutoGrowTextarea } from "./AutoGrowTextarea";

function dayLabel(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: date.getFullYear() === today.getFullYear() ? undefined : "numeric" });
}

export function JournalPages({ dimensionId }: { dimensionId: DimensionId }) {
  const { data: pages, ready } = useStoreData((s) => s.listJournal(dimensionId));

  if (!ready) return null;

  // Group pages by the day they were written.
  const groups: { label: string; pages: JournalEntry[] }[] = [];
  for (const page of pages ?? []) {
    const label = dayLabel(page.createdAt);
    const last = groups[groups.length - 1];
    if (last?.label === label) last.pages.push(page);
    else groups.push({ label, pages: [page] });
  }

  return (
    <section>
      <div className="flex items-baseline justify-between">
        <p className="label">Your pages</p>
        {pages && pages.length > 0 && (
          <p className="text-sm text-plum-soft">
            {pages.length} {pages.length === 1 ? "page" : "pages"} written
          </p>
        )}
      </div>

      {groups.length === 0 ? (
        <p className="mt-4 font-serif text-lg text-plum-soft italic">Your pages will gather here, one reflection at a time.</p>
      ) : (
        <div className="mt-4 space-y-6">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="mb-2 font-serif text-lg text-plum">{group.label}</p>
              <ul className="space-y-3">
                {group.pages.map((page) => (
                  <JournalPage key={page.id} page={page} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function JournalPage({ page }: { page: JournalEntry }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const section = reflectionSections.find((s) => s.id === page.sectionId);
  const time = new Date(page.createdAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  async function saveEdit() {
    if (editing === null) return;
    const words = editing.trim();
    if (words) await store.updateJournalEntry(page.id, words);
    setEditing(null);
  }

  return (
    <li className="card overflow-hidden">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="block w-full p-5 text-left">
        <div className="flex items-baseline justify-between gap-3">
          <p className="label">{section?.title}</p>
          <p className="shrink-0 text-xs text-plum-soft">{time}</p>
        </div>
        <p className="mt-2 font-serif text-lg leading-snug text-plum-soft italic">{page.prompt}</p>
        {editing === null && (
          <p className={`mt-3 font-serif text-xl leading-8 whitespace-pre-wrap text-plum ${open ? "" : "line-clamp-3"}`}>{page.text}</p>
        )}
      </button>

      {editing !== null && (
        <div className="px-5 pb-5">
          <AutoGrowTextarea
            value={editing}
            onChange={(e) => setEditing(e.target.value)}
            minRows={4}
            autoFocus
            aria-label="Edit this page"
            className="rounded-xl px-3 pl-10 font-serif text-xl leading-8 text-plum outline-none"
          />
          <div className="mt-3 flex justify-end gap-2">
            <button type="button" onClick={() => setEditing(null)} className="rounded-full px-4 py-2 text-sm text-plum-soft">
              Cancel
            </button>
            <button type="button" onClick={saveEdit} className="rounded-full bg-plum px-5 py-2 text-sm font-medium text-ivory">
              Save changes
            </button>
          </div>
        </div>
      )}

      {/* Gentle actions, shown once a page is opened */}
      {open && editing === null && (
        <div className="flex items-center justify-end gap-2 border-t border-line/70 px-5 py-3">
          {confirmingDelete ? (
            <>
              <p className="mr-auto text-sm text-plum-soft">Let this page go? It can&apos;t be brought back.</p>
              <button type="button" onClick={() => setConfirmingDelete(false)} className="rounded-full px-3 py-1.5 text-sm text-plum">
                Keep it
              </button>
              <button type="button" onClick={() => store.deleteJournalEntry(page.id)} className="rounded-full bg-plum px-4 py-1.5 text-sm text-ivory">
                Let it go
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => setEditing(page.text)} className="rounded-full px-3 py-1.5 text-sm text-plum">
                Edit
              </button>
              <button type="button" onClick={() => setConfirmingDelete(true)} className="rounded-full px-3 py-1.5 text-sm text-plum-soft">
                Let it go
              </button>
            </>
          )}
        </div>
      )}
    </li>
  );
}
