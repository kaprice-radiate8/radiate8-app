"use client";

/**
 * MOOD CHECK-IN: "How are you arriving today?"
 * Soft round choices (as in the brand guide's app mockup). One tap saves
 * today's answer, and a gentle line answers back.
 */
import { moods } from "@/config/app.config";
import { store, todayKey, useStoreData } from "@/lib/data";
import { Icon } from "../Icon";

export function MoodCheckIn() {
  const today = todayKey();
  const { data: entry } = useStoreData((s) => s.getMood(today));
  const selected = moods.find((m) => m.id === entry?.moodId);

  return (
    <section className="card p-5">
      <p className="label">Check in</p>
      <h2 className="mt-2 font-serif text-2xl text-plum">How are you arriving today?</h2>

      <div className="mt-5 grid grid-cols-5 gap-1" role="radiogroup" aria-label="How are you arriving today?">
        {moods.map((mood) => {
          const active = mood.id === selected?.id;
          return (
            <button
              key={mood.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => store.setMood(today, mood.id)}
              className="group flex flex-col items-center gap-2"
            >
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-full transition-all duration-500 group-active:scale-95 ${
                  active ? "bg-plum text-ivory shadow-[0_10px_20px_-10px_var(--r8-plum)]" : "bg-blush/70 text-plum group-hover:bg-blush"
                }`}
              >
                <Icon name={mood.icon} size={22} />
              </span>
              <span className={`text-xs ${active ? "font-medium text-plum" : "text-plum-soft"}`}>{mood.label}</span>
            </button>
          );
        })}
      </div>

      {/* The gentle reply fades in once a mood is chosen */}
      <p key={selected?.id ?? "none"} className={`mt-4 min-h-7 text-center font-serif text-lg text-plum-soft italic ${selected ? "rise" : "opacity-0"}`}>
        {selected?.reply ?? " "}
      </p>
    </section>
  );
}
