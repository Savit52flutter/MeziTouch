import { NextResponse } from "next/server";

import { buildConfidentialReferrals } from "@/lib/confidential-referrals";
import { requireAdminApi } from "@/lib/require-admin-api";
import { getSessionByCode } from "@/lib/session-lookup";
import { createServerClient } from "@/lib/supabase/server";

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

    if (session.survey_pack !== "confidential_referral") {
      return NextResponse.json(
        { error: "This session is not a confidential referral pack" },
        { status: 400 },
      );
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

    const referrals = buildConfidentialReferrals(questions ?? [], responses ?? []);

    return NextResponse.json({ referrals });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request" },
      { status: 400 },
    );
  }
}
