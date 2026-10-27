/**
 * The one Supabase connection, made the first time it's needed in the browser.
 * Sessions are kept on the device and refreshed automatically. Sign-in links
 * come back to /auth/callback, where the session is picked up from the link.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { backend } from "@/config/backend";

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (!client) {
    client = createClient(backend.supabaseUrl, backend.supabaseKey, {
      auth: { flowType: "pkce", persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: "radiate:auth" },
    });
  }
  return client;
}

/** The signed-in member's id, or null. Read from the device, so it's instant. */
export async function currentMemberId(): Promise<string | null> {
  const { data } = await supabase().auth.getSession();
  return data.session?.user.id ?? null;
}
