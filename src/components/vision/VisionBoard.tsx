"use client";

/**
 * HER VISION BOARD (web address: /vision)
 *
 * A collage of what she's growing toward: photos, words and stickers that
 * arrange themselves (tilted, overlapping, taped) until she arranges them
 * herself. Any photo or words can become a 90-day intention (on its own
 * page). Photos are prepared on her phone first (resized, location data
 * removed) and kept private to her.
 */
import { useRef, useState } from "react";
import { ImagePlus, Move, Type } from "lucide-react";
import type { DimensionId } from "@/config/app.config";
import { store, useStoreData, type PreparedImage } from "@/lib/data";
import { prepareImage } from "@/lib/images";
import { SaveNotice } from "../SaveNotice";
import { Collage } from "./Collage";
import { DimensionChoice } from "./DimensionChoice";

const primaryButton =
  "inline-flex items-center justify-center rounded-full bg-plum px-6 py-3 text-sm font-medium tracking-[0.12em] text-ivory uppercase transition-all active:scale-[0.98] disabled:opacity-40";

type Draft = { kind: "image"; image: PreparedImage; preview: string } | { kind: "words" };

export function VisionBoard() {
  const { data: items, ready } = useStoreData((s) => s.listVisionItems());
  const [draft, setDraft] = useState<Draft | null>(null);
  const [arranging, setArranging] = useState(false);
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
  const hasPieces = board.some((i) => i.kind !== "title");

  return (
    <div className={`space-y-5 ${arranging ? "pb-24" : ""}`}>
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
      ) : arranging ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-blush/50 px-4 py-3">
          <p className="text-sm text-plum">Drag, tilt and resize anything. It saves as you go.</p>
          <button type="button" onClick={() => setArranging(false)} className="shrink-0 rounded-full bg-plum px-5 py-2 text-sm font-medium text-ivory">
            Done
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          <button type="button" onClick={() => fileInput.current?.click()} className="card flex flex-col items-center gap-1.5 px-2 py-4 text-plum transition-transform active:scale-[0.98]">
            <ImagePlus size={21} strokeWidth={1.4} />
            <span className="text-xs">Add a photo</span>
          </button>
          <button type="button" onClick={() => setDraft({ kind: "words" })} className="card flex flex-col items-center gap-1.5 px-2 py-4 text-plum transition-transform active:scale-[0.98]">
            <Type size={21} strokeWidth={1.4} />
            <span className="text-xs">Add words</span>
          </button>
          <button
            type="button"
            disabled={!hasPieces}
            onClick={() => setArranging(true)}
            className="card flex flex-col items-center gap-1.5 px-2 py-4 text-plum transition-transform active:scale-[0.98] disabled:opacity-40"
          >
            <Move size={21} strokeWidth={1.4} />
            <span className="text-xs">Arrange</span>
          </button>
        </div>
      )}
      <SaveNotice message={problem} />

      {!hasPieces && !draft ? (
        <section className="rounded-[1.75rem] border border-dashed border-taupe/60 p-8 text-center">
          <h2 className="font-serif text-2xl text-plum">Your board is waiting</h2>
          <p className="mx-auto mt-2 max-w-xs text-sm text-plum-soft">
            What would you love your life to look and feel like? Begin with one image, or a few words. Your board arranges itself into a collage, and you can make it your own.
          </p>
        </section>
      ) : (
        <Collage items={board} arranging={arranging && !draft} />
      )}
    </div>
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
