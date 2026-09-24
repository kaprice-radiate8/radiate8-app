/**
 * The warm golden-hour glow behind every screen.
 * Two soft blurred lights drift very slowly, like late sun on water.
 */
export function GoldenBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-gradient-to-b from-sand-light via-sand to-sand">
      <div className="absolute -top-32 -right-24 h-96 w-96 animate-glow rounded-full bg-gold/35 blur-3xl" />
      <div className="absolute top-1/2 -left-32 h-96 w-96 animate-glow rounded-full bg-rose/25 blur-3xl [animation-delay:-7s]" />
      <div className="absolute -bottom-40 right-0 h-80 w-80 rounded-full bg-clay/20 blur-3xl" />
    </div>
  );
}
