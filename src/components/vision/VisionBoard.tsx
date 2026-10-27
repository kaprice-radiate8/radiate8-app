"use client";

/**
 * HER VISION BOARD (web address: /vision)
 *
 * A soft collage of what she's growing toward: photos and a few words,
 * each perhaps tagged with a dimension. Any image can become a 90-day
 * intention (on its own page). Photos are prepared on her phone first
 * (resized, location data removed) and kept private to her.
 */
import { useRef, useState } from "react";
import Link from "next/link";
import { ImagePlus, Type } from "lucide-react";
import { getDimension, type DimensionId } from "@/config/app.config";
import { store, useStoreData, type PreparedImage, type VisionItem } from "@/lib/data";
import { prepareImage } from "@/lib/images";
import { SaveNotice } from "../SaveNotice";
import { DimensionChoice } from "./DimensionChoice";

const primaryButton =
  "inline-flex items-center justify-center rounded-full bg-plum px-6 py-3 text-sm font-medium tracking-[0.12em] text-ivory uppercase transition-all active:scale-[0.98] disabled:opacity-40";

type Draft = { kind: "image"; image: PreparedImage; preview: string } | { kind: "words" };

export function VisionBoard() {
  const { data: items, ready } = useStoreData((s) => s.listVisionItems());
  const [draft, setDraft] = useState<Draft | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function choosePhoto(file: File | undefined) {
    if (!file) return;
    setProblem(null);
    try {
      const image = await prepareImage(file);
      setDraft({ kind: "image", image, preview: URL.createObjectURL(image.blob) });
    } catch {
      setProblem("That photo couldn't be opened. Please try another one.");
    }
  }

  function close() {
    if (draft?.kind === "image") URL.revokeObjectURL(draft.preview);
    setDraft(null);
  }

  if (!ready) return null;
  const board = items ?? [];

  return (
    <div className="space-y-6">
      <header className="text-center">
        <p className="label">Vision</p>
        <h1 className="mt-2 font-serif text-4xl text-plum">Your vision board</h1>
        <p className="mx-auto mt-3 max-w-xs text-plum-soft">What you&rsquo;re growing toward, gathered in one place. Any image can become a 90-day intention.</p>
      </header>

      {/* Hidden: the "Add a photo" button opens her camera or library. */}
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-label="Choose a photo"
        tabIndex={-1}
        onChange={(e) => {
          choosePhoto(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {draft ? (
        <Composer draft={draft} onDone={close} />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => fileInput.current?.click()} className="card flex flex-col items-center gap-2 px-4 py-5 text-plum transition-transform active:scale-[0.98]">
            <ImagePlus size={22} strokeWidth={1.4} />
            <span className="text-sm">Add a photo</span>
          </button>
          <button type="button" onClick={() => setDraft({ kind: "words" })} className="card flex flex-col items-center gap-2 px-4 py-5 text-plum transition-transform active:scale-[0.98]">
            <Type size={22} strokeWidth={1.4} />
            <span className="text-sm">Add words</span>
          </button>
        </div>
      )}
      <SaveNotice message={problem} />

      {board.length === 0 && !draft ? (
        <section className="rounded-[1.75rem] border border-dashed border-taupe/60 p-8 text-center">
          <h2 className="font-serif text-2xl text-plum">Your board is waiting</h2>
          <p className="mx-auto mt-2 max-w-xs text-sm text-plum-soft">
            What would you love your life to look and feel like? Begin with one image, or a few words.
          </p>
        </section>
      ) : (
        <ul className="columns-2 gap-3" aria-label="Your vision board">
          {board.map((item) => (
            <li key={item.id} className="mb-3 break-inside-avoid">
              <Tile item={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** One item on the board. Tap to open it. */
function Tile({ item }: { item: VisionItem }) {
  const d = item.dimensionId ? getDimension(item.dimensionId) : undefined;
  const label = item.words || (d ? `A photo for ${d.name}` : "A photo on your board");
  return (
    <Link href={`/vision/item?id=${item.id}`} aria-label={label} className="rise block">
      {item.kind === "image" ? (
        <figure className="overflow-hidden rounded-[1.25rem] bg-linen shadow-[0_14px_30px_-20px_rgb(75_48_74/0.45)]">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- private, short-lived links; not suited to the image optimizer
            <img src={item.imageUrl} alt={item.words || ""} className="block h-auto w-full" loading="lazy" />
          ) : (
            <div className="aspect-[4/5] w-full bg-blush/40" />
          )}
          {(item.words || item.intentionId) && (
            <figcaption className="space-y-1 px-3 py-2.5">
              {item.words && <span className="block font-serif text-base leading-snug text-plum">{item.words}</span>}
              {item.intentionId && <GoalMark />}
            </figcaption>
          )}
        </figure>
      ) : (
        <div className="rounded-[1.25rem] px-4 py-6 text-center shadow-[0_14px_30px_-20px_rgb(75_48_74/0.35)]" style={{ backgroundColor: d ? `${d.accent}2e` : "var(--r8-blush)" }}>
          <p className="font-serif text-xl leading-snug text-plum italic">{item.words}</p>
          {item.intentionId && (
            <div className="mt-3 flex justify-center">
              <GoalMark />
            </div>
          )}
        </div>
      )}
    </Link>
  );
}

function GoalMark() {
  return (
    <span className="inline-flex items-center gap-1.5 text-[0.65rem] tracking-[0.14em] text-plum uppercase">
      <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" /> 90-day intention
    </span>
  );
}

/** Adding a photo or words: a few words, a dimension if she likes, then keep it. */
function Composer({ draft, onDone }: { draft: Draft; onDone: () => void }) {
  const [words, setWords] = useState("");
  const [dimensionId, setDimensionId] = useState<DimensionId | null>(null);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const isWords = draft.kind === "words";

  async function keep() {
    setSaving(true);
    try {
      const details = { words: words.trim(), dimensionId };
      if (draft.kind === "image") await store.addVisionImage(draft.image, details);
      else await store.addVisionWords(details);
      onDone();
    } catch {
      setFailed(true);
      setSaving(false);
    }
  }

  return (
    <section className="card rise p-5" aria-label={isWords ? "Add words to your board" : "Add a photo to your board"}>
      {draft.kind === "image" && (
        // eslint-disable-next-line @next/next/no-img-element -- a local preview of the photo she just chose
        <img src={draft.preview} alt="The photo you chose" className="mx-auto max-h-80 w-auto rounded-2xl" />
      )}
      <label htmlFor="vision-words" className="label mt-5 block first:mt-0">
        {isWords ? "Your words" : "A few words, if you like"}
      </label>
      <textarea
        id="vision-words"
        value={words}
        onChange={(e) => setWords(e.target.value)}
        rows={isWords ? 3 : 2}
        autoFocus={isWords}
        placeholder={isWords ? "Unhurried mornings by the sea..." : "What this means to you..."}
        className="mt-2 w-full resize-none border-b border-line bg-transparent pb-2 font-serif text-xl text-plum outline-none placeholder:text-plum-soft/40 focus:border-plum"
      />
      <p className="label mt-5">Where in your life does it live?</p>
      <div className="mt-3">
        <DimensionChoice value={dimensionId} onChange={setDimensionId} />
      </div>
      <SaveNotice
        className="mt-4"
        message={failed ? "This didn't save, but it's still here. Please check your connection and try again." : null}
      />
      <div className="mt-6 flex items-center justify-end gap-2">
        <button type="button" onClick={onDone} className="rounded-full px-4 py-3 text-sm text-plum-soft">
          Cancel
        </button>
        <button type="button" onClick={keep} disabled={saving || (isWords && !words.trim())} className={primaryButton}>
          {saving ? "Keeping it safe..." : "Add to my board"}
        </button>
      </div>
    </section>
  );
}
