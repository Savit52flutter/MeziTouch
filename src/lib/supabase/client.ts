import { createClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client for REST operations only.
 * Audience pages use this for inserts/selects — no .channel() calls,
 * so no WebSocket connection is opened.
 */
export function createRestClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
