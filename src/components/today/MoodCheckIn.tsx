"use client";

/**
 * MOOD CHECK-IN: "How are you arriving today?"
 * One soft tap. Saved for today and gently answered.
 */
import { moods } from "@/config/app.config";
import { store, todayKey, useStoreData } from "@/lib/data";

export function MoodCheckIn() {
  const today = todayKey();
  const { data: entry } = useStoreData((s) => s.getMood(today));
  const selected = moods.find((m) => m.id === entry?.moodId);

  return (
    <section className="card p-5">
      <p className="label">Check in</p>
      <h2 className="mt-2 font-serif text-2xl text-espresso">How are you arriving today?</h2>

      <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="How are you arriving today?">
        {moods.map((mood) => {
          const active = mood.id === selected?.id;
          return (
            <button
              key={mood.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => store.setMood(today, mood.id)}
              className={`rounded-full border px-4 py-2 text-sm transition-all duration-500 active:scale-95 ${
                active
                  ? "border-terracotta bg-terracotta text-cream shadow-[0_8px_18px_-10px_var(--r8-terracotta)]"
                  : "border-line bg-sand-light/60 text-cocoa hover:border-clay"
              }`}
            >
              {mood.label}
            </button>
          );
        })}
      </div>

      {/* The gentle reply fades in once a mood is chosen */}
      <p
        key={selected?.id ?? "none"}
        className={`mt-4 min-h-8 font-script text-xl text-terracotta ${selected ? "rise" : "opacity-0"}`}
      >
        {selected?.reply ?? " "}
      </p>
    </section>
  );
}
