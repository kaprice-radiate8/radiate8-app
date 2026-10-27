/**
 * ============================================================
 *  BACKEND: where members' accounts and data live
 * ============================================================
 *
 * Accounts are ON in the deployed app (Vercel builds, once ACCOUNTS_LIVE_ON_VERCEL
 * in next.config.ts is true) and OFF on a developer's computer and in the
 * browser tests, where everything saves on the device as before.
 * To try accounts locally: NEXT_PUBLIC_ACCOUNTS=on npm run dev
 *
 * The Supabase address and publishable key below are designed to be public:
 * they only let a signed-in member reach her own rows (row-level security
 * in supabase/migrations). Never put a secret or service-role key here.
 */
export const backend = {
  accounts: process.env.NEXT_PUBLIC_ACCOUNTS === "on",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tdnxxdihcfzjqabqpblt.supabase.co",
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_XzM-d4GMoP57qE-RRoYG4A_eew2_Rj_",
} as const;
