import { NextResponse } from "next/server";

export async function GET() {
  const checks = {
    supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    serviceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    sessionTokenSecret: Boolean(process.env.SESSION_TOKEN_SECRET),
    adminEmails: Boolean(process.env.ADMIN_EMAILS),
  };

  return NextResponse.json({
    ok: Object.values(checks).every(Boolean),
    checks,
  });
}
