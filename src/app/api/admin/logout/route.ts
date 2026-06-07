import { NextResponse } from "next/server";

import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { createAuthServerClient } from "@/lib/supabase/auth-server";

export async function POST(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin(request);

    if (!admin?.email) {
      return NextResponse.json(
        { error: "Admin authentication required" },
        { status: 401 },
      );
    }

    const body = (await request.json()) as { password?: string };
    const password = body.password ?? "";

    if (!password) {
      return NextResponse.json(
        { error: "Enter your admin password to log out." },
        { status: 400 },
      );
    }

    const supabase = await createAuthServerClient();
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: admin.email,
      password,
    });

    if (verifyError) {
      return NextResponse.json({ error: "Incorrect admin password" }, { status: 401 });
    }

    await supabase.auth.signOut();

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
