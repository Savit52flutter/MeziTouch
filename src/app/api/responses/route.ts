import { NextResponse } from "next/server";

import { hasValidSessionAccess } from "@/lib/session-auth";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      session_id?: string;
      session_code?: string;
      question_id?: string;
      participant_id?: string;
      answer?: string;
    };

    const sessionId = body.session_id?.trim();
    const sessionCode = body.session_code?.trim().toUpperCase();
    const questionId = body.question_id?.trim();
    const participantId = body.participant_id?.trim();
    const answer = body.answer?.trim();

    if (!sessionId || !sessionCode || !questionId || !participantId || !answer) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const allowed = await hasValidSessionAccess(sessionId, sessionCode);

    if (!allowed) {
      return NextResponse.json({ error: "Session access required" }, { status: 401 });
    }

    const supabase = createServerClient();

    const { data: question, error: questionError } = await supabase
      .from("questions")
      .select("id")
      .eq("id", questionId)
      .eq("session_id", sessionId)
      .single();

    if (questionError || !question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("responses")
      .upsert(
        {
          session_id: sessionId,
          question_id: questionId,
          participant_id: participantId,
          answer,
        },
        { onConflict: "question_id,participant_id" },
      )
      .select("id, answer, created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
