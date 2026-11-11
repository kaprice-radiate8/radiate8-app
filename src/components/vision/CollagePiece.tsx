/**
 * ONE PIECE OF HER COLLAGE, in its look:
 *   photos:  polaroid, taped, torn paper, or a clean border
 *   words:   handwritten script, a torn paper label, cut-out letters, or typed on a strip
 *   the title, and stickers
 * Sizes are in `em`, and each piece's font size follows its width on the
 * board, so a piece looks the same at any size and on any screen.
 */
import { getDimension } from "@/config/app.config";
import type { VisionItem } from "@/lib/data";
import { accentOf, seed, styleOf } from "@/lib/collage";
import { StickerArt } from "./stickers";

/** Washi tape: a translucent strip with a soft stripe. */
export function Tape({ className, tint = "blush" }: { className?: string; tint?: "blush" | "gold" | "sage" }) {
  const colors = { blush: "rgb(227 184 179 / 0.75)", gold: "rgb(230 196 137 / 0.75)", sage: "rgb(169 179 154 / 0.75)" };
  return (
    <span
      aria-hidden="true"
      className={`absolute block h-[1.4em] w-[5em] ${className ?? ""}`}
      style={{
        background: `repeating-linear-gradient(45deg, ${colors[tint]} 0 0.4em, rgb(255 255 255 / 0.35) 0.4em 0.6em)`,
        clipPath: "polygon(3% 0, 97% 4%, 100% 50%, 96% 100%, 2% 96%, 0 50%)",
      }}
    />
  );
}

/** Torn-paper edges for a clip-path, steady for each item. */
function tornEdge(id: string) {
  const points: string[] = [];
  const n = seed(id);
  for (let i = 0; i <= 10; i++) points.push(`${i * 10}% ${(((n >> i) & 3) * 1.2).toFixed(1)}%`);
  for (let i = 10; i >= 0; i--) points.push(`${i * 10}% ${(100 - ((n >> (i + 3)) & 3) * 1.2).toFixed(1)}%`);
  return `polygon(${points.join(", ")})`;
}

const tapeTint = (id: string) => (["blush", "gold", "sage"] as const)[seed(id + "tape") % 3];

function Photo({ item }: { item: VisionItem }) {
  const ratio = Math.min(1.35, Math.max(0.7, item.aspect ?? 1.1));
  return item.imageUrl ? (
    // eslint-disable-next-line @next/next/no-img-element -- private, short-lived links; not suited to the image optimizer
    <img src={item.imageUrl} alt={item.words || ""} draggable={false} className="block w-full object-cover" style={{ aspectRatio: `1 / ${ratio}` }} />
  ) : (
    <span className="block w-full bg-blush/50" style={{ aspectRatio: `1 / ${ratio}` }} />
  );
}

