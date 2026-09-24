"use client";

/**
 * "What needs your attention today?"
 * Opens softly to show the 8 dimensions. Choosing one records a moment
 * of attention (for My Rhythm) and takes you to that dimension.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { dimensions } from "@/config/app.config";
import { store } from "@/lib/data";
import { Icon } from "../Icon";

export function AttentionPrompt() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function choose(id: (typeof dimensions)[number]["id"]) {
    await store.logAttention(id, "today");
    router.push(`/dimension/${id}`);
  }

  return (
    <section className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 p-5 text-left"
      >
        <div>
          <p className="label">Your focus</p>
          <h2 className="mt-2 font-serif text-2xl leading-snug text-plum">What needs your attention today?</h2>
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ivory-light text-plum transition-transform duration-500 ${open ? "rotate-90" : ""}`}>
          <ChevronRight size={20} strokeWidth={1.5} />
        </span>
      </button>

      {/* Smoothly expands using a grid-row trick so height animates naturally */}
      <div className={`grid transition-[grid-template-rows] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <ul className="grid grid-cols-2 gap-2 px-5 pb-5">
            {dimensions.map((d, i) => (
              <li key={d.id} className={open ? "rise" : ""} style={{ animationDelay: `${i * 45}ms` }}>
                <button
                  type="button"
                  onClick={() => choose(d.id)}
                  tabIndex={open ? 0 : -1}
                  className="flex w-full items-center gap-2.5 rounded-2xl border border-line/80 bg-ivory-light/50 px-3 py-3 text-left text-sm text-plum transition-colors duration-300 hover:border-taupe active:scale-[0.98]"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${d.accent}26`, color: d.accent }}>
                    <Icon name={d.icon} size={16} />
                  </span>
                  <span className="leading-tight">{d.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
