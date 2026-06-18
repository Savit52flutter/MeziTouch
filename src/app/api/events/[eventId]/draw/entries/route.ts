import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/require-admin-api";
import { createServerClient } from "@/lib/supabase/server";

function normalizeLabel(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function isPlausibleNameQuestion(prompt: string): boolean {
  const p = prompt.toLowerCase();
  return (
    (p.includes("name") && p.includes("surname")) ||
    p.includes("full name") ||
    (p.includes("name") && !p.includes("username"))
  );
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const denied = await requireAdminApi(request);
  if (denied) {
    return denied;
  }

  try {
    const { eventId } = await params;
    const supabase = createServerClient();

    const { data: sessions, error: sessionsError } = await supabase
      .from("sessions")
      .select("id")
      .eq("event_id", eventId);

    if (sessionsError) {
      return NextResponse.json({ error: sessionsError.message }, { status: 500 });
    }

    const sessionIds = (sessions ?? []).map((s) => s.id).filter(Boolean);
    if (sessionIds.length === 0) {
      return NextResponse.json({ entries: [], winners: [] });
    }

    const { data: questions, error: questionsError } = await supabase
      .from("questions")
      .select("id, prompt, question_type, session_id")
      .in("session_id", sessionIds);

    if (questionsError) {
      return NextResponse.json({ error: questionsError.message }, { status: 500 });
    }

    const nameQuestionIds = (questions ?? [])
      .filter((q) => q.question_type === "text" && isPlausibleNameQuestion(q.prompt))
      .map((q) => q.id);

    // Prefer name answers if present; else fall back to participant ids.
    let rawEntries: { label: string; participant_id: string | null }[] = [];

    if (nameQuestionIds.length > 0) {
      const { data: nameResponses, error: nameResponsesError } = await supabase
        .from("responses")
        .select("participant_id, answer, question_id, session_id")
        .in("session_id", sessionIds)
        .in("question_id", nameQuestionIds);

      if (nameResponsesError) {
        return NextResponse.json(
          { error: nameResponsesError.message },
          { status: 500 },
        );
      }

      rawEntries = (nameResponses ?? [])
        .map((r) => ({
          label: normalizeLabel(r.answer ?? ""),
          participant_id: r.participant_id ?? null,
        }))
        .filter((r) => r.label.length >= 2);
    }

    if (rawEntries.length === 0) {
      const { data: anyResponses, error: anyResponsesError } = await supabase
        .from("responses")
        .select("participant_id, session_id")
        .in("session_id", sessionIds);

      if (anyResponsesError) {
        return NextResponse.json(
          { error: anyResponsesError.message },
          { status: 500 },
        );
      }

      const uniqueParticipants = new Set<string>();
      for (const row of anyResponses ?? []) {
        if (!row.participant_id) continue;
        uniqueParticipants.add(row.participant_id);
      }

      rawEntries = [...uniqueParticipants].map((id) => ({
        label: id,
        participant_id: id,
      }));
    }

    // De-dupe by label (case-insensitive).
    const seen = new Set<string>();
    const deduped = rawEntries.filter((entry) => {
      const key = entry.label.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const { data: winners, error: winnersError } = await supabase
      .from("event_winners")
      .select("winner_label")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });

    if (winnersError) {
      return NextResponse.json({ error: winnersError.message }, { status: 500 });
    }

    const winnerSet = new Set(
      (winners ?? []).map((w) => normalizeLabel(w.winner_label).toLowerCase()),
    );

    const available = deduped
      .filter((e) => !winnerSet.has(e.label.toLowerCase()))
      .map((e) => e.label);

    return NextResponse.json({
      entries: available,
      winners: (winners ?? []).map((w) => w.winner_label),
      source: rawEntries.length > 0 && nameQuestionIds.length > 0 ? "names" : "participants",
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

