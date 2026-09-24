/**
 * THE DATA SWITCH
 *
 * The whole app gets its data from `store` below.
 * Today it points at browser storage. To move to Supabase later,
 * write a `supabaseStore` with the same functions and change this one line.
 */
import { localStore } from "./local-store";
import type { DataStore } from "./types";

export const store: DataStore = localStore;
