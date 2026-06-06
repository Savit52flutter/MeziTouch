import { NextResponse } from "next/server";

import { createServerClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const supabase = createServerClient();

    const { data: session, error } = await supabase
      .from("sessions")
      .select("id, code, title, survey_pack, access_password")
      .eq("code", code.toUpperCase())
      .single();

    if (error || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: session.id,
      code: session.code,
      title: session.title,
      survey_pack: session.survey_pack,
      requires_password: Boolean(session.access_password),
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
