"use client";

/**
 * TODAY'S DEDICATION
 * Picks the song for today on the person's own device (so it changes
 * at their midnight, even offline) and shows it as a featured card.
 */
import { useSyncExternalStore } from "react";
import { getSong, getTodaysDedication, songs } from "@/content/music";
import { SongCard } from "../music/SongCard";

const noSubscribe = () => () => {};

export function TodaysDedication() {
  const songId = useSyncExternalStore(
    noSubscribe,
    () => getTodaysDedication().id, // in the browser: today's real song
    () => songs[0].id, // while pre-rendering on the server
  );
  const song = getSong(songId) ?? songs[0];
  return <SongCard song={song} featured eyebrow="Today's Dedication" />;
}
