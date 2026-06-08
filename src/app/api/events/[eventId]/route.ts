import { NextResponse } from "next/server";

import { getAuthenticatedAdmin } from "@/lib/admin-auth";
import { requireAdminApi } from "@/lib/require-admin-api";
import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const denied = await requireAdminApi(_request);
  if (denied) {
    return denied;
  }

  try {
    const { eventId } = await params;
    const supabase = createServerClient();

    const { data: event, error: eventError } = await supabase
      .from("survey_events")
      .select("id, title, created_at")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const { data: sessions, error: sessionsError } = await supabase
      .from("sessions")
      .select("id, code, title, survey_pack, access_password, active_question_id")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });

    if (sessionsError) {
      return NextResponse.json({ error: sessionsError.message }, { status: 500 });
    }

    const sessionsWithCounts = await Promise.all(
      (sessions ?? []).map(async (session) => {
        const { count } = await supabase
          .from("questions")
          .select("id", { count: "exact", head: true })
          .eq("session_id", session.id);

        return {
          ...session,
          question_count: count ?? 0,
        };
      }),
    );

    return NextResponse.json({
      event,
      sessions: sessionsWithCounts,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const denied = await requireAdminApi(request);
  if (denied) {
    return denied;
  }

  try {
    const admin = await getAuthenticatedAdmin(request);

    if (!admin?.email) {
      return NextResponse.json(
        { error: "Admin authentication required" },
        { status: 401 },
      );
    }

    const body = (await request.json()) as { password?: string };
    const password = body.password ?? "";

    if (!password) {
      return NextResponse.json(
        { error: "Enter your admin password to delete this event." },
        { status: 400 },
      );
    }

    const authClient = await createAuthServerClient();
    const { error: verifyError } = await authClient.auth.signInWithPassword({
      email: admin.email,
      password,
    });

    if (verifyError) {
      return NextResponse.json(
        { error: "Incorrect admin password" },
        { status: 401 },
      );
    }

    const { eventId } = await params;
    const supabase = createServerClient();

    const { data: event, error: eventError } = await supabase
      .from("survey_events")
      .select("id")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const { error: deleteError } = await supabase
      .from("survey_events")
      .delete()
      .eq("id", eventId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
