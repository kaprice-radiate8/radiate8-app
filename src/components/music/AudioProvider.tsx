"use client";

/**
 * AUDIO PLAYER (shared by the whole app)
 * One quiet player sits behind every screen, so music keeps playing
 * while you move around, and only one song plays at a time.
 *
 * Any component can use it:
 *   const { toggle, isPlaying } = useAudio();
 */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { Song } from "@/content/music";

type AudioState = {
  currentSong: Song | null;
  playing: boolean;
  /** 0 to 1, how far through the current song */
  progress: number;
  toggle: (song: Song) => void;
  isPlaying: (songId: string) => boolean;
};

const AudioContext = createContext<AudioState | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audioRef.current = audio;
    const onTime = () => setProgress(audio.duration ? audio.currentTime / audio.duration : 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      setPlaying(false);
      setProgress(0);
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const toggle = useCallback(
    (song: Song) => {
      const audio = audioRef.current;
      if (!audio) return;
      if (currentSong?.id === song.id) {
        if (audio.paused) audio.play().catch(() => {});
        else audio.pause();
        return;
      }
      audio.src = song.src;
      setCurrentSong(song);
      setProgress(0);
      audio.play().catch(() => {});
    },
    [currentSong],
  );

  const isPlaying = useCallback((songId: string) => playing && currentSong?.id === songId, [playing, currentSong]);

  return (
    <AudioContext.Provider value={{ currentSong, playing, progress, toggle, isPlaying }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio(): AudioState {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error("useAudio must be used inside <AudioProvider>");
  return ctx;
}
