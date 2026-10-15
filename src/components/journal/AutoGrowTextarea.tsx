"use client";

/**
 * A writing area that grows taller as you write, so the page never
 * feels cramped and there is no box-inside-a-box scrolling.
 *
 * Pass `onDictate` to add a microphone button: she can speak instead of
 * typing, and her words appear on the page as she talks.
 */
import { useLayoutEffect, useRef } from "react";
import { Mic, Square } from "lucide-react";
import { useDictation } from "@/lib/use-dictation";

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  minRows?: number;
  value: string;
  /** Receives the whole new text while she speaks. Leave out for no microphone. */
  onDictate?: (next: string) => void;
};

export function AutoGrowTextarea({ minRows = 6, value, className, onDictate, style, ...props }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const dictation = useDictation(value, onDictate ?? (() => {}));
  const withMic = onDictate !== undefined && dictation.supported;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const lineHeight = 32; // matches the 2rem ruled lines
    el.style.height = `${Math.max(el.scrollHeight, minRows * lineHeight)}px`;
  }, [value, minRows]);

  const textarea = (
    <textarea
      ref={ref}
      value={value}
      rows={minRows}
      className={`paper block w-full resize-none ${className ?? ""}`}
      // Room at the bottom so the last line never hides under the microphone.
      style={withMic ? { ...style, paddingBottom: "3.75rem" } : style}
      {...props}
    />
  );
  if (!withMic) return textarea;

  return (
    <div className="relative">
      {textarea}
      <div className="absolute right-3 bottom-3 left-3 flex items-center justify-end gap-3">
        {dictation.listening && (
          <span role="status" className="rise flex items-center gap-2 text-sm text-plum-soft">
            <span className="h-2 w-2 animate-pulse rounded-full bg-gold" aria-hidden="true" />
            Listening&hellip;
          </span>
        )}
        <button
          type="button"
          onClick={dictation.listening ? dictation.stop : dictation.start}
          aria-label={dictation.listening ? "Stop speaking" : "Speak instead of typing"}
          aria-pressed={dictation.listening}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full shadow-md transition-all active:scale-95 ${
            dictation.listening ? "bg-plum text-ivory" : "bg-gold text-ivory"
          }`}
        >
          {dictation.listening ? <Square size={16} fill="currentColor" /> : <Mic size={20} strokeWidth={1.8} />}
        </button>
      </div>
      {dictation.problem && (
        <p role="alert" className="bg-blush/70 px-5 py-3 text-sm leading-snug text-plum">
          {dictation.problem}
        </p>
      )}
    </div>
  );
}
