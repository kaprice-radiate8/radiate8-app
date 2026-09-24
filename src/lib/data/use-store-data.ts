"use client";

/**
 * useStoreData: the one way screens read saved data.
 *
 * Usage:
 *   const { data, ready } = useStoreData((s) => s.getProfile());
 *
 * - `ready` is false for a split second while data loads, so screens
 *   can fade in softly instead of flashing empty content.
 * - It automatically refreshes whenever data is saved anywhere in the app.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { store } from "./store";
import type { DataStore } from "./types";

export function useStoreData<T>(load: (s: DataStore) => Promise<T>) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [ready, setReady] = useState(false);

  // Always call the latest `load` without re-subscribing on every render.
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  });

  const refresh = useCallback(() => {
    let cancelled = false;
    loadRef.current(store).then((value) => {
      if (!cancelled) {
        setData(value);
        setReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const cancelFirstLoad = refresh();
    const unsubscribe = store.subscribe(() => refresh());
    return () => {
      cancelFirstLoad();
      unsubscribe();
    };
  }, [refresh]);

  return { data, ready };
}
