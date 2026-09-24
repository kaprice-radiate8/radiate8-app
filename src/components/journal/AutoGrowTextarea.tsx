"use client";

/**
 * A writing area that grows taller as you write, so the page never
 * feels cramped and there is no box-inside-a-box scrolling.
 */
import { useLayoutEffect, useRef } from "react";

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { minRows?: number };

export function AutoGrowTextarea({ minRows = 6, value, className, ...props }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const lineHeight = 32; // matches the 2rem ruled lines
    el.style.height = `${Math.max(el.scrollHeight, minRows * lineHeight)}px`;
  }, [value, minRows]);

  return <textarea ref={ref} value={value} rows={minRows} className={`paper block w-full resize-none ${className ?? ""}`} {...props} />;
}
