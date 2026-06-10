import { createSessionCode } from "./session-code";
import { createSessionPassword } from "./session-password";
import { seedSurveyPack } from "./seed-survey";
import { createServerClient } from "./supabase/server";
import type { EventSessionSummary } from "./types";
import {
  YOUR_VOICE_MATTERS_PACK_ID,
  YOUR_VOICE_MATTERS_TITLE,
} from "./your-voice-matters-survey";

export async function createYourVoiceMattersEvent() {
  const supabase = createServerClient();

  const { data: event, error: eventError } = await supabase
    .from("survey_events")
    .insert({ title: YOUR_VOICE_MATTERS_TITLE })
    .select("id, title, created_at")
    .single();

  if (eventError || !event) {
    throw new Error(eventError?.message ?? "Failed to create survey event");
  }

  let code = createSessionCode();
  let session = null;
  let attempts = 0;

  while (attempts < 5) {
    const { data, error } = await supabase
      .from("sessions")
      .insert({
        event_id: event.id,
        code,
        title: YOUR_VOICE_MATTERS_TITLE,
        survey_pack: YOUR_VOICE_MATTERS_PACK_ID,
        access_password: createSessionPassword(),
      })
      .select("id, code, title, survey_pack, access_password")
      .single();

    if (!error && data) {
      session = data;
      break;
    }

    if (error?.code !== "23505") {
      throw new Error(error?.message ?? "Failed to create Your Voice Matters session");
    }

    code = createSessionCode();
    attempts += 1;
  }

  if (!session) {
    throw new Error("Could not create Your Voice Matters session");
  }

  try {
    const questionCount = await seedSurveyPack(session.id, YOUR_VOICE_MATTERS_PACK_ID);
    const createdSession: EventSessionSummary = {
      ...session,
      question_count: questionCount,
    };

    return {
      event,
      sessions: [createdSession],
    };
  } catch (seedError) {
    await supabase.from("sessions").delete().eq("id", session.id);
    await supabase.from("survey_events").delete().eq("id", event.id);
    throw seedError;
  }
}
