import type { CookieOptions } from "@supabase/ssr";

export function getSupabaseCookieOptions(): CookieOptions {
  return {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };
}
