"use client";

/**
 * ONE DAILY ACTIVITY (web address: /activity/hand-on-heart)
 *
 * The song, a few simple steps she can read or hear, then one light
 * question: "What shifted?" A one-tap answer is welcome but never
 * required, and there's no writing, no streak, no score.
 */
import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ChevronLeft, Clock, RefreshCw, Volume2, VolumeX } from "lucide-react";
import { getFeelingPath } from "@/config/app.config";
import type { DailyActivity } from "@/lib/content";
import { store } from "@/lib/data";
import { Artwork } from "../Artwork";
import { SaveNotice } from "../SaveNotice";
import { SongCard } from "./SongCard";

const noSubscribe = () => () => {};

/** One-tap answers to the closing question. */
const feelings = ["Lighter", "Steadier", "Brighter", "More present", "About the same"];

const primaryButton =
  "inline-flex w-full items-center justify-center rounded-full bg-plum px-6 py-3.5 text-sm font-medium tracking-[0.14em] text-ivory uppercase transition-all active:scale-[0.98] disabled:opacity-40";

export function ActivityScreen({ activity, anotherId }: { activity: DailyActivity; anotherId?: string }) {
  const [step, setStep] = useState<"practice" | "notice">("practice");
  const path = getFeelingPath(activity.path);

  if (step === "notice") return <Notice activity={activity} />;

  return (
    <div>
      <Link href="/activity" className="-ml-1 inline-flex items-center gap-1 py-2 text-sm text-plum-soft">
        <ChevronLeft size={18} strokeWidth={1.4} /> How do you want to feel?
      </Link>

      <div className="rise mt-4">
        <Artwork colors={activity.artworkColors} url={activity.artworkUrl} size={null} className="h-36 w-full rounded-[1.75rem]" />
        <p className="label mt-6">
          Daily Activity{path ? ` · ${path.label}` : ""}
        </p>
        <h1 className="mt-2 font-serif text-5xl leading-none text-plum">{activity.title}</h1>
        <p className="mt-3 font-serif text-xl leading-snug text-plum-soft italic">{activity.purpose}</p>
        <p className="mt-3 flex items-center gap-1.5 text-sm text-plum-soft">
          <Clock size={14} strokeWidth={1.6} aria-hidden="true" /> About {activity.durationMinutes} {activity.durationMinutes === 1 ? "minute" : "minutes"} ·{" "}
          {activity.practice}
        </p>
      </div>

      <div className="rise mt-6 [animation-delay:120ms]">
        <SongCard song={activity.song} colors={activity.artworkColors} />
      </div>

      <section className="rise mt-6 [animation-delay:220ms]">
        <div className="flex items-center justify-between">
          <p className="label">The practice</p>
          <Guidance activity={activity} />
        </div>
        <ol className="mt-4 space-y-4">
          {activity.guidance.map((line, i) => (
            <li key={i} className="flex gap-4">
              <span className="font-serif text-2xl leading-7 text-gold">{i + 1}</span>
              <span className="font-serif text-xl leading-7 text-plum">{line}</span>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-xs leading-relaxed text-plum-soft">Move gently, and only in ways that feel good for your body today.</p>
      </section>

      <div className="mt-8 space-y-2">
        <button type="button" onClick={() => setStep("notice")} className={primaryButton}>
          I&rsquo;m done
        </button>
        {anotherId && (
          <Link href={`/activity/${anotherId}`} className="flex w-full items-center justify-center gap-1.5 py-2 text-sm text-plum-soft">
            <RefreshCw size={14} strokeWidth={1.6} /> Try a different one
          </Link>
        )}
      </div>
    </div>
  );
}

/**
 * Hear the steps: a recording when there is one, otherwise the phone reads them aloud.
 */
function Guidance({ activity }: { activity: DailyActivity }) {
  const [speaking, setSpeaking] = useState(false);
  // Only known in the browser; while pre-rendering, assume no.
  const canSpeak = useSyncExternalStore(noSubscribe, () => "speechSynthesis" in window, () => false);

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  if (activity.guidanceAudioUrl) {
    return <audio controls preload="none" src={activity.guidanceAudioUrl} aria-label="Hear the guidance" className="h-9 max-w-44" />;
  }
  if (!canSpeak) return null;

  function toggle() {
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const words = new SpeechSynthesisUtterance(activity.guidance.join(" ... "));
    words.rate = 0.85;
    words.onend = () => setSpeaking(false);
    synth.cancel();
    synth.speak(words);
    setSpeaking(true);
  }

  return (
    <button type="button" onClick={toggle} className="inline-flex items-center gap-1.5 text-sm text-plum-soft transition-colors hover:text-plum">
      {speaking ? <VolumeX size={16} strokeWidth={1.6} /> : <Volume2 size={16} strokeWidth={1.6} />}
      {speaking ? "Stop" : "Read it to me"}
    </button>
  );
}

/** The light close: one question, an optional one-tap answer, and back to her day. */
function Notice({ activity }: { activity: DailyActivity }) {
  const [felt, setFelt] = useState<string | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  function choose(word: string) {
    setFelt(word);
    store.logActivity({ activityId: activity.id, felt: word }).then(
      () => setSaveFailed(false),
      () => setSaveFailed(true),
    );
  }

  return (
    <div className="flex min-h-[65dvh] flex-col justify-center text-center">
      <p className="label">{activity.title}</p>
      <h1 className="rise mt-4 font-serif text-5xl leading-tight text-plum">{activity.notice}</h1>
      <ul className="rise mt-8 flex flex-wrap justify-center gap-2 [animation-delay:150ms]" aria-label="How you feel now">
        {feelings.map((word) => (
          <li key={word}>
            <button
              type="button"
              aria-pressed={felt === word}
              onClick={() => choose(word)}
              className={`rounded-full px-4 py-2.5 text-sm transition-colors ${felt === word ? "bg-plum text-ivory" : "bg-blush/70 text-plum hover:bg-blush"}`}
            >
              {word}
            </button>
          </li>
        ))}
      </ul>
      <p className={`mt-6 min-h-12 font-script text-4xl text-plum ${felt ? "rise" : "opacity-0"}`}>{felt ? "Carry that with you." : " "}</p>
      <SaveNotice message={saveFailed ? "That didn't save, but the feeling is still yours. You can tap again in a moment." : null} />
      <Link
        href="/"
        onClick={() => {
          // Finishing counts even without an answer; it's kept only for her own history.
          if (!felt) store.logActivity({ activityId: activity.id, felt: null }).catch(() => {});
        }}
        className={`${primaryButton} mt-6`}
      >
        Back to Today
      </Link>
    </div>
  );
}
