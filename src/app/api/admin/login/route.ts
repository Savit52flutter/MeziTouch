import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  getSupabaseCookieOptions,
  isAdminUser,
} from "@/lib/supabase/auth-server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };
    const email = body.email?.trim() ?? "";
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      return NextResponse.json(
        { error: "Supabase auth is not configured" },
        { status: 500 },
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
      cookieOptions: getSupabaseCookieOptions(),
    });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return NextResponse.json(
        { error: error?.message ?? "Login failed" },
        { status: 401 },
      );
    }

    if (!isAdminUser(data.user)) {
      await supabase.auth.signOut();
      return NextResponse.json(
        {
          error:
            "This account is not authorised for admin access. Set user metadata role to admin or add the email to ADMIN_EMAILS.",
        },
        { status: 403 },
      );
    }

    return NextResponse.json({
      ok: true,
      email: data.user.email,
      access_token: data.session?.access_token ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
