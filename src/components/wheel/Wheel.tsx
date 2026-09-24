"use client";

/**
 * THE RADIATE 8 WHEEL
 *
 * A circle split into 8 petals, one per dimension (order and colors
 * come from app.config.ts). Each petal fills outward from the center
 * according to its 0 to 10 score. Tap a petal to open that dimension.
 *
 * How the fill works: each colored petal is a full-size wedge that is
 * gently scaled from the center. Score 0 hides it behind the center
 * circle, score 10 reaches the outer edge. Scaling animates smoothly.
 */
import { dimensions, type DimensionId } from "@/config/app.config";
import type { WheelScores } from "@/lib/data";
import { Icon } from "../Icon";

const SIZE = 400;
const C = SIZE / 2; // center point
const R = 142; // outer radius of the petals
const HUB = 40; // radius of the center circle
const ICON_RING = 176; // where the little icons sit
const SLICE = 360 / dimensions.length;

/** A point on a circle, with 0 degrees at the top, moving clockwise. */
function polar(radius: number, degrees: number) {
  const rad = ((degrees - 90) * Math.PI) / 180;
  return { x: C + radius * Math.cos(rad), y: C + radius * Math.sin(rad) };
}

/** The outline of one pie slice from the center out to `radius`. */
function wedgePath(index: number, radius: number) {
  const start = index * SLICE - SLICE / 2;
  const end = start + SLICE;
  const a = polar(radius, start);
  const b = polar(radius, end);
  return `M ${C} ${C} L ${a.x} ${a.y} A ${radius} ${radius} 0 0 1 ${b.x} ${b.y} Z`;
}

/** Turns a 0 to 10 score into how far the petal reaches. */
function scaleFor(score: number) {
  const min = HUB / R;
  return min + (1 - min) * (score / 10);
}

type Props = {
  scores: WheelScores | undefined;
  selectedId?: DimensionId | null;
  onSelect: (id: DimensionId) => void;
};

export function Wheel({ scores, selectedId, onSelect }: Props) {
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-auto w-full touch-manipulation select-none" role="group" aria-label="Radiate 8 wheel">
      <defs>
        <radialGradient id="petal-sheen" cx="50%" cy="50%" r="50%">
          <stop offset="30%" stopColor="#fff" stopOpacity="0" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0.28" />
        </radialGradient>
      </defs>

      {/* Soft halo behind the wheel */}
      <circle cx={C} cy={C} r={R + 10} fill="var(--r8-linen)" opacity="0.55" />

      {dimensions.map((d, i) => {
        const score = scores?.[d.id] ?? 0;
        const selected = selectedId === d.id;
        const mid = polar(ICON_RING, i * SLICE);
        return (
          <g
            key={d.id}
            role="button"
            tabIndex={0}
            aria-label={`${d.name}, ${scores?.[d.id] ?? "not yet rated"}${scores?.[d.id] !== undefined ? " of 10" : ""}`}
            onClick={() => onSelect(d.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(d.id);
              }
            }}
            className="group cursor-pointer outline-none"
          >
            {/* Empty petal (the track) */}
            <path
              d={wedgePath(i, R)}
              fill="var(--r8-linen)"
              stroke="var(--r8-ivory)"
              strokeWidth={3}
              className="transition-[fill] duration-500 group-hover:fill-[var(--r8-ivory-light)] group-focus-visible:fill-[var(--r8-ivory-light)]"
            />

            {/* Colored fill, scaled by score */}
            <g
              style={{
                transform: `scale(${scaleFor(score)})`,
                transformOrigin: `${C}px ${C}px`,
                transition: `transform 1.1s cubic-bezier(0.22, 1, 0.36, 1) ${i * 70}ms`,
              }}
            >
              <path d={wedgePath(i, R)} fill={d.accent} opacity={selected ? 1 : 0.82} stroke="var(--r8-ivory)" strokeWidth={3} />
              <path d={wedgePath(i, R)} fill="url(#petal-sheen)" />
            </g>

            {/* Selected outline */}
            <path
              d={wedgePath(i, R)}
              fill="none"
              stroke={d.accent}
              strokeWidth={2}
              opacity={selected ? 1 : 0}
              className="pointer-events-none transition-opacity duration-500"
            />

            {/* Icon around the outside */}
            <circle cx={mid.x} cy={mid.y} r={17} fill="var(--r8-linen)" stroke={selected ? d.accent : "var(--r8-line)"} strokeWidth={1.2} className="transition-[stroke] duration-500" />
            <Icon name={d.icon} x={mid.x - 9} y={mid.y - 9} width={18} height={18} color={d.accent} strokeWidth={1.6} />
          </g>
        );
      })}

      {/* Faint guide rings at 2, 4, 6, 8 */}
      {[2, 4, 6, 8].map((n) => (
        <circle key={n} cx={C} cy={C} r={R * scaleFor(n)} fill="none" stroke="var(--r8-plum)" strokeOpacity="0.07" strokeDasharray="2 5" className="pointer-events-none" />
      ))}

      {/* Center hub with the brand's pale serif 8 */}
      <circle cx={C} cy={C} r={HUB} fill="var(--r8-linen)" stroke="var(--r8-line)" />
      <text
        x={C}
        y={C + 2}
        textAnchor="middle"
        dominantBaseline="central"
        className="pointer-events-none font-serif"
        fontSize={62}
        fill="#DEC3BC"
      >
        8
      </text>
    </svg>
  );
}
