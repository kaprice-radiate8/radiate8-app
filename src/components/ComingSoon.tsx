/**
 * A soft placeholder for screens that are still being built.
 */
import { Figure8 } from "./Figure8";

export function ComingSoon({ eyebrow, title, line, children }: { eyebrow: string; title: string; line: string; children?: React.ReactNode }) {
  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center text-center">
      <div className="text-terracotta">
        <Figure8 size={72} animated strokeWidth={3} />
      </div>
      <p className="label mt-8">{eyebrow}</p>
      <h1 className="mt-2 font-serif text-4xl font-light text-espresso">{title}</h1>
      <p className="mt-3 font-script text-2xl text-terracotta">{line}</p>
      {children && <div className="mt-6 max-w-xs text-sm leading-relaxed text-cocoa">{children}</div>}
    </div>
  );
}
