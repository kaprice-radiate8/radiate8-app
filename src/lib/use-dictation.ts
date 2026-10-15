"use client";

/**
 * VOICE TO TEXT
 *
 * Uses the browser's own speech recognition (Chrome, Edge and Safari,
 * including iPhone). Nothing is recorded or kept by Radiate: the browser
 * turns her voice into words, and only the words land on the page.
 * Where a browser can't do this (for example Firefox), `supported` is
 * false and the microphone button simply doesn't appear.
 */
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

// The parts of the Web Speech API used here (not yet in TypeScript's built-in types).
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};
type RecognitionClass = new () => Recognition;

function recognitionClass(): RecognitionClass | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as { SpeechRecognition?: RecognitionClass; webkitSpeechRecognition?: RecognitionClass };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

const noSubscribe = () => () => {};

/** Joins spoken words onto what's already written, with a space or new line as needed. */
function join(before: string, spoken: string) {
  const words = spoken.trim();
  if (!words) return before;
  if (!before.trim()) return words.charAt(0).toUpperCase() + words.slice(1);
  return /\s$/.test(before) ? before + words : `${before} ${words}`;
}

/**
 * `onText` receives the whole new text (what was written before, plus what she
 * has said so far), live as she speaks.
 */
export function useDictation(value: string, onText: (next: string) => void) {
  const supported = useSyncExternalStore(noSubscribe, () => recognitionClass() !== undefined, () => false);
  const [listening, setListening] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const recognition = useRef<Recognition | null>(null);
  // Always call the latest callback and read the latest text without restarting.
  const onTextRef = useRef(onText);
  const valueRef = useRef(value);
  useEffect(() => {
    onTextRef.current = onText;
    valueRef.current = value;
  });

  const stop = useCallback(() => recognition.current?.stop(), []);

  const start = useCallback(() => {
    const Recognition = recognitionClass();
    if (!Recognition) return;
    const r = new Recognition();
    r.lang = navigator.language || "en-US";
    r.continuous = true;
    r.interimResults = true;

    const before = valueRef.current;
    r.onresult = (e) => {
      // Rebuild from every result each time, so words are never added twice.
      let spoken = "";
      for (let i = 0; i < e.results.length; i++) spoken = join(spoken, e.results[i][0].transcript);
      onTextRef.current(join(before, spoken));
    };
    r.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setProblem("The microphone is turned off for this app. You can allow it in your browser's settings, or keep writing by hand.");
      } else if (e.error !== "no-speech" && e.error !== "aborted") {
        setProblem("Voice writing stopped. Tap the microphone to try again.");
      }
    };
    r.onend = () => {
      setListening(false);
      recognition.current = null;
    };

    setProblem(null);
    try {
      r.start();
    } catch {
      setProblem("Voice writing couldn't start. Tap the microphone to try again.");
      return;
    }
    recognition.current = r;
    setListening(true);
  }, []);

  // Stop listening when she leaves the page.
  useEffect(() => () => recognition.current?.abort(), []);

  return { supported, listening, problem, start, stop };
}
