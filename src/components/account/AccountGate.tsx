"use client";

/**
 * ACCOUNT GATE
 *
 * With accounts on, every screen except the welcome and sign-in screens
 * needs her to be signed in; anyone else is gently taken to the welcome.
 * The first time she signs in on a device, whatever was saved on it before
 * accounts existed is copied into her account (see import-device-data.ts).
 * With accounts off, this does nothing at all.
 */
import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { backend } from "@/config/backend";
import { importDeviceData } from "@/lib/data/import-device-data";
import { refreshAll } from "@/lib/data/supabase-store";
import { supabase } from "@/lib/supabase/client";
import { PaleEight } from "../PaleEight";

type Account =
  | { status: "off" }
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "signed-in"; email: string; memberId: string };

const AccountContext = createContext<Account>({ status: "off" });

/** Who is signed in, if accounts are on. */
export const useAccount = () => useContext(AccountContext);

/** Screens anyone can open without an account. */
const isOpen = (path: string) => path.startsWith("/welcome") || path.startsWith("/auth");

export function AccountGate({ children }: { children: React.ReactNode }) {
  if (!backend.accounts) return <AccountContext.Provider value={{ status: "off" }}>{children}</AccountContext.Provider>;
  return <Gate>{children}</Gate>;
}

function Gate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [account, setAccount] = useState<Account>({ status: "loading" });
  const [bringing, setBringing] = useState(false);

  useEffect(() => {
    const client = supabase();
    let imported: string | null = null;

    const settle = async (session: Awaited<ReturnType<typeof client.auth.getSession>>["data"]["session"]) => {
      if (!session) return setAccount({ status: "signed-out" });
      const memberId = session.user.id;
      if (imported !== memberId) {
        imported = memberId;
        setBringing(true);
        // If it doesn't finish (no signal), it simply tries again next time; nothing is lost or doubled.
        const done = await importDeviceData(memberId).catch(() => false);
        setBringing(false);
        if (done) refreshAll();
      }
      setAccount({ status: "signed-in", email: session.user.email ?? "", memberId });
    };

    // INITIAL_SESSION arrives first, with whatever session this device already has.
    // Supabase asks that no other Supabase call is awaited inside this callback,
    // so settling happens just after it.
    const { data } = client.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "INITIAL_SESSION") setTimeout(() => settle(session), 0);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const mustLeave = account.status === "signed-out" && !isOpen(pathname);
  useEffect(() => {
    if (mustLeave) router.replace("/welcome");
  }, [mustLeave, router]);

  if (bringing) {
    return (
      <div className="flex min-h-[60dvh] flex-col items-center justify-center text-center" role="status">
        <PaleEight size={120} className="animate-breathe" />
        <p className="mt-6 font-serif text-2xl text-plum">Bringing your reflections into your account</p>
        <p className="mt-2 text-sm text-plum-soft">Just a moment.</p>
      </div>
    );
  }

  const showing = isOpen(pathname) || account.status === "signed-in";
  return (
    <AccountContext.Provider value={account}>
      {/* Stay invisible until we know, so nobody sees a flash of a private screen. */}
      <div className={`transition-opacity duration-500 ${showing ? "opacity-100" : "pointer-events-none opacity-0"}`}>{showing ? children : null}</div>
    </AccountContext.Provider>
  );
}
