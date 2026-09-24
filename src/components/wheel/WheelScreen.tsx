"use client";

/**
 * WHEEL SCREEN
 * The wheel, a gentle list of all 8 below it, and the sheet that
 * opens when you tap one.
 */
import { useState } from "react";
import { dimensions, getDimension, type DimensionId } from "@/config/app.config";
import { useStoreData } from "@/lib/data";
import { Icon } from "../Icon";
import { DimensionSheet } from "./DimensionSheet";
import { Wheel } from "./Wheel";

export function WheelScreen() {
  const { data: scores } = useStoreData((s) => s.getWheelScores());
  const [selectedId, setSelectedId] = useState<DimensionId | null>(null);
  const [open, setOpen] = useState(false);

  function select(id: DimensionId) {
    setSelectedId(id);
    setOpen(true);
  }

  const rated = scores ? Object.keys(scores).length : 0;

  return (
    <>
      <header className="text-center">
        <p className="label">The Radiate 8</p>
        <h1 className="mt-2 font-serif text-4xl text-plum">Your Wheel</h1>
        <p className="mt-2 font-script text-3xl text-plum">
          {rated === 0 ? "Tap a petal to begin" : rated < dimensions.length ? "Keep going, gently" : "Your whole self, in one breath"}
        </p>
      </header>

      <div className="relative mx-auto mt-4 w-full max-w-[380px]">
        <Wheel scores={scores} selectedId={open ? selectedId : null} onSelect={select} />
      </div>

      <ul className="card mt-6 divide-y divide-line/70 px-5 py-1">
        {dimensions.map((d) => {
          const score = scores?.[d.id];
          return (
            <li key={d.id}>
              <button type="button" onClick={() => select(d.id)} className="flex w-full items-center gap-3 py-3.5 text-left">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${d.accent}22`, color: d.accent }}>
                  <Icon name={d.icon} size={17} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-serif text-lg leading-tight text-plum">{d.name}</span>
                  <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-line/70">
                    <span
                      className="block h-full rounded-full transition-[width] duration-1000 ease-out"
                      style={{ width: `${(score ?? 0) * 10}%`, backgroundColor: d.accent }}
                    />
                  </span>
                </span>
                <span className="w-8 text-right font-serif text-xl text-plum-soft">{score ?? ""}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <DimensionSheet
        dimension={selectedId ? (getDimension(selectedId) ?? null) : null}
        open={open}
        score={selectedId ? scores?.[selectedId] : undefined}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
