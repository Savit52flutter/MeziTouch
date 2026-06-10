import { NextResponse } from "next/server";

import { getAdminAllowlistEmails } from "@/lib/admin-email-config";

export async function GET() {
  const adminAllowlistCount = getAdminAllowlistEmails().length;

  const checks = {
    supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    serviceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    sessionTokenSecret: Boolean(process.env.SESSION_TOKEN_SECRET),
    adminEmails: adminAllowlistCount > 0,
    adminAllowlistCount,
  };

  return NextResponse.json({
    ok: Object.values(checks).every(Boolean),
    checks,
  });
}
