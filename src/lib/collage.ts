/**
 * THE COLLAGE: where each item on her vision board sits, and how it looks.
 *
 * The board is 100 units wide and as tall as it needs. Items she has placed
 * herself keep their saved layout. Everything else is arranged for her: two
 * loose columns of photos and words that overlap and tilt a little, the
 * title across the board after the first row, and stickers tucked onto the
 * corners of nearby items. "Random" choices come from each item's id, so her
 * board looks the same every time she opens it, on every device.
 */
import type { VisionItem, VisionLayout } from "./data/types";

export const IMAGE_STYLES = ["polaroid", "tape", "torn", "clean"] as const;
export const WORD_STYLES = ["script", "label", "cutout", "typed"] as const;
export type ImageStyle = (typeof IMAGE_STYLES)[number];
export type WordStyle = (typeof WORD_STYLES)[number];

/** A steady number from a string (the same id always gives the same number). */
export function seed(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** A steady value between -1 and 1 for an id and a purpose. */
const wobble = (id: string, salt: string) => (seed(id + salt) % 2001) / 1000 - 1;

/** The look an item has: her choice, or one chosen for her. */
export function styleOf(item: VisionItem): string {
  if (item.style) return item.style;
  if (item.kind === "image") return IMAGE_STYLES[seed(item.id) % IMAGE_STYLES.length];
  if (item.kind === "words") return WORD_STYLES[seed(item.id) % WORD_STYLES.length];
  return "";
}

/** The next look in turn, for the "Style" button. */
export function nextStyle(item: VisionItem): string | null {
  const list: readonly string[] = item.kind === "image" ? IMAGE_STYLES : item.kind === "words" ? WORD_STYLES : [];
  if (!list.length) return null;
  return list[(list.indexOf(styleOf(item)) + 1) % list.length];
}

/** A little sticker some photos wear on a corner (part of the photo, so it moves with it). */
export function accentOf(item: VisionItem): string | null {
  if (item.kind !== "image") return null;
  const n = seed(item.id + "accent");
  return n % 3 === 0 ? (["star", "heart", "flower", "sparkle"] as const)[n % 4] : null;
}

/** How tall an item is, in board units, for a given width (close enough to stack them). */
export function heightOf(item: VisionItem, w: number, stickerRatio = 1): number {
  switch (item.kind) {
    case "image": {
      const photo = w * Math.min(1.35, Math.max(0.7, item.aspect ?? 1.1));
      return styleOf(item) === "polaroid" ? photo + w * 0.2 : photo;
    }
    case "words": {
      const lines = Math.max(1, Math.ceil(item.words.length / (styleOf(item) === "script" ? 14 : 18)));
      return w * (0.16 + 0.13 * lines);
    }
    case "title":
      return w * 0.24;
    case "sticker":
      return w / stickerRatio;
  }
}

/** The title shown before she names her board. */
export const defaultTitle = (year = new Date().getFullYear()) => `${year} Vision Board`;

export type Placed = { item: VisionItem; layout: VisionLayout; h: number };

/**
 * Where every item sits. `stickerRatio` gives a sticker's width relative to its height.
 * Items with a saved layout stay put; the rest are arranged below or around them.
 */
export function arrange(items: VisionItem[], stickerRatio: (id: string | null) => number = () => 1): { placed: Placed[]; height: number } {
  const placed: Placed[] = [];
  const fixed = items.filter((i) => i.layout);
  for (const item of fixed) {
    const ratio = item.kind === "sticker" ? stickerRatio(item.sticker) : 1;
    placed.push({ item, layout: item.layout!, h: heightOf(item, item.layout!.w, ratio) });
  }

  // Free items: photos and words in board order, then the title and stickers.
  const free = items.filter((i) => !i.layout);
  const pieces = free.filter((i) => i.kind === "image" || i.kind === "words");
  const title = free.find((i) => i.kind === "title");
  const loose = free.filter((i) => i.kind === "sticker");

  // On a board she has arranged, new things start below what she placed.
  let cursor = fixed.length ? Math.max(...placed.map((p) => p.layout.y + p.h / 2)) + 4 : 6;
  let z = Math.max(0, ...placed.map((p) => p.layout.z)) + 1;

  let titlePlaced = false;
  const placeTitle = () => {
    if (!title || titlePlaced) return;
    titlePlaced = true;
    const w = 72;
    const h = heightOf(title, w);
    // Above photos, below words (words stay readable and tappable).
    placed.push({ item: title, layout: { x: 50, y: cursor + h / 2, w, r: -2, z: 45 }, h });
    cursor += h + 2;
  };

  if (pieces.length < 2) placeTitle();
  for (let row = 0; row * 2 < pieces.length; row++) {
    const pair = pieces.slice(row * 2, row * 2 + 2);
    const sizes = pair.map((item) => {
      const range = item.kind === "image" ? [42, 50] : [38, 48];
      const w = range[0] + ((wobble(item.id, "w") + 1) / 2) * (range[1] - range[0]);
      return { item, w, h: heightOf(item, w) };
    });
    const rowHeight = Math.max(...sizes.map((s) => s.h));
    sizes.forEach(({ item, w, h }, i) => {
      const alone = pair.length === 1;
      // Alternate sides row by row, so photos and words zigzag down the board.
      const col = row % 2 === 0 ? i : 1 - i;
      const x = clamp((alone ? 50 : col === 0 ? 27 : 73) + wobble(item.id, "x") * (alone ? 12 : 4), w / 2 + 1, 99 - w / 2);
      const y = cursor + rowHeight / 2 + wobble(item.id, "y") * 4 + (col === 1 ? 5 : 0);
      const r = wobble(item.id, "r") * (item.kind === "image" ? 7 : 4);
      // Words sit on top of photos, so they're never hidden.
      placed.push({ item, layout: { x, y, w, r, z: z + (seed(item.id) % 2) + (item.kind === "words" ? 50 : 0) }, h });
    });
    z += 2;
    // Rows overlap a little, as photos do on a real board (less where the title goes).
    cursor += rowHeight * (row === 0 && title ? 0.95 : 0.8);
    if (row === 0) placeTitle();
  }

  // Stickers: tucked onto the corners of photos and words, in turn.
  const anchors = placed.filter((p) => p.item.kind === "image" || p.item.kind === "words");
  loose.forEach((item, i) => {
    const ratio = stickerRatio(item.sticker);
    const w = (ratio > 1.5 ? 30 : 14) + wobble(item.id, "w") * 3;
    const h = w / ratio;
    const anchor = anchors.length ? anchors[i % anchors.length] : null;
    const corner = seed(item.id) % 4;
    const x = anchor ? anchor.layout.x + (corner % 2 ? 1 : -1) * anchor.layout.w * 0.42 : 50 + wobble(item.id, "x") * 30;
    const y = anchor ? anchor.layout.y + (corner < 2 ? -1 : 1) * anchor.h * 0.42 : cursor + h;
    placed.push({ item, layout: { x: clamp(x, w / 2, 100 - w / 2), y: Math.max(h / 2, y), w, r: wobble(item.id, "r") * 14, z: 900 + i }, h });
  });

  const height = Math.max(110, ...placed.map((p) => p.layout.y + p.h / 2 + 6));
  return { placed, height };
}

export const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
