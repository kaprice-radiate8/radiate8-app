/**
 * Small tinted name chips for the dimensions something belongs to.
 */
import { getDimension, type DimensionId } from "@/config/app.config";

export function DimensionChips({ ids, className }: { ids: readonly DimensionId[]; className?: string }) {
  return (
    <p className={`flex flex-wrap gap-1.5 ${className ?? ""}`}>
      {ids.map((id) => {
        const d = getDimension(id);
        return d ? (
          <span key={id} className="rounded-full px-2.5 py-1 text-[0.7rem] text-plum" style={{ backgroundColor: `${d.accent}26` }}>
            {d.name}
          </span>
        ) : null;
      })}
    </p>
  );
}
