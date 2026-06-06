import { NextResponse } from "next/server";

import { hasValidSessionAccess } from "@/lib/session-auth";
import { getSessionByCode } from "@/lib/session-lookup";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const session = await getSessionByCode(code);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const hasAccess = await hasValidSessionAccess(session.id, session.code);

    return NextResponse.json({
      has_access: hasAccess,
      requires_password: Boolean(session.access_password),
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
