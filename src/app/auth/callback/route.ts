import { NextResponse } from "next/server";

import { getRequestOrigin } from "@/lib/auth-redirect";
import { createAuthServerClient } from "@/lib/supabase/auth-server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = getRequestOrigin(request);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/auth/reset-password";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/auth/reset-password";

  if (!code) {
    return NextResponse.redirect(
      new URL("/auth/reset-password?error=missing_code", origin),
    );
  }

  const supabase = await createAuthServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL("/auth/reset-password?error=invalid_link", origin),
    );
  }

  return NextResponse.redirect(new URL(safeNext, origin));
}
