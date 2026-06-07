import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/require-admin-api";
import { getSessionByCode } from "@/lib/session-lookup";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const denied = await requireAdminApi(_request);
  if (denied) {
    return denied;
  }

  try {
    const { code } = await params;
    const session = await getSessionByCode(code);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const supabase = createServerClient();
    const { data: questions, error } = await supabase
      .from("questions")
      .select("*")
      .eq("session_id", session.id)
      .order("sort_order", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      session,
      questions: questions ?? [],
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
