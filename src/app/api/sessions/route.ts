import { NextResponse } from "next/server";

import { createSurveyEvent } from "@/lib/create-survey-event";
import { requireAdminApi } from "@/lib/require-admin-api";

export async function POST(request: Request) {
  const denied = await requireAdminApi();
  if (denied) {
    return denied;
  }

  try {
    const body = (await request.json()) as { title?: string };
    const title = body.title?.trim() || "Workplace Wellness Survey";
    const result = await createSurveyEvent(title);

    return NextResponse.json({
      eventId: result.event.id,
      title: result.event.title,
      sessions: result.sessions,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request" },
      { status: 500 },
    );
  }
}
