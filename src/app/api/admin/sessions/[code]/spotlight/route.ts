import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/require-admin-api";
import { getSessionByCode } from "@/lib/session-lookup";
import { createServerClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const denied = await requireAdminApi(request);
  if (denied) {
    return denied;
  }

  try {
    const { code } = await params;
    const session = await getSessionByCode(code);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const body = (await request.json()) as { question_id?: string | null };
    const questionId = body.question_id ?? null;

    const supabase = createServerClient();

    if (questionId) {
      const { data: question, error: questionError } = await supabase
        .from("questions")
        .select("id")
        .eq("id", questionId)
        .eq("session_id", session.id)
        .single();

      if (questionError || !question) {
        return NextResponse.json({ error: "Question not found" }, { status: 404 });
      }
    }

    const { error } = await supabase
      .from("sessions")
      .update({ active_question_id: questionId })
      .eq("id", session.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
