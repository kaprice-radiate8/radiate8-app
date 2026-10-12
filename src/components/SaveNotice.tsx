/**
 * SAVE NOTICE
 * A gentle but clear message shown when something could not be saved.
 * Screen readers announce it straight away (role="alert").
 */
import { CircleAlert } from "lucide-react";

export function SaveNotice({ message, className }: { message: string | null; className?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className={`rise flex items-start gap-2.5 rounded-2xl bg-blush/70 px-4 py-3 text-sm leading-snug text-plum ${className ?? ""}`}>
      <CircleAlert size={18} strokeWidth={1.6} className="mt-px shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}
