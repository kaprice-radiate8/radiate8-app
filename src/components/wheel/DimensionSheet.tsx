"use client";

/**
 * DIMENSION SHEET
 * Slides up from the bottom when a petal is tapped.
 * Shows the dimension, lets you set how full it feels (0 to 10),
 * and opens the deeper reflection page.
 */
import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { X } from "lucide-react";
import type { Dimension } from "@/config/app.config";
import { store } from "@/lib/data";
import { Icon } from "../Icon";

/** A gentle word for each part of the scale, never a grade. */
function feelingFor(score: number | undefined) {
  if (score === undefined) return "Slide to see where you are";
  if (score <= 2) return "Asking for tenderness";
  if (score <= 4) return "Quietly waiting for you";
  if (score <= 6) return "Finding its footing";
  if (score <= 8) return "Growing warm";
  return "Radiant";
}

const noSubscribe = () => () => {};

type Props = {
  /** The dimension to show. Stays set while the sheet slides away. */
  dimension: Dimension | null;
  open: boolean;
  score: number | undefined;
  onClose: () => void;
};

export function DimensionSheet({ dimension: d, open, score, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  // Remember whether the score was touched so we can note it for My Rhythm once.
  const touched = useRef(false);

  useEffect(() => {
    if (!open) return;
    touched.current = false;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function close() {
    if (touched.current && d) store.logAttention(d.id, "wheel");
    onClose();
  }

  // The sheet is placed directly on the page body so it always covers the
  // whole screen. That can only happen in the browser, after the page loads.
  const inBrowser = useSyncExternalStore(noSubscribe, () => true, () => false);
  if (!inBrowser) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-40 transition-[visibility] duration-700 ${open ? "visible" : "invisible pointer-events-none"}`}
      aria-hidden={!open}
      inert={!open}
    >
      {/* Dimmed background, tap to close */}
      <div onClick={close} className={`absolute inset-0 bg-espresso/25 backdrop-blur-[2px] transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`} />

      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={d?.name}
        className={`absolute inset-x-0 bottom-0 mx-auto max-w-md rounded-t-[2rem] bg-cream px-6 pt-3 pb-[max(1.75rem,env(safe-area-inset-bottom))] shadow-2xl outline-none transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />
        {d && (
          <>
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${d.accent}22`, color: d.accent }}>
                <Icon name={d.icon} size={22} />
              </span>
              <div className="flex-1">
                <h2 className="font-serif text-3xl leading-tight text-espresso">{d.name}</h2>
                <p className="mt-1 text-sm text-cocoa">{d.subtitle}</p>
              </div>
              <button type="button" onClick={close} aria-label="Close" className="-mt-1 -mr-2 rounded-full p-2 text-cocoa/70 hover:text-espresso">
                <X size={20} strokeWidth={1.4} />
              </button>
            </div>

            <div className="mt-7">
              <p className="label">How full does this feel right now?</p>
              <div className="mt-3 flex items-baseline justify-between">
                <p className="font-serif text-5xl font-light text-espresso">
                  {score ?? "·"}
                  <span className="text-2xl text-cocoa/60"> / 10</span>
                </p>
                <p className="font-script text-xl" style={{ color: d.accent }}>
                  {feelingFor(score)}
                </p>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={score ?? 0}
                onChange={(e) => {
                  touched.current = true;
                  store.setWheelScore(d.id, Number(e.target.value));
                }}
                aria-label={`How full ${d.name} feels, 0 to 10`}
                className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-line"
                style={{
                  accentColor: d.accent,
                  background: `linear-gradient(to right, ${d.accent} ${(score ?? 0) * 10}%, var(--r8-line) ${(score ?? 0) * 10}%)`,
                }}
              />
              <div className="mt-2 flex justify-between text-[0.65rem] tracking-[0.18em] text-cocoa/60 uppercase">
                <span>Longing</span>
                <span>Overflowing</span>
              </div>
            </div>

            <Link
              href={`/dimension/${d.id}`}
              onClick={() => {
                touched.current = false;
                store.logAttention(d.id, "wheel");
              }}
              className="mt-7 flex w-full items-center justify-center rounded-full bg-espresso px-6 py-4 text-sm tracking-[0.2em] text-cream uppercase transition-transform active:scale-[0.98]"
            >
              Reflect on {d.name}
            </Link>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
