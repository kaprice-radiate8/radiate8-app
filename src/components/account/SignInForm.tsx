"use client";

/**
 * SIGN IN OR CREATE AN ACCOUNT, with no password
 *
 * She enters her email and we send her a sign-in email. She can tap its link,
 * or type its 6-digit code here. The code matters on a phone where the app
 * is on the home screen: links open in the browser, the code works anywhere.
 * The same steps create an account the first time.
 */
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { SaveNotice } from "../SaveNotice";

const primaryButton =
  "w-full rounded-full bg-plum px-6 py-4 text-sm font-medium tracking-[0.2em] text-ivory uppercase transition-transform active:scale-[0.98] disabled:opacity-40";
const lineInput =
  "w-full border-b border-line bg-transparent pb-2 font-serif text-3xl text-plum outline-none placeholder:text-plum-soft/40 focus:border-plum";

/** Plain words for what went wrong. */
function explain(error: { message?: string; status?: number } | null): string {
  const message = error?.message?.toLowerCase() ?? "";
  if (error?.status === 429 || message.includes("rate limit") || message.includes("security purposes"))
    return "Several emails were sent just now. Please wait a few minutes, then try again.";
  if (message.includes("expired") || message.includes("invalid")) return "That code didn't work. It may have expired, so you can send a new one.";
  if (message.includes("email")) return "That email address doesn't look quite right. Please check it.";
  return "We couldn't reach the sign-in service just now. Please check your connection and try again.";
}

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    const address = (sentTo ?? email).trim();
    if (!address) return;
    setBusy(true);
    const { error } = await supabase().auth.signInWithOtp({
      email: address,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback`, shouldCreateUser: true },
    });
    setBusy(false);
    if (error) return setProblem(explain(error));
    setProblem(null);
    setSentTo(address);
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (!sentTo || code.trim().length < 6) return;
    setBusy(true);
    const { error } = await supabase().auth.verifyOtp({ email: sentTo, token: code.trim(), type: "email" });
    setBusy(false);
    // Signed in: the account gate takes it from here.
    if (error) setProblem(explain(error));
  }

  if (!sentTo) {
    return (
      <form onSubmit={send}>
        <p className="label">Your private space</p>
        <h1 className="mt-3 font-serif text-[2.6rem] text-plum">Where should we send your way in?</h1>
        <p className="mt-3 text-plum-soft">Enter your email and we&rsquo;ll send you a way to come in. There&rsquo;s no password to remember, and only you can see what you keep here.</p>
        <label htmlFor="sign-in-email" className="sr-only">
          Your email
        </label>
        <input
          id="sign-in-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={`${lineInput} mt-8`}
        />
        <SaveNotice className="mt-5" message={problem} />
        <button type="submit" disabled={busy || !email.trim()} className={`${primaryButton} mt-8`}>
          Send my way in
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={verify}>
      <p className="label">Check your email</p>
      <h1 className="mt-3 font-serif text-[2.6rem] text-plum">It&rsquo;s on its way</h1>
      <p className="mt-3 text-plum-soft">
        We sent an email to <span className="text-plum">{sentTo}</span>. Tap the link in it on this phone, or type its 6-digit code here.
      </p>
      <label htmlFor="sign-in-code" className="label mt-8 block">
        The code from the email
      </label>
      <input
        id="sign-in-code"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={10}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        placeholder="123456"
        className={`${lineInput} mt-2 tracking-[0.3em]`}
      />
      <SaveNotice className="mt-5" message={problem} />
      <button type="submit" disabled={busy || code.length < 6} className={`${primaryButton} mt-8`}>
        Come in
      </button>
      <div className="mt-4 flex justify-between text-sm text-plum-soft">
        <button type="button" onClick={() => { setSentTo(null); setCode(""); setProblem(null); }} className="py-2">
          Use a different email
        </button>
        <button type="button" onClick={() => send()} disabled={busy} className="py-2">
          Send it again
        </button>
      </div>
    </form>
  );
}
