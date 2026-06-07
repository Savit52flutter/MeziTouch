import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/require-admin-api";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const denied = await requireAdminApi(request);
  if (denied) {
    return denied;
  }

  try {
    const supabase = createServerClient();
    const { data: events, error } = await supabase
      .from("survey_events")
      .select("id, title, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const eventsWithCounts = await Promise.all(
      (events ?? []).map(async (event) => {
        const { count } = await supabase
          .from("sessions")
          .select("id", { count: "exact", head: true })
          .eq("event_id", event.id);

        return {
          ...event,
          session_count: count ?? 0,
        };
      }),
    );

    return NextResponse.json({ events: eventsWithCounts });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
