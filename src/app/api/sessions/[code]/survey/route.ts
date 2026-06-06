import { NextResponse } from "next/server";

import { hasValidSessionAccess } from "@/lib/session-auth";
import { getSessionByCode } from "@/lib/session-lookup";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const session = await getSessionByCode(code);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const allowed = await hasValidSessionAccess(session.id, session.code);

    if (!allowed) {
      return NextResponse.json({ error: "Session access required" }, { status: 401 });
    }

    const participantId = new URL(request.url).searchParams
      .get("participant_id")
      ?.trim();

    if (!participantId) {
      return NextResponse.json({ error: "Missing participant_id" }, { status: 400 });
    }

    const supabase = createServerClient();
    const [{ data: questions, error: questionsError }, { data: responses, error: responsesError }] =
      await Promise.all([
        supabase
          .from("questions")
          .select("*")
          .eq("session_id", session.id)
          .order("sort_order", { ascending: true }),
        supabase
          .from("responses")
          .select("question_id, answer")
          .eq("session_id", session.id)
          .eq("participant_id", participantId),
      ]);

    if (questionsError || responsesError) {
      return NextResponse.json(
        { error: questionsError?.message ?? responsesError?.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      session: {
        id: session.id,
        code: session.code,
        title: session.title,
        survey_pack: session.survey_pack,
      },
      questions: questions ?? [],
      answers: responses ?? [],
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
