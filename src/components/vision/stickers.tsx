/**
 * STICKERS FOR HER VISION BOARD
 *
 * Drawn for Radiate in its own palette (plum, gold, blush, ivory, sage, sea),
 * with a soft watercolor feel: shapes, a few coastal touches, short
 * affirmations, and a badge for each of the eight dimensions.
 * A sticker's `id` is saved with her board, so never rename one.
 */
import { dimensions } from "@/config/app.config";
import { Icon } from "../Icon";

type Sticker = {
  id: string;
  label: string;
  /** "art" is a drawing; "words" is an affirmation in lettering. */
  kind: "art" | "words";
  /** Width relative to height, for placing it (most are square). */
  ratio?: number;
};

export const stickers: Sticker[] = [
  { id: "star", label: "Gold star", kind: "art" },
  { id: "sparkle", label: "Sparkle", kind: "art" },
  { id: "heart", label: "Heart", kind: "art" },
  { id: "flower", label: "Watercolor flower", kind: "art" },
  { id: "bloom", label: "Blossom", kind: "art" },
  { id: "leaf", label: "Leaf sprig", kind: "art" },
  { id: "sun", label: "Sun", kind: "art" },
  { id: "moon", label: "Moon", kind: "art" },
  { id: "shell", label: "Shell", kind: "art" },
  { id: "wave", label: "Wave", kind: "art", ratio: 1.6 },
  { id: "bow", label: "Bow", kind: "art", ratio: 1.3 },
  { id: "today-i-will", label: "Today, I will.", kind: "words", ratio: 3.2 },
  { id: "i-am-becoming", label: "I am becoming", kind: "words", ratio: 3.4 },
  { id: "fully-alive", label: "Fully alive", kind: "words", ratio: 2.8 },
  { id: "yes-to-joy", label: "Yes to joy", kind: "words", ratio: 2.6 },
  { id: "reflect-bloom-become", label: "Reflect. Bloom. Become.", kind: "words", ratio: 4.2 },
  { id: "this-is-my-year", label: "This is my year", kind: "words", ratio: 3.4 },
  ...dimensions.map((d) => ({ id: `dimension-${d.id}`, label: d.name, kind: "art" as const })),
];

export const stickerById = (id: string | null) => stickers.find((s) => s.id === id);

/** Gold used on stickers: a touch lighter than the brand gold, so it glows on paper. */
const GOLD = "#C9964F";
const GOLD_LIGHT = "#E6C489";
const BLUSH = "#E3B8B3";
const ROSE = "#C99199";
const PLUM = "#4B304A";
const SAGE = "#A9B39A";
const SEA = "#8FB3B8";

export function StickerArt({ id }: { id: string }) {
  const s = stickerById(id);
  if (!s) return null;
  if (id.startsWith("dimension-")) return <DimensionBadge id={id.slice("dimension-".length)} />;
  if (s.kind === "words") return <Affirmation id={id} text={s.label} />;
  return (
    <svg viewBox={`0 0 ${100 * (s.ratio ?? 1)} 100`} className="block h-auto w-full drop-shadow-[0_3px_4px_rgb(75_48_74/0.25)]" aria-hidden="true">
      <Drawing id={id} />
    </svg>
  );
}

