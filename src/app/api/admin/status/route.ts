import { NextResponse } from "next/server";

import { getAuthenticatedAdmin } from "@/lib/admin-auth";

export async function GET() {
  const admin = await getAuthenticatedAdmin();

  return NextResponse.json({
    authenticated: admin !== null,
    email: admin?.email ?? null,
  });
}
