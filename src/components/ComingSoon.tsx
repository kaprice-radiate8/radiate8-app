/**
 * A soft placeholder for screens that are still being built.
 */
import { PaleEight } from "./PaleEight";

export function ComingSoon({ eyebrow, title, line, children }: { eyebrow: string; title: string; line: string; children?: React.ReactNode }) {
  return (
    <div className="flex min-h-[65dvh] flex-col items-center justify-center text-center">
      {/* The micro mark stays at the top of the screen; here only the pale 8 breathes */}
      <PaleEight size={140} className="animate-breathe" />
      <p className="label mt-4">{eyebrow}</p>
      <h1 className="mt-2 font-serif text-4xl text-plum">{title}</h1>
      <p className="mt-3 font-script text-4xl text-plum">{line}</p>
      {children && <div className="mt-6 max-w-xs text-sm leading-relaxed text-plum-soft">{children}</div>}
    </div>
  );
}
