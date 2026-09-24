/**
 * FIGURE EIGHT
 * The brand's 8 / infinity motif, drawn as one continuous line.
 * `animated` slowly traces the line, like a breath moving through it.
 */
type Props = {
  size?: number;
  className?: string;
  /** "eight" stands upright, "infinity" lies on its side */
  orientation?: "eight" | "infinity";
  animated?: boolean;
  strokeWidth?: number;
};

// Points along a lemniscate (a mathematically smooth figure eight).
function lemniscatePath(): string {
  const pts: string[] = [];
  const steps = 96;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const d = 1 + Math.sin(t) ** 2;
    const x = 50 + (44 * Math.cos(t)) / d;
    const y = 50 + (44 * Math.sin(t) * Math.cos(t)) / d;
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return pts.join(" ") + " Z";
}

const PATH = lemniscatePath();

export function Figure8({
  size = 40,
  className,
  orientation = "eight",
  animated = false,
  strokeWidth = 1.6,
}: Props) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      style={{ transform: orientation === "eight" ? "rotate(90deg)" : undefined }}
    >
      <path d={PATH} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" opacity={animated ? 0.25 : 1} />
      {animated && (
        <path
          d={PATH}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray="22 78"
        >
          <animate attributeName="stroke-dashoffset" from="100" to="0" dur="9s" repeatCount="indefinite" />
        </path>
      )}
    </svg>
  );
}
