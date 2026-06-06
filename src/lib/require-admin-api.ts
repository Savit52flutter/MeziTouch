import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "./admin-auth";

export async function requireAdminApi() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return NextResponse.json(
      { error: "Admin authentication required" },
      { status: 401 },
    );
  }

  return null;
}
