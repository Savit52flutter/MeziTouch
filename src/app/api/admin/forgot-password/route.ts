import { NextResponse } from "next/server";

import { getPasswordResetCallbackUrl } from "@/lib/auth-redirect";
import { normalizeEmailForAuth } from "@/lib/admin-email-config";
import { createAuthServerClient } from "@/lib/supabase/auth-server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = normalizeEmailForAuth(body.email ?? "");

    if (!email) {
      return NextResponse.json({ error: "Enter your email address." }, { status: 400 });
    }

    const supabase = await createAuthServerClient();

    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getPasswordResetCallbackUrl(request),
    });

    return NextResponse.json({
      ok: true,
      message: "If an account exists for that email, a reset link has been sent.",
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
