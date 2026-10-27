"use client";

/**
 * ONE ITEM ON HER BOARD (web address: /vision/item?id=...)
 *
 * The image (or words) large, with her words and dimension. From here she
 * can make it a 90-day intention, link it to one she's already growing,
 * move it on the board, or remove it.
 */
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getDimension } from "@/config/app.config";
import { store, useStoreData, type VisionItem } from "@/lib/data";
import { IntentionCard } from "../intentions/IntentionList";
import { SaveNotice } from "../SaveNotice";
import { DimensionChoice } from "./DimensionChoice";

const TRY_AGAIN = "That didn't save. Please check your connection and try again.";

export function VisionItemScreen() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const { data, ready } = useStoreData(async (s) => {
    const [items, intentions] = await Promise.all([s.listVisionItems(), s.listIntentions()]);
    return { items, intentions };
  });
  const [problem, setProblem] = useState<string | null>(null);

  if (!ready || !data) return null;
  const index = data.items.findIndex((v) => v.id === id);
  const item = data.items[index];

  if (!item) {
    return (
      <div>
        <Back />
        <h1 className="mt-4 font-serif text-4xl text-plum">This isn&rsquo;t on your board</h1>
        <p className="mt-3 text-plum-soft">It may have been removed. Everything you&rsquo;ve gathered is on your vision board.</p>
      </div>
    );
  }

  const attempt = (save: () => Promise<unknown>) =>
    save().then(
      () => setProblem(null),
      () => setProblem(TRY_AGAIN),
    );

  const linked = data.intentions.find((i) => i.id === item.intentionId);
  const growing = data.intentions.filter((i) => i.status === "growing" && i.id !== item.intentionId);
  const ids = data.items.map((v) => v.id);
  /** Swap this item with its neighbour, keeping everything else in place. */
  const move = (by: -1 | 1) => {
    const next = [...ids];
    [next[index], next[index + by]] = [next[index + by], next[index]];
    return attempt(() => store.reorderVisionItems(next));
  };

  return (
    <div className="space-y-7">
      <div>
        <Back />
        <ItemView key={item.updatedAt} item={item} attempt={attempt} />
      </div>

      <SaveNotice message={problem} />

      <section>
        <p className="label">Where in your life it lives</p>
        <div className="mt-3">
          <DimensionChoice value={item.dimensionId} onChange={(dimensionId) => attempt(() => store.updateVisionItem(item.id, { dimensionId }))} />
        </div>
      </section>

      <section>
        <p className="label">90 days</p>
        {linked ? (
          <div className="mt-3 space-y-2">
            <IntentionCard intention={linked} />
            <button type="button" onClick={() => attempt(() => store.updateVisionItem(item.id, { intentionId: null }))} className="px-1 py-1 text-sm text-plum-soft">
              Unlink from this intention
            </button>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            <p className="text-plum-soft">Ready to grow toward this? Shape it into 90 days, with milestones and a small action for this week.</p>
            <Link
              href={`/intentions/new?vision=${item.id}${item.dimensionId ? `&d=${item.dimensionId}` : ""}`}
              className="flex w-full items-center justify-center rounded-full bg-plum px-6 py-3.5 text-sm font-medium tracking-[0.14em] text-ivory uppercase transition-all active:scale-[0.98]"
            >
              Make this a 90-day intention
            </Link>
            {growing.length > 0 && (
              <div className="pt-2">
                <p className="text-sm text-plum-soft">Or link it to an intention you&rsquo;re growing:</p>
                <ul className="mt-2 space-y-2">
                  {growing.map((i) => (
                    <li key={i.id}>
                      <button
                        type="button"
                        onClick={() => attempt(() => store.updateVisionItem(item.id, { intentionId: i.id }))}
                        className="w-full rounded-2xl border border-line/80 bg-linen/60 px-4 py-3 text-left font-serif text-lg text-plum transition-colors hover:border-taupe"
                      >
                        {i.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      <Arrange canEarlier={index > 0} canLater={index < ids.length - 1} onMove={move} onRemove={() => store.deleteVisionItem(item.id)} />
    </div>
  );
}

function Back() {
  return (
    <Link href="/vision" className="-ml-1 inline-flex items-center gap-1 py-2 text-sm text-plum-soft">
      <ChevronLeft size={18} strokeWidth={1.4} /> Your vision board
    </Link>
  );
}

/** The item itself, with her words (tap Edit to change them). */
function ItemView({ item, attempt }: { item: VisionItem; attempt: (save: () => Promise<unknown>) => Promise<void> }) {
  const [editing, setEditing] = useState<string | null>(null);
  const d = item.dimensionId ? getDimension(item.dimensionId) : undefined;

  async function saveWords() {
    if (editing === null) return;
    // A words item needs its words; a photo's caption may be empty.
    if (item.kind === "words" && !editing.trim()) return;
    await attempt(async () => {
      await store.updateVisionItem(item.id, { words: editing.trim() });
      setEditing(null);
    });
  }

  return (
    <div className="mt-4">
      {item.kind === "image" ? (
        item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- private, short-lived links; not suited to the image optimizer
          <img src={item.imageUrl} alt={item.words || "A photo on your vision board"} className="w-full rounded-[1.75rem] shadow-[0_18px_40px_-24px_rgb(75_48_74/0.45)]" />
        ) : (
          <div className="aspect-[4/5] w-full rounded-[1.75rem] bg-blush/40" />
        )
      ) : null}

      {editing !== null ? (
        <div className="mt-5">
          <textarea
            aria-label="Your words"
            value={editing}
            onChange={(e) => setEditing(e.target.value)}
            rows={3}
            autoFocus
            className="w-full resize-none border-b border-line bg-transparent pb-2 font-serif text-2xl text-plum outline-none focus:border-plum"
          />
          <div className="mt-3 flex justify-end gap-2">
            <button type="button" onClick={() => setEditing(null)} className="rounded-full px-4 py-2 text-sm text-plum-soft">
              Cancel
            </button>
            <button type="button" onClick={saveWords} className="rounded-full bg-plum px-5 py-2 text-sm font-medium text-ivory">
              Save changes
            </button>
          </div>
        </div>
      ) : item.kind === "words" ? (
        <div className="rounded-[1.75rem] px-6 py-10 text-center" style={{ backgroundColor: d ? `${d.accent}2e` : "var(--r8-blush)" }}>
          <h1 className="font-serif text-3xl leading-snug text-plum italic">{item.words}</h1>
        </div>
      ) : (
        item.words && <h1 className="mt-5 font-serif text-3xl leading-snug text-plum">{item.words}</h1>
      )}

      {editing === null && (
        <button type="button" onClick={() => setEditing(item.words)} className="mt-2 -ml-1 px-1 py-1 text-sm text-plum-soft">
          {item.kind === "image" && !item.words ? "Add a few words" : "Edit words"}
        </button>
      )}
    </div>
  );
}

/** Move it on the board, or remove it (asked once). */
function Arrange({
  canEarlier,
  canLater,
  onMove,
  onRemove,
}: {
  canEarlier: boolean;
  canLater: boolean;
  onMove: (by: -1 | 1) => void;
  onRemove: () => Promise<void>;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [failed, setFailed] = useState(false);

  async function remove() {
    try {
      await onRemove();
      router.replace("/vision");
    } catch {
      setConfirming(false);
      setFailed(true);
    }
  }

  return (
    <section className="border-t border-line/70 pt-6">
      {confirming ? (
        <div className="card p-5">
          <p className="font-serif text-xl text-plum">Remove this from your board?</p>
          <p className="mt-1 text-sm text-plum-soft">Any intention it&rsquo;s linked to stays as it is.</p>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setConfirming(false)} className="rounded-full px-4 py-2 text-sm text-plum">
              Keep it
            </button>
            <button type="button" onClick={remove} className="rounded-full bg-plum px-5 py-2 text-sm text-ivory">
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button type="button" disabled={!canEarlier} onClick={() => onMove(-1)} className="rounded-full border border-line px-4 py-2 text-sm text-plum disabled:opacity-30">
            Move earlier
          </button>
          <button type="button" disabled={!canLater} onClick={() => onMove(1)} className="rounded-full border border-line px-4 py-2 text-sm text-plum disabled:opacity-30">
            Move later
          </button>
          <button type="button" onClick={() => setConfirming(true)} className="rounded-full px-4 py-2 text-sm text-plum-soft">
            Remove from my board
          </button>
        </div>
      )}
      <SaveNotice className="mt-4" message={failed ? "This couldn't be removed just now. Please try again in a moment." : null} />
    </section>
  );
}
