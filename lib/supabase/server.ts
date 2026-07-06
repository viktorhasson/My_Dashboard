import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

let client: SupabaseClient<Database> | null = null;

function getClient(): SupabaseClient<Database> {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
  }

  client = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
  return client;
}

// Lazily instantiated so importing this module (e.g. during Next.js build-time
// page data collection) never requires the env vars to be present — only
// actually querying the database does.
export const supabaseServer = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop) {
    const value = Reflect.get(getClient(), prop, getClient());
    return typeof value === "function" ? value.bind(getClient()) : value;
  },
});
