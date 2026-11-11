"use client";

/**
 * HER COLLAGE, and ARRANGE MODE
 *
 * The board as a styled collage (see lib/collage.ts for where things sit).
 * Tapping a photo or words opens it. In Arrange mode she can drag anything
 * anywhere, tilt it, resize it, bring it to the front, change its look,
 * add stickers, rename the board, or let it arrange itself again.
 *
 * The first change in Arrange mode saves where everything sits, so the rest
 * of the board stays exactly as she sees it. New things she adds later start
 * below what she arranged.
 */
import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpToLine, Minus, Plus, RotateCcw, RotateCw, Sparkles, Trash2, Wand2 } from "lucide-react";
import { store, type VisionItem, type VisionLayout } from "@/lib/data";
import { arrange, clamp, defaultTitle, nextStyle, type Placed } from "@/lib/collage";
import { SaveNotice } from "../SaveNotice";
import { CollagePiece } from "./CollagePiece";
import { StickerArt, stickerById, stickers } from "./stickers";

const UNNAMED = "title:unnamed";
const ratioOf = (id: string | null) => stickerById(id)?.ratio ?? 1;

/** Each piece's lettering scales with its width on the board. */
function fontSizeFor(p: Placed) {
  const k = p.item.kind === "sticker" ? (stickerById(p.item.sticker)?.kind === "words" ? 0.09 : 0.1) : p.item.kind === "title" ? 0.06 : 0.1;
  return `${p.layout.w * k}cqw`;
}

function describe(item: VisionItem) {
  if (item.kind === "sticker") return `${stickerById(item.sticker)?.label ?? "A"} sticker`;
  if (item.kind === "title") return `Board title: ${item.words}`;
  return item.words || (item.kind === "image" ? "A photo on your board" : "Words on your board");
}

