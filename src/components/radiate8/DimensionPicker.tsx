"use client";

/**
 * Choose one or more of the eight dimensions.
 * Used after an assessment and at the start of Reflect, Bloom, Become.
 */
import { dimensions, type DimensionId } from "@/config/app.config";
import { Icon } from "../Icon";

type Props = {
  selected: DimensionId[];
  onChange: (ids: DimensionId[]) => void;
  /** Optional words shown under each name, e.g. where she placed it. */
  hint?: (id: DimensionId) => string | undefined;
};

export function DimensionPicker({ selected, onChange, hint }: Props) {
  function toggle(id: DimensionId) {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  }

  return (
    <ul className="grid grid-cols-2 gap-2" role="group" aria-label="Dimensions">
      {dimensions.map((d) => {
        const on = selected.includes(d.id);
        const note = hint?.(d.id);
        return (
          <li key={d.id}>
            <button
              type="button"
              aria-pressed={on}
              onClick={() => toggle(d.id)}
              className={`flex h-full w-full items-center gap-2.5 rounded-2xl border px-3 py-3 text-left transition-all duration-300 active:scale-[0.98] ${
                on ? "border-plum bg-plum text-ivory" : "border-line/80 bg-linen/70 text-plum hover:border-taupe"
              }`}
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: on ? "rgb(255 255 255 / 0.16)" : `${d.accent}26`, color: on ? "var(--r8-ivory)" : d.accent }}
              >
                <Icon name={d.icon} size={16} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm leading-tight">{d.name}</span>
                {note && <span className={`mt-0.5 block text-[0.7rem] leading-tight ${on ? "text-ivory/80" : "text-plum-soft"}`}>{note}</span>}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
