/**
 * ARTWORK for activities and Dedications.
 * Shows the real image when there is one; until then, a soft
 * watercolor-style wash painted from two colors, with the pale serif 8.
 */
import { PaleEight } from "./PaleEight";

export function Artwork({
  colors,
  url,
  size = 72,
  className = "",
}: {
  colors: [string, string];
  url?: string;
  /** A number makes a square; omit it to fill the width (use className for height). */
  size?: number | null;
  className?: string;
}) {
  const box = size ? { width: size, height: size } : {};
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-2xl shadow-[0_10px_24px_-14px_rgb(59_42_34/0.6)] ${className}`}
      style={{ ...box, background: `radial-gradient(circle at 30% 25%, ${colors[0]}, ${colors[1]})` }}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element -- artwork can come from the content system's own image host
        <img src={url} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgb(255_255_255/0.35),transparent_55%)]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <PaleEight size={size ? size * 0.8 : 120} color="rgb(255 255 255 / 0.55)" />
          </div>
        </>
      )}
    </div>
  );
}
