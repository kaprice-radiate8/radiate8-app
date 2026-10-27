import type { NextConfig } from "next";

/**
 * Accounts go live on Vercel once Supabase sign-in is set up (Site URL,
 * redirect links and email templates; see docs/accounts-setup.md).
 * Until then the deployed app keeps saving on each phone, as before.
 */
const ACCOUNTS_LIVE_ON_VERCEL = true;

const nextConfig: NextConfig = {
  env: {
    // See src/config/backend.ts. Set NEXT_PUBLIC_ACCOUNTS=on to try accounts locally.
    NEXT_PUBLIC_ACCOUNTS: process.env.NEXT_PUBLIC_ACCOUNTS ?? (process.env.VERCEL && ACCOUNTS_LIVE_ON_VERCEL ? "on" : "off"),
  },
};

export default nextConfig;
