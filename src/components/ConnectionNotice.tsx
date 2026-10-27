"use client";

/**
 * A gentle notice when her account can't be reached (no signal, or the
 * service is down). It goes away by itself once loading works again.
 */
import { useEffect, useState } from "react";
import { SaveNotice } from "./SaveNotice";

export function ConnectionNotice() {
  const [unreachable, setUnreachable] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onUnreachable = () => {
      setUnreachable(true);
      clearTimeout(timer);
      timer = setTimeout(() => setUnreachable(false), 8000);
    };
    const onOnline = () => setUnreachable(false);
    window.addEventListener("radiate:unreachable", onUnreachable);
    window.addEventListener("online", onOnline);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("radiate:unreachable", onUnreachable);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  if (!unreachable) return null;
  return (
    <div className="fixed inset-x-0 top-[max(0.75rem,env(safe-area-inset-top))] z-40 flex justify-center px-4">
      <SaveNotice className="w-full max-w-md shadow-lg" message="We can't reach your account just now. What you see is safe; please check your connection." />
    </div>
  );
}
