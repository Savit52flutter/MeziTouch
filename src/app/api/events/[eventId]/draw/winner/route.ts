import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/require-admin-api";
import { createServerClient } from "@/lib/supabase/server";

function normalizeLabel(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const denied = await requireAdminApi(request);
  if (denied) {
    return denied;
  }

  try {
    const { eventId } = await params;
    const body = (await request.json()) as { label?: string };
    const label = normalizeLabel(body.label ?? "");

    if (!label) {
      return NextResponse.json({ error: "Missing winner name" }, { status: 400 });
    }

    const supabase = createServerClient();

    const { error } = await supabase.from("event_winners").insert({
      event_id: eventId,
      winner_label: label,
    });

    if (error) {
      // Unique violation => already won.
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "That name has already been chosen." },
          { status: 409 },
        );
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, winner: label });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

