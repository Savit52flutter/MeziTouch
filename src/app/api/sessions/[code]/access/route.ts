import { NextResponse } from "next/server";

import { buildSessionAccessCookie } from "@/lib/session-auth";
import { getSessionByCode } from "@/lib/session-lookup";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const session = await getSessionByCode(code);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.access_password) {
      return NextResponse.json(
        { error: "Password required for this session" },
        { status: 403 },
      );
    }

    const response = NextResponse.json({ ok: true });
    response.headers.set(
      "Set-Cookie",
      buildSessionAccessCookie(session.id, session.code),
    );
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