export function CollagePiece({ item, linked }: { item: VisionItem; linked: boolean }) {
  const style = styleOf(item);
  const accent = accentOf(item);

  if (item.kind === "sticker") return <StickerArt id={item.sticker ?? ""} />;

  if (item.kind === "title") {
    return (
      <span className="relative block bg-linen px-[1em] py-[0.6em] text-center shadow-[0_0.4em_0.8em_-0.4em_rgb(75_48_74/0.4)]" style={{ clipPath: tornEdge(item.id) }}>
        <span className="block font-script text-[2em] leading-[1.1] text-plum">{item.words}</span>
      </span>
    );
  }

  const mark = linked && (
    <span className="absolute -top-[0.7em] -right-[0.5em] z-10 rounded-full border border-gold bg-ivory px-[0.6em] py-[0.15em] text-[0.55em] tracking-[0.12em] whitespace-nowrap text-plum uppercase shadow-sm">
      90 days
    </span>
  );

  if (item.kind === "image") {
    const corner = accent && (
      <span className="absolute -bottom-[0.9em] -left-[0.9em] z-10 block w-[2.6em]" aria-hidden="true">
        <StickerArt id={accent} />
      </span>
    );
    if (style === "polaroid") {
      return (
        <span className="relative block bg-white p-[0.45em] pb-[0.3em] shadow-[0_0.5em_1em_-0.5em_rgb(75_48_74/0.55)]">
          <Photo item={item} />
          <span className="block min-h-[1.6em] pt-[0.15em] text-center font-script text-[1.5em] leading-tight text-plum">{item.words}</span>
          <Tape className="-top-[0.7em] left-1/2 -translate-x-1/2 -rotate-3" tint={tapeTint(item.id)} />
          {mark}
          {corner}
        </span>
      );
    }
    if (style === "torn") {
      return (
        <span className="relative block">
          <span className="block bg-ivory p-[0.35em] shadow-[0_0.5em_1em_-0.5em_rgb(75_48_74/0.5)]" style={{ clipPath: tornEdge(item.id) }}>
            <Photo item={item} />
          </span>
          {item.words && <WordsLabel text={item.words} id={item.id} className="absolute -bottom-[0.9em] left-[8%] max-w-[84%]" />}
          {mark}
          {corner}
        </span>
      );
    }
    if (style === "tape") {
      return (
        <span className="relative block shadow-[0_0.5em_1em_-0.5em_rgb(75_48_74/0.55)]">
          <Photo item={item} />
          <Tape className="-top-[0.6em] -left-[1.2em] -rotate-[35deg]" tint={tapeTint(item.id)} />
          <Tape className="-right-[1.2em] -bottom-[0.6em] -rotate-[35deg]" tint={tapeTint(item.id + "2")} />
          {item.words && <WordsLabel text={item.words} id={item.id} className="absolute bottom-[8%] left-[6%] max-w-[88%]" />}
          {mark}
          {corner}
        </span>
      );
    }
    // clean
    return (
      <span className="relative block">
        <span className="block border-[0.3em] border-ivory shadow-[0_0.5em_1em_-0.5em_rgb(75_48_74/0.5)]">
          <Photo item={item} />
        </span>
        {item.words && <WordsLabel text={item.words} id={item.id} className="absolute right-[6%] bottom-[6%] max-w-[88%]" />}
        {mark}
        {corner}
      </span>
    );
  }

  // ---- words ----
  const d = item.dimensionId ? getDimension(item.dimensionId) : undefined;
  if (style === "script") {
    return (
      <span className="relative block text-center">
        <span className="block font-script text-[2.1em] leading-[1.05] text-plum">{item.words}</span>
        <span aria-hidden="true" className="mx-auto mt-[0.1em] block h-[0.12em] w-[60%] rounded-full" style={{ backgroundColor: d?.accent ?? "var(--r8-gold)" }} />
        {mark}
      </span>
    );
  }
  if (style === "cutout") return <CutoutWords text={item.words} id={item.id} mark={mark} />;
  if (style === "typed") {
    return (
      <span className="relative block bg-white px-[0.7em] py-[0.5em] font-mono text-[0.95em] leading-snug text-plum shadow-[0_0.4em_0.8em_-0.4em_rgb(75_48_74/0.45)]">
        {item.words}
        <Tape className="-top-[0.6em] left-[10%] -rotate-6" tint={tapeTint(item.id)} />
        {mark}
      </span>
    );
  }
  // label: torn paper in the dimension's tint
  return (
    <span className="relative block">
      <span
        className="block px-[0.9em] py-[0.6em] text-center font-serif text-[1.25em] leading-snug text-plum italic shadow-[0_0.4em_0.8em_-0.4em_rgb(75_48_74/0.4)]"
        style={{ backgroundColor: d ? `color-mix(in srgb, ${d.accent} 30%, var(--r8-linen))` : "var(--r8-blush)", clipPath: tornEdge(item.id) }}
      >
        {item.words}
      </span>
      {mark}
    </span>
  );
}

/** A small torn-paper caption laid over a photo. */
function WordsLabel({ text, id, className }: { text: string; id: string; className?: string }) {
  return (
    <span className={`block bg-linen px-[0.5em] py-[0.15em] font-script text-[1.05em] leading-tight text-plum shadow-sm ${className ?? ""}`} style={{ clipPath: tornEdge(id + "label") }}>
      {text}
    </span>
  );
}

const CUTOUT_LOOKS = [
  "bg-ivory text-plum font-serif",
  "bg-plum text-ivory font-sans font-medium",
  "bg-blush text-plum font-serif italic",
  "bg-white text-plum font-mono",
  "bg-gold text-ivory font-serif",
  "bg-linen text-plum font-sans font-medium",
];

/** Magazine cut-out letters, each one its own little scrap. */
function CutoutWords({ text, id, mark }: { text: string; id: string; mark: React.ReactNode }) {
  const n = seed(id);
  return (
    <span className="relative flex flex-wrap justify-center gap-y-[0.2em]">
      <span className="sr-only">{text}</span>
      {text.split(" ").map((word, wi) => (
        <span key={wi} className="mx-[0.25em] inline-flex" aria-hidden="true">
          {[...word].map((ch, ci) => {
            const k = (n >> ((wi * 3 + ci) % 24)) + ci + wi;
            return (
              <span
                key={ci}
                className={`inline-block px-[0.12em] text-[1.35em] leading-[1.2] shadow-[0_0.1em_0.2em_rgb(75_48_74/0.3)] ${CUTOUT_LOOKS[k % CUTOUT_LOOKS.length]}`}
                style={{ transform: `rotate(${(k % 9) - 4}deg) translateY(${(k % 3) - 1}px)` }}
              >
                {ch}
              </span>
            );
          })}
        </span>
      ))}
      {mark}
    </span>
  );
}