function Drawing({ id }: { id: string }) {
  switch (id) {
    case "star":
      return (
        <>
          <defs>
            <linearGradient id="st-g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={GOLD_LIGHT} />
              <stop offset="1" stopColor={GOLD} />
            </linearGradient>
          </defs>
          <path d="M50 6 L62 37 L95 38 L69 58 L78 91 L50 72 L22 91 L31 58 L5 38 L38 37 Z" fill="url(#st-g)" stroke="#fff" strokeWidth="5" strokeLinejoin="round" />
        </>
      );
    case "sparkle":
      return (
        <>
          <path d="M50 4 C54 34 66 46 96 50 C66 54 54 66 50 96 C46 66 34 54 4 50 C34 46 46 34 50 4 Z" fill={GOLD_LIGHT} stroke={GOLD} strokeWidth="2" />
          <path d="M80 10 C81 18 84 21 92 22 C84 23 81 26 80 34 C79 26 76 23 68 22 C76 21 79 18 80 10 Z" fill={GOLD} />
        </>
      );
    case "heart":
      return (
        <path
          d="M50 88 C20 66 6 50 6 32 C6 18 17 8 30 8 C39 8 46 13 50 21 C54 13 61 8 70 8 C83 8 94 18 94 32 C94 50 80 66 50 88 Z"
          fill={ROSE}
          stroke="#fff"
          strokeWidth="5"
          strokeLinejoin="round"
        />
      );
    case "flower":
    case "bloom": {
      const petal = id === "flower" ? BLUSH : "#F1D4CF";
      const center = id === "flower" ? GOLD : SAGE;
      return (
        <>
          <defs>
            <radialGradient id={`fl-${id}`} cx="50%" cy="70%" r="70%">
              <stop offset="0" stopColor="#fff" stopOpacity="0.7" />
              <stop offset="1" stopColor={petal} />
            </radialGradient>
          </defs>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="50" cy="28" rx="17" ry="25" fill={`url(#fl-${id})`} opacity="0.92" transform={`rotate(${a} 50 50)`} />
          ))}
          <circle cx="50" cy="50" r="11" fill={center} />
          <circle cx="46" cy="46" r="3" fill="#fff" opacity="0.6" />
        </>
      );
    }
    case "leaf":
      return (
        <>
          <path d="M20 90 C38 64 52 40 82 12" stroke="#7E8C6E" strokeWidth="4" fill="none" strokeLinecap="round" />
          {[
            [40, 64, -40],
            [52, 46, -45],
            [64, 30, -50],
            [34, 58, 50],
            [48, 40, 45],
            [62, 24, 40],
          ].map(([x, y, a], i) => (
            <ellipse key={i} cx={x} cy={y} rx="7" ry="15" fill={SAGE} opacity="0.9" transform={`rotate(${a} ${x} ${y})`} />
          ))}
        </>
      );
    case "sun":
      return (
        <>
          {Array.from({ length: 12 }, (_, i) => (
            <rect key={i} x="47" y="4" width="6" height="18" rx="3" fill={GOLD_LIGHT} transform={`rotate(${i * 30} 50 50)`} />
          ))}
          <circle cx="50" cy="50" r="24" fill={GOLD} />
          <circle cx="43" cy="43" r="7" fill="#fff" opacity="0.35" />
        </>
      );
    case "moon":
      return (
        <>
          <path d="M64 8 A42 42 0 1 0 92 70 A34 34 0 1 1 64 8 Z" fill={PLUM} />
          <circle cx="78" cy="22" r="3" fill={GOLD_LIGHT} />
          <circle cx="88" cy="40" r="2" fill={GOLD_LIGHT} />
        </>
      );
    case "shell":
      return (
        <>
          <path d="M50 90 L12 40 C20 18 34 8 50 8 C66 8 80 18 88 40 Z" fill="#F1D4CF" stroke={ROSE} strokeWidth="3" strokeLinejoin="round" />
          {[22, 36, 50, 64, 78].map((x) => (
            <path key={x} d={`M50 88 L${x} 14`} stroke={ROSE} strokeWidth="2.5" opacity="0.7" />
          ))}
          <rect x="40" y="84" width="20" height="10" rx="4" fill={ROSE} />
        </>
      );
    case "wave":
      return (
        <>
          <path d="M4 70 C24 40 44 40 56 60 C64 72 78 72 84 58 C92 40 120 30 156 50 L156 96 L4 96 Z" fill={SEA} opacity="0.85" />
          <path d="M4 82 C30 62 54 66 74 80 C96 94 126 86 156 70 L156 96 L4 96 Z" fill="#B9D0D2" />
          <path d="M60 52 C70 36 90 34 100 46" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" />
        </>
      );
    case "bow":
      return (
        <>
          <path d="M65 50 C40 20 10 20 12 44 C14 64 40 64 65 50 Z" fill={BLUSH} stroke={ROSE} strokeWidth="3" />
          <path d="M65 50 C90 20 120 20 118 44 C116 64 90 64 65 50 Z" fill={BLUSH} stroke={ROSE} strokeWidth="3" />
          <path d="M60 54 L46 92 L58 86 L64 96 L66 56 Z M70 54 L84 92 L72 86 L66 96 L64 56 Z" fill={ROSE} />
          <ellipse cx="65" cy="50" rx="9" ry="10" fill={ROSE} />
        </>
      );
    default:
      return null;
  }
}

/** A short affirmation, lettered like a sticker cut from paper. */
function Affirmation({ id, text }: { id: string; text: string }) {
  const looks: Record<string, string> = {
    "today-i-will": "bg-plum text-ivory font-serif italic",
    "i-am-becoming": "bg-ivory text-plum font-script",
    "fully-alive": "bg-gold text-ivory font-sans font-medium uppercase tracking-[0.18em]",
    "yes-to-joy": "bg-blush text-plum font-serif",
    "reflect-bloom-become": "bg-linen text-plum font-script",
    "this-is-my-year": "bg-ivory text-plum font-sans font-medium uppercase tracking-[0.14em]",
  };
  const script = looks[id]?.includes("font-script");
  return (
    <span
      className={`block rounded-[0.3em] px-[0.6em] py-[0.25em] text-center leading-tight whitespace-nowrap shadow-[0_3px_6px_-2px_rgb(75_48_74/0.35)] outline outline-[0.12em] outline-white ${looks[id] ?? "bg-ivory text-plum"}`}
      style={{ fontSize: script ? "1.6em" : "1em" }}
    >
      {text}
    </span>
  );
}

/** A round badge with a dimension's icon, in its own colour. */
function DimensionBadge({ id }: { id: string }) {
  const d = dimensions.find((x) => x.id === id);
  if (!d) return null;
  return (
    <span
      className="flex aspect-square w-full items-center justify-center rounded-full border-[0.35em] border-white shadow-[0_3px_6px_-2px_rgb(75_48_74/0.35)]"
      style={{ backgroundColor: d.accent, color: "#fff", fontSize: "1em" }}
      title={d.name}
    >
      <Icon name={d.icon} className="h-[55%] w-[55%]" strokeWidth={1.8} />
    </span>
  );
}
