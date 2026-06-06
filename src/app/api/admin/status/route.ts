import { NextResponse } from "next/server";

import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { isSupabaseAuthConfigured } from "@/lib/supabase/auth-server";

export async function GET() {
  if (!isSupabaseAuthConfigured()) {
    return NextResponse.json({
      authenticated: false,
      email: null,
      configured: false,
    });
  }

  try {
    const admin = await getAuthenticatedAdmin();

    return NextResponse.json({
      authenticated: admin !== null,
      email: admin?.email ?? null,
      configured: true,
    });
  } catch {
    return NextResponse.json({
      authenticated: false,
      email: null,
      configured: true,
    });
  }
}
