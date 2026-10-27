"use client";

/**
 * WHERE SIGN-IN LINKS LAND
 * The Supabase connection picks up the sign-in from the link by itself.
 * Then she goes on to Today, or to choose her name if she's new.
 * A link only works in the browser where it was asked for, so if it opens
 * somewhere else we say so plainly and offer the code instead.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { store } from "@/lib/data";
import { supabase } from "@/lib/supabase/client";
import { PaleEight } from "../PaleEight";

export function AuthCallback() {
  const router = useRouter();
  const [problem, setProblem] = useState(false);

  useEffect(() => {
    let active = true;
    supabase()
      .auth.getSession()
      .then(async ({ data }) => {
        if (!active) return;
        if (!data.session) return setProblem(true);
        const profile = await store.getProfile().catch(() => null);
        router.replace(profile?.onboardedAt ? "/" : "/welcome?step=name");
      });
    return () => {
      active = false;
    };
  }, [router]);

  if (problem) {
    return (
      <div className="flex min-h-[60dvh] flex-col justify-center text-center">
        <h1 className="font-serif text-4xl text-plum">This link couldn&rsquo;t sign you in</h1>
        <p className="mx-auto mt-4 max-w-xs text-plum-soft">
          It may have opened in a different browser from the one where you asked for it, or it may have expired. The 6-digit code in the same
          email works anywhere.
        </p>
        <Link href="/welcome?step=account" className="mt-8 rounded-full bg-plum px-6 py-4 text-sm font-medium tracking-[0.2em] text-ivory uppercase">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center text-center" role="status">
      <PaleEight size={120} className="animate-breathe" />
      <p className="mt-6 font-serif text-2xl text-plum">Opening your space</p>
    </div>
  );
}
