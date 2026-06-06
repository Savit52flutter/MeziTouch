import { NextResponse } from "next/server";

import { buildPresenterResults } from "@/lib/presenter-data";
import { requireAdminApi } from "@/lib/require-admin-api";
import { getSessionByCode } from "@/lib/session-lookup";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const denied = await requireAdminApi();
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
    const [{ data: questions, error: questionsError }, { data: responses, error: responsesError }] =
      await Promise.all([
        supabase
          .from("questions")
          .select("*")
          .eq("session_id", session.id)
          .order("sort_order", { ascending: true }),
        supabase.from("responses").select("*").eq("session_id", session.id),
      ]);

    if (questionsError || responsesError) {
      return NextResponse.json(
        { error: questionsError?.message ?? responsesError?.message },
        { status: 500 },
      );
    }

    const results = buildPresenterResults(questions ?? [], responses ?? []);

    return NextResponse.json({
      session: {
        id: session.id,
        event_id: session.event_id,
        code: session.code,
        title: session.title,
        survey_pack: session.survey_pack,
        is_active: session.is_active,
        active_question_id: session.active_question_id,
        created_at: session.created_at,
      },
      results,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
