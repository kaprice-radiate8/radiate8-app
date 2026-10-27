/**
 * THE DATA SWITCH
 *
 * The whole app gets its data from `store` below.
 * With accounts on (the deployed app), it's the member's private Supabase
 * account. With accounts off (a developer's computer, the browser tests),
 * it's the browser's own storage, exactly as before. See src/config/backend.ts.
 */
import { backend } from "@/config/backend";
import { localStore } from "./local-store";
import { supabaseStore } from "./supabase-store";
import type { DataStore } from "./types";

export const store: DataStore = backend.accounts ? supabaseStore : localStore;
