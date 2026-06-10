import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";

import {
  getUserAccountEmail,
  isEmailInAdminAllowlist,
} from "@/lib/admin-email-config";
import { getSupabaseCookieOptions } from "@/lib/supabase/cookie-options";

export { getSupabaseCookieOptions };

function getSupabaseAuthEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  return { url, anonKey };
}

export function isSupabaseAuthConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export async function createAuthServerClient() {
  const { url, anonKey } = getSupabaseAuthEnv();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component — cookie writes happen in route handlers.
        }
      },
    },
    cookieOptions: getSupabaseCookieOptions(),
  });
}

export function isAdminUser(user: User, verifiedLoginEmail?: string): boolean {
  const accountEmail = getUserAccountEmail(user, verifiedLoginEmail);

  if (accountEmail && isEmailInAdminAllowlist(accountEmail)) {
    return true;
  }

  return (
    user.app_metadata?.role === "admin" || user.user_metadata?.role === "admin"
  );
}

function getBearerTokenFromRequest(request?: Request): string | null {
  if (!request) {
    return null;
  }

  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.slice("Bearer ".length).trim();
  return token || null;
}

export async function getAuthenticatedAdmin(request?: Request) {
  const supabase = await createAuthServerClient();
  const bearerToken = getBearerTokenFromRequest(request);

  if (bearerToken) {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(bearerToken);

    if (!error && user && isAdminUser(user)) {
      return user;
    }
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user || !isAdminUser(user)) {
    return null;
  }

  return user;
}
