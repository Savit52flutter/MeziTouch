import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "./admin-auth";

export async function requireAdminApi(request?: Request) {
  const authenticated = await isAdminAuthenticated(request);

  if (!authenticated) {
    return NextResponse.json(
      { error: "Admin authentication required" },
      { status: 401 },
    );
  }

  return null;
}