export function Collage({ items, arranging }: { items: VisionItem[]; arranging: boolean }) {
  const boardRef = useRef<HTMLUListElement>(null);
  const [overrides, setOverrides] = useState<Record<string, VisionLayout>>({});
  const overridesRef = useRef(overrides);
  const [selected, setSelected] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const drag = useRef<{ id: string; x: number; y: number; from: VisionLayout; moved: boolean } | null>(null);

  // Until she names it, the board shows a title of its own.
  const hasTitle = items.some((i) => i.kind === "title");
  const now = new Date().toISOString();
  const withTitle: VisionItem[] = hasTitle
    ? items
    : [
        ...items,
        { id: UNNAMED, kind: "title", words: defaultTitle(), imageUrl: null, aspect: null, sticker: null, style: null, layout: null, dimensionId: null, intentionId: null, position: 0, createdAt: now, updatedAt: now },
      ];
  const shown = withTitle.map((i) => (overrides[i.id] ? { ...i, layout: overrides[i.id] } : i));
  const { placed, height } = arrange(shown, ratioOf);
  const maxZ = Math.max(0, ...placed.map((p) => p.layout.z));
  const current = placed.find((p) => p.item.id === selected);

  const setOverride = (id: string, layout: VisionLayout) => {
    overridesRef.current = { ...overridesRef.current, [id]: layout };
    setOverrides(overridesRef.current);
  };

  const attempt = async (save: () => Promise<unknown>) => {
    try {
      await save();
      setProblem(null);
    } catch {
      setProblem("That change didn't save. Please check your connection and try again.");
    }
  };

  /**
   * Save where everything sits as she sees it now (with `id` at `layout`), so
   * one change never rearranges the rest. Only what isn't saved yet is written.
   */
  const keep = (id?: string, layout?: VisionLayout) =>
    attempt(async () => {
      const unsaved = placed.filter((p) => p.item.id !== UNNAMED && (!p.item.layout || overrides[p.item.id] || p.item.id === id));
      const changes = unsaved.map((p) => ({ id: p.item.id, layout: p.item.id === id && layout ? layout : p.layout }));
      if (changes.length) await store.saveVisionLayouts(changes);
      const unnamed = placed.find((p) => p.item.id === UNNAMED);
      if (unnamed) await store.setVisionTitle(unnamed.item.words, id === UNNAMED && layout ? layout : unnamed.layout);
    });

  const change = (p: Placed, layout: VisionLayout) => {
    setOverride(p.item.id, layout);
    return keep(p.item.id, layout);
  };

  // ---- dragging ----
  const onPointerDown = (e: React.PointerEvent, p: Placed) => {
    if (!arranging) return;
    e.preventDefault();
    setSelected(p.item.id);
    drag.current = { id: p.item.id, x: e.clientX, y: e.clientY, from: p.layout, moved: false };
    setDragging(p.item.id);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const board = boardRef.current;
    if (!d || !board) return;
    const unit = 100 / board.clientWidth;
    const dx = (e.clientX - d.x) * unit;
    const dy = (e.clientY - d.y) * unit;
    if (Math.abs(dx) + Math.abs(dy) > 0.6) d.moved = true;
    if (d.moved) setOverride(d.id, { ...d.from, x: clamp(d.from.x + dx, 0, 100), y: Math.max(0, d.from.y + dy) });
  };
  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    setDragging(null);
    if (d?.moved) keep(d.id, overridesRef.current[d.id]);
  };

  return (
    <div className="relative">
      <ul
        ref={boardRef}
        aria-label="Your vision board"
        className={`relative w-full overflow-hidden rounded-[1.75rem] bg-[#F7EDE2] shadow-[inset_0_0_0_1px_rgb(184_169_153/0.35),0_18px_40px_-28px_rgb(75_48_74/0.45)] ${arranging ? "ring-2 ring-gold/60 ring-offset-4 ring-offset-ivory" : ""}`}
        style={{
          aspectRatio: `100 / ${height}`,
          containerType: "inline-size",
          // A soft paper grain.
          backgroundImage: "radial-gradient(rgb(184 169 153 / 0.18) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
        }}
        onClick={(e) => {
          if (arranging && e.target === e.currentTarget) setSelected(null);
        }}
      >
        {placed.map((p) => {
          const { item, layout } = p;
          const opens = (item.kind === "image" || item.kind === "words") && item.id !== UNNAMED;
          const isSelected = arranging && selected === item.id;
          const piece = <CollagePiece item={item} linked={Boolean(item.intentionId)} />;
          return (
            <li
              key={item.id}
              className="absolute"
              style={{
                left: `${layout.x}%`,
                top: `${(layout.y / height) * 100}%`,
                width: `${layout.w}%`,
                transform: `translate(-50%, -50%) rotate(${layout.r}deg)`,
                zIndex: isSelected ? 5000 : Math.round(layout.z),
                fontSize: fontSizeFor(p),
                transition: dragging === item.id ? "none" : "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              {arranging ? (
                <button
                  type="button"
                  aria-label={`Select ${describe(item)}`}
                  aria-pressed={isSelected}
                  onPointerDown={(e) => onPointerDown(e, p)}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerUp}
                  onClick={() => setSelected(item.id)}
                  className={`block w-full cursor-grab touch-none text-left select-none active:cursor-grabbing ${isSelected ? "outline-2 outline-offset-4 outline-gold outline-dashed" : ""}`}
                >
                  {piece}
                </button>
              ) : opens ? (
                <Link href={`/vision/item?id=${item.id}`} aria-label={describe(item)} className="block">
                  {piece}
                </Link>
              ) : (
                <div aria-label={item.kind === "title" ? undefined : describe(item)} role={item.kind === "title" ? undefined : "img"}>
                  {piece}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <SaveNotice className="mt-4" message={problem} />

      {arranging && (
        <ArrangeBar
          current={current ?? null}
          onChange={(layout) => current && change(current, layout)}
          onFront={() => current && change(current, { ...current.layout, z: maxZ + 1 })}
          onStyle={() => {
            if (!current) return;
            const style = nextStyle(current.item);
            if (style) attempt(() => store.updateVisionItem(current.item.id, { style }));
          }}
          onRemove={() => {
            if (!current) return;
            setSelected(null);
            attempt(() => store.deleteVisionItem(current.item.id));
          }}
          onAddSticker={async (sticker) => {
            const board = boardRef.current;
            const rect = board?.getBoundingClientRect();
            // Where she's looking: the middle of the screen, on the board.
            const y = rect ? clamp(((window.innerHeight / 2 - rect.top) / rect.width) * 100, 10, height - 10) : 30;
            const words = stickerById(sticker)?.kind === "words";
            await keep();
            // A little scatter, so several stickers never land in one pile.
            const n = items.filter((i) => i.kind === "sticker").length;
            const x = clamp(25 + ((n * 37) % 50), 15, 85);
            await attempt(() =>
              store.addVisionSticker(sticker, { x, y: y + ((n * 29) % 17) - 8, w: words ? 40 : 18, r: ((n * 53) % 13) - 6, z: maxZ + 1 }),
            );
          }}
          onRename={(words) => {
            const title = placed.find((p) => p.item.kind === "title");
            return attempt(async () => {
              await keep();
              await store.setVisionTitle(words, title?.layout ?? null);
            });
          }}
          titleWords={placed.find((p) => p.item.kind === "title")?.item.words ?? defaultTitle()}
          onReset={() =>
            attempt(async () => {
              setOverrides((overridesRef.current = {}));
              setSelected(null);
              await store.saveVisionLayouts(items.map((i) => ({ id: i.id, layout: null })));
            })
          }
        />
      )}
    </div>
  );
}

/** Controls for Arrange mode: what to do with the selected piece, and with the board. */
function ArrangeBar({
  current,
  onChange,
  onFront,
  onStyle,
  onRemove,
  onAddSticker,
  onRename,
  titleWords,
  onReset,
}: {
  current: Placed | null;
  onChange: (layout: VisionLayout) => void;
  onFront: () => void;
  onStyle: () => void;
  onRemove: () => void;
  onAddSticker: (id: string) => void;
  onRename: (words: string) => Promise<void>;
  titleWords: string;
  onReset: () => void;
}) {
  const [tray, setTray] = useState(false);
  const [naming, setNaming] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const l = current?.layout;
  const tool = "flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[0.65rem] text-plum transition-colors hover:bg-blush/50 disabled:opacity-30";
  const kind = current?.item.kind;

  return (
    <>
      {/* Board actions, under the collage */}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={() => setTray((t) => !t)} aria-expanded={tray} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-linen/80 px-4 py-2 text-sm text-plum">
          <Sparkles size={15} strokeWidth={1.5} /> Add a sticker
        </button>
        <button type="button" onClick={() => setNaming(titleWords)} className="rounded-full border border-line bg-linen/80 px-4 py-2 text-sm text-plum">
          Rename board
        </button>
        <button type="button" onClick={() => setResetting(true)} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm text-plum-soft">
          <Wand2 size={15} strokeWidth={1.5} /> Arrange it for me
        </button>
      </div>

      {resetting && (
        <div className="card mt-3 p-4 text-center">
          <p className="text-sm text-plum">Let the board arrange itself again? Your photos, words and stickers all stay.</p>
          <div className="mt-3 flex justify-center gap-2">
            <button type="button" onClick={() => setResetting(false)} className="rounded-full px-4 py-2 text-sm text-plum">
              Keep my arrangement
            </button>
            <button
              type="button"
              onClick={() => {
                setResetting(false);
                onReset();
              }}
              className="rounded-full bg-plum px-4 py-2 text-sm text-ivory"
            >
              Arrange it for me
            </button>
          </div>
        </div>
      )}

      {naming !== null && (
        <form
          className="card mt-3 flex items-center gap-2 p-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!naming.trim()) return;
            await onRename(naming.trim());
            setNaming(null);
          }}
        >
          <input
            aria-label="Name your board"
            value={naming}
            onChange={(e) => setNaming(e.target.value)}
            autoFocus
            className="min-w-0 flex-1 border-b border-line bg-transparent py-1 font-script text-3xl text-plum outline-none focus:border-plum"
          />
          <button type="submit" className="rounded-full bg-plum px-4 py-2 text-sm text-ivory">
            Save title
          </button>
        </form>
      )}

      {tray && (
        <section className="card mt-3 p-4" aria-label="Stickers">
          <p className="label">Tap a sticker to add it</p>
          <ul className="mt-3 grid grid-cols-4 gap-3">
            {stickers.map((s) => (
              <li key={s.id} className={s.kind === "words" ? "col-span-2" : ""}>
                <button
                  type="button"
                  aria-label={s.label}
                  onClick={() => {
                    onAddSticker(s.id);
                    setTray(false);
                  }}
                  className="flex h-16 w-full items-center justify-center rounded-2xl bg-ivory-light p-2 transition-transform active:scale-95"
                  style={{ fontSize: s.kind === "words" ? "0.7rem" : "0.8rem" }}
                >
                  <span className={s.kind === "words" ? "" : "w-10"}>
                    <StickerArt id={s.id} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* The selected piece's tools, floating above the tab bar */}
      <div className="fixed inset-x-0 bottom-[calc(max(0.75rem,env(safe-area-inset-bottom))+4.75rem)] z-40 flex justify-center px-4">
        <div className="flex w-full max-w-md items-center justify-between rounded-2xl bg-linen/95 px-2 py-1.5 shadow-[0_12px_30px_-14px_rgb(75_48_74/0.55)] backdrop-blur" role="toolbar" aria-label="Arrange the selected piece">
          {current && l ? (
            <>
              <button type="button" className={tool} onClick={() => onChange({ ...l, r: l.r - 5 })}>
                <RotateCcw size={17} strokeWidth={1.5} /> Tilt left
              </button>
              <button type="button" className={tool} onClick={() => onChange({ ...l, r: l.r + 5 })}>
                <RotateCw size={17} strokeWidth={1.5} /> Tilt right
              </button>
              <button type="button" className={tool} disabled={l.w <= 8} onClick={() => onChange({ ...l, w: Math.max(8, l.w * 0.88) })}>
                <Minus size={17} strokeWidth={1.5} /> Smaller
              </button>
              <button type="button" className={tool} disabled={l.w >= 95} onClick={() => onChange({ ...l, w: Math.min(95, l.w * 1.12) })}>
                <Plus size={17} strokeWidth={1.5} /> Larger
              </button>
              <button type="button" className={tool} onClick={onFront}>
                <ArrowUpToLine size={17} strokeWidth={1.5} /> To front
              </button>
              {(kind === "image" || kind === "words") && (
                <button type="button" className={tool} onClick={onStyle}>
                  <Wand2 size={17} strokeWidth={1.5} /> Style
                </button>
              )}
              {kind === "sticker" && (
                <button type="button" className={tool} onClick={onRemove}>
                  <Trash2 size={17} strokeWidth={1.5} /> Remove
                </button>
              )}
            </>
          ) : (
            <p className="w-full py-2.5 text-center text-sm text-plum-soft">Tap anything on your board to move, tilt or resize it.</p>
          )}
        </div>
      </div>
    </>
  );
}
