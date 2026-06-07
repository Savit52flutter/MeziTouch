import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/require-admin-api";
import { seedSurveyPack } from "@/lib/seed-survey";
import { getSessionByCode } from "@/lib/session-lookup";
import { createServerClient } from "@/lib/supabase/server";
import type { SurveyPackId } from "@/lib/types";

export async function POST(
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

    const { error: deleteResponsesError } = await supabase
      .from("responses")
      .delete()
      .eq("session_id", session.id);

    if (deleteResponsesError) {
      return NextResponse.json(
        { error: deleteResponsesError.message },
        { status: 500 },
      );
    }

    const { error: deleteError } = await supabase
      .from("questions")
      .delete()
      .eq("session_id", session.id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    await supabase
      .from("sessions")
      .update({ active_question_id: null })
      .eq("id", session.id);

    const questionCount = await seedSurveyPack(
      session.id,
      session.survey_pack as SurveyPackId,
    );

    return NextResponse.json({ questionCount });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request" },
      { status: 400 },
    );
  }
}
