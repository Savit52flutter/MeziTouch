import { NextResponse } from "next/server";

import { createYourVoiceMattersEvent } from "@/lib/create-your-voice-matters-event";
import { requireAdminApi } from "@/lib/require-admin-api";

export async function POST(request: Request) {
  const denied = await requireAdminApi(request);
  if (denied) {
    return denied;
  }

  try {
    const result = await createYourVoiceMattersEvent();

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
