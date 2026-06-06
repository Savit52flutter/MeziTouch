import { NextResponse } from "next/server";

import { buildSessionAccessCookie } from "@/lib/session-auth";
import {
  isValidSessionPasswordFormat,
  normalizeSessionPassword,
  sessionPasswordHint,
} from "@/lib/session-password";
import { getSessionByCode } from "@/lib/session-lookup";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const body = (await request.json()) as { password?: string };
    const session = await getSessionByCode(code);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (!session.access_password) {
      const response = NextResponse.json({ ok: true });
      response.headers.set(
        "Set-Cookie",
        buildSessionAccessCookie(session.id, session.code),
      );
      return response;
    }

    const password = normalizeSessionPassword(body.password ?? "");

    if (!isValidSessionPasswordFormat(password)) {
      return NextResponse.json(
        { error: `Enter a valid password: ${sessionPasswordHint()}` },
        { status: 400 },
      );
    }

    if (password !== session.access_password) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
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
