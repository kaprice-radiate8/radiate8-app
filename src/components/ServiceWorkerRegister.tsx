"use client";

/**
 * Turns on offline support by registering the service worker
 * (public/sw.js). Only runs in the production build, so it never
 * gets in the way while developing.
 */
import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {
      // If it fails the app still works online. Nothing to show the user.
    });
  }, []);
  return null;
}
