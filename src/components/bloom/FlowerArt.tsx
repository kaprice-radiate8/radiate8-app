/**
 * FLOWER AND BOUQUET DRAWINGS
 * A flower has 8 petal places. Filled petals take the color of their
 * dimension; a goal reached has a gold edge. Empty places show as a faint
 * dashed outline, like a facet not yet cut.
 */
import { bloom, getDimension } from "@/config/app.config";
import type { Petal } from "@/lib/bloom";

const NEUTRAL = "#B8A999"; // taupe, for a petal with no dimension
// Fill opposite sides first, so a flower looks balanced as it opens.
const ORDER = [0, 4, 2, 6, 1, 5, 3, 7];

function petalPath(len: number, wid: number) {
  return `M0 0C${wid} ${-len * 0.3} ${wid * 0.95} ${-len * 0.82} 0 ${-len}C${-wid * 0.95} ${-len * 0.82} ${-wid} ${-len * 0.3} 0 0Z`;
}

/** One flower drawn at (x, y) inside an SVG. `freshFrom`: petals from this index grow in. */
export function FlowerShape({
  x = 0,
  y = 0,
  len,
  petals,
  slots = false,
  freshFrom = Infinity,
}: {
  x?: number;
  y?: number;
  len: number;
  petals: Petal[];
  slots?: boolean;
  freshFrom?: number;
}) {
  const places = bloom.petalsPerFlower;
  const step = 360 / places;
  const wid = len * 0.36;
  const d = petalPath(len, wid);
  return (
    <g transform={`translate(${x} ${y})`}>
      {slots &&
        Array.from({ length: places }, (_, i) => (
          <path key={`s${i}`} d={d} transform={`rotate(${i * step})`} fill="none" stroke="var(--r8-taupe)" strokeOpacity="0.7" strokeWidth="1" strokeDasharray="3 3" />
        ))}
      {petals.map((p, k) => {
        const color = (p.dimensionId && getDimension(p.dimensionId)?.accent) || NEUTRAL;
        return (
          <g key={k} transform={`rotate(${(ORDER[k % 8] ?? k) * step})`}>
            <path
              d={d}
              className={k >= freshFrom ? "petal-grow" : undefined}
              style={k >= freshFrom ? { animationDelay: `${(k - freshFrom) * 180}ms` } : undefined}
              fill={color}
              fillOpacity="0.8"
              stroke={p.gold ? "var(--r8-gold)" : color}
              strokeWidth={p.gold ? Math.max(1.6, len / 22) : 0.8}
            />
          </g>
        );
      })}
      <circle r={Math.max(3, len * 0.2)} fill="#E3BC85" />
      {len > 50 && (
        <text y={len * 0.085} textAnchor="middle" fontFamily="var(--font-cormorant), Georgia, serif" fontSize={len * 0.26} fill="var(--r8-linen)">
          8
        </text>
      )}
    </g>
  );
}

/** A single flower as its own picture. */
export function Flower({ petals, size, slots = true, freshFrom, label }: { petals: Petal[]; size: number; slots?: boolean; freshFrom?: number; label: string }) {
  const len = size * 0.46;
  return (
    <svg width={size} height={size} viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`} role="img" aria-label={label} className="shrink-0 overflow-visible">
      <FlowerShape len={len} petals={petals} slots={slots} freshFrom={freshFrom} />
    </svg>
  );
}

/** The bouquet: every flower of a season on its stem, tied with a plum ribbon. */
export function Bouquet({ flowers, label, className = "" }: { flowers: Petal[][]; label: string; className?: string }) {
  const W = 360, cx = 180, tieY = 262;
  const n = Math.max(1, flowers.length);
  const placed = flowers.map((f, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const a = ((-62 + 124 * t) * Math.PI) / 180;
    const r = 128 + (n > 6 ? (i % 2) * 44 : 22) + (n > 10 && i % 3 === 1 ? -18 : 0);
    return { f, i, x: cx + r * Math.sin(a), y: tieY - 36 - r * Math.cos(a) };
  });
  const len = n > 10 ? 20 : n > 6 ? 24 : 30;
  return (
    <svg viewBox={`0 0 ${W} 290`} role="img" aria-label={label} className={`block w-full ${className}`}>
      {placed.map((p) => (
        <path key={`stem${p.i}`} d={`M${cx} ${tieY}Q${(cx + p.x) / 2} ${(tieY + p.y) / 2 + 20} ${p.x} ${p.y}`} fill="none" stroke="#8E9C7C" strokeWidth="1.6" />
      ))}
      <ellipse cx={cx - 26} cy={tieY - 34} rx="22" ry="7" transform={`rotate(-35 ${cx - 26} ${tieY - 34})`} fill="#A9B39A" />
      <ellipse cx={cx + 26} cy={tieY - 40} rx="22" ry="7" transform={`rotate(35 ${cx + 26} ${tieY - 40})`} fill="#A9B39A" />
      {[...placed]
        .sort((a, b) => b.y - a.y)
        .map((p) => (
          <FlowerShape key={`f${p.i}`} x={p.x} y={p.y} len={len} petals={p.f} slots={p.f.length < bloom.petalsPerFlower} />
        ))}
      {/* A season with no petals still gets a bud, never an empty ribbon */}
      {!flowers.length && <path d={petalPath(40, 13)} transform={`translate(${cx} ${tieY - 70})`} fill="var(--r8-blush)" stroke="var(--r8-taupe)" strokeWidth="0.8" />}
      <path d={`M${cx} ${tieY}l-18 14l4 -18zM${cx} ${tieY}l18 14l-4 -18z`} fill="var(--r8-plum)" />
      <circle cx={cx} cy={tieY} r="5" fill="var(--r8-plum)" />
    </svg>
  );
}
