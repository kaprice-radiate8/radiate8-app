/**
 * THE PALE 8
 * The soft serif numeral 8 that sits behind the Radiate wordmark in the
 * brand guide. Used as a quiet background motif (wheel center, cover art).
 */
export function PaleEight({ size = 64, className, color = "var(--r8-blush)" }: { size?: number; className?: string; color?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block font-serif leading-none select-none ${className ?? ""}`}
      style={{ fontSize: size, color, fontWeight: 400 }}
    >
      8
    </span>
  );
}
