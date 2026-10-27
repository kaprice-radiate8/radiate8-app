"use client";

/**
 * Choose one dimension, or none (tap the chosen one again to clear it).
 */
import { dimensions, type DimensionId } from "@/config/app.config";

export function DimensionChoice({ value, onChange }: { value: DimensionId | null; onChange: (id: DimensionId | null) => void }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Where in your life it lives">
      {dimensions.map((d) => {
        const on = value === d.id;
        return (
          <button
            key={d.id}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? null : d.id)}
            className={`rounded-full border px-3 py-1.5 text-xs transition-all duration-300 ${on ? "border-plum bg-plum text-ivory" : "border-line/80 text-plum"}`}
            style={on ? undefined : { backgroundColor: `${d.accent}1f` }}
          >
            {d.name}
          </button>
        );
      })}
    </div>
  );
}
