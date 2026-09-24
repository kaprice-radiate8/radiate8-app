/**
 * Soft gradient cover art, painted from two colors, with a faint figure eight.
 * Replace with real album images later by passing an image instead.
 */
import { Figure8 } from "../Figure8";

export function CoverArt({ colors, size = 72, spinning = false }: { colors: [string, string]; size?: number; spinning?: boolean }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-2xl shadow-[0_10px_24px_-14px_rgb(59_42_34/0.6)]"
      style={{ width: size, height: size, background: `radial-gradient(circle at 30% 25%, ${colors[0]}, ${colors[1]})` }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgb(255_255_255/0.35),transparent_55%)]" />
      <div className={`absolute inset-0 flex items-center justify-center text-cream/70 ${spinning ? "animate-breathe" : ""}`}>
        <Figure8 size={size * 0.55} orientation="infinity" strokeWidth={2.2} />
      </div>
    </div>
  );
}
