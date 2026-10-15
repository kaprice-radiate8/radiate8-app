"use client";

/**
 * PROFILE
 * Change the name the app greets you by, and replay the welcome.
 * Her history (assessments, Become choices, stories) joins this screen later.
 */
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { brand } from "@/config/app.config";
import { store, useStoreData } from "@/lib/data";
import { SaveNotice } from "../SaveNotice";

export function ProfileScreen() {
  const { data: profile, ready } = useStoreData((s) => s.getProfile());
  // `draft` is what's typed; until they type, show the saved name.
  const [draft, setDraft] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const value = draft ?? profile?.name ?? "";

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    try {
      await store.saveProfile({ ...profile, name: value.trim() });
    } catch {
      setSaved(false);
      setSaveFailed(true);
      return;
    }
    setSaveFailed(false);
    setDraft(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2400);
  }

  return (
    <div>
      <Link href="/" className="-ml-1 inline-flex items-center gap-1 py-2 text-sm text-plum-soft">
        <ChevronLeft size={18} strokeWidth={1.4} /> Today
      </Link>
      <h1 className="mt-4 font-serif text-4xl text-plum">Profile</h1>

      <form onSubmit={save} className="card mt-6 p-5">
        <label htmlFor="name" className="label">
          What should we call you?
        </label>
        <input
          id="name"
          value={value}
          onChange={(e) => setDraft(e.target.value)}
          disabled={!ready}
          autoComplete="given-name"
          placeholder="Your first name"
          className="mt-3 w-full border-b border-line bg-transparent pb-2 font-serif text-3xl text-plum outline-none placeholder:text-plum-soft/40 focus:border-plum"
        />
        <div className="mt-6 flex items-center gap-4">
          <button type="submit" disabled={!ready} className="rounded-full bg-plum px-6 py-3 text-sm font-medium tracking-[0.2em] text-ivory uppercase transition-transform active:scale-95">
            Save
          </button>
          <p className={`font-script text-3xl text-plum transition-opacity duration-500 ${saved ? "opacity-100" : "opacity-0"}`} aria-live="polite">
            Lovely, it&apos;s saved.
          </p>
        </div>
        <SaveNotice className="mt-4" message={saveFailed ? "Your name didn't save. Please try again in a moment." : null} />
      </form>

      <Link href="/intentions" className="card mt-4 flex items-center justify-between p-5 text-plum">
        <span className="font-serif text-xl">Your 90-day intentions</span>
        <span className="label">View</span>
      </Link>

      <Link href="/bloom" className="card mt-4 flex items-center justify-between p-5 text-plum">
        <span className="font-serif text-xl">Your bloom and bouquets</span>
        <span className="label">View</span>
      </Link>

      <Link href="/welcome" className="card mt-4 flex items-center justify-between p-5 text-plum">
        <span className="font-serif text-xl">Replay the welcome</span>
        <span className="label">View</span>
      </Link>

      <p className="mt-8 text-center text-xs leading-relaxed text-plum-soft/70">
        Everything you write stays private on this device.
        <br />
        {brand.brandName} · {brand.company}
      </p>
    </div>
  );
}
