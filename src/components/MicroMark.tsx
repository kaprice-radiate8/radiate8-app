/**
 * THE MICRO MARK
 * The seven gold dots from the Radiate 8 brand guide. It's the app's logo
 * and sits in the same place at the top of every screen.
 *
 * NOTE: this is drawn to match the brand guide as closely as possible.
 * When the approved master artwork (SVG) is available, replace the dots
 * below with it so the proportions and spacing are exact.
 */

// Each dot: vertical position (cy) and radius (r), top to bottom.
// The brand rule: never change the dot count, order, or size relationships.
const DOTS = [
  { cy: 5, r: 3.2 },
  { cy: 19, r: 4.2 },
  { cy: 36, r: 5.4 },
  { cy: 57, r: 8.2 },
  { cy: 79, r: 7 },
  { cy: 98, r: 4.8 },
  { cy: 114, r: 3.4 },
];

type Props = {
  /** Height in pixels. Width follows automatically. */
  height?: number;
  className?: string;
  /** A slow, gentle glow for waiting or quiet moments. */
  breathing?: boolean;
};

export function MicroMark({ height = 48, className, breathing = false }: Props) {
  return (
    <svg
      viewBox="0 0 20 119"
      height={height}
      width={(height * 20) / 119}
      className={`${breathing ? "animate-breathe" : ""} ${className ?? ""}`}
      role="img"
      aria-label="Radiate 8"
    >
      {DOTS.map((d, i) => (
        <circle key={i} cx={10} cy={d.cy} r={d.r} fill="var(--r8-gold)" />
      ))}
    </svg>
  );
}
