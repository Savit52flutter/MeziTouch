import { createSessionPassword } from "./session-password";
import { createSessionCode } from "./session-code";
import { seedSurveyPack } from "./seed-survey";
import { SURVEY_PACKS } from "./wellness-survey";
import { createServerClient } from "./supabase/server";
import type { EventSessionSummary } from "./types";

export async function createSurveyEvent(title: string) {
  const supabase = createServerClient();

  const { data: event, error: eventError } = await supabase
    .from("survey_events")
    .insert({ title })
    .select("id, title, created_at")
    .single();

  if (eventError || !event) {
    throw new Error(eventError?.message ?? "Failed to create survey event");
  }

  const createdSessions: EventSessionSummary[] = [];

  for (const pack of SURVEY_PACKS) {
    let code = createSessionCode();
    let session = null;
    let attempts = 0;

    while (attempts < 5) {
      const password = pack.requiresPassword ? createSessionPassword() : null;

      const { data, error } = await supabase
        .from("sessions")
        .insert({
          event_id: event.id,
          code,
          title: pack.title,
          survey_pack: pack.id,
          access_password: password,
        })
        .select("id, code, title, survey_pack, access_password")
        .single();

      if (!error && data) {
        session = data;
        break;
      }

      if (error?.code !== "23505") {
        throw new Error(error?.message ?? `Failed to create ${pack.title} session`);
      }

      code = createSessionCode();
      attempts += 1;
    }

    if (!session) {
      throw new Error(`Could not create session for ${pack.title}`);
    }

    try {
      const questionCount = await seedSurveyPack(session.id, pack.id);
      createdSessions.push({
        ...session,
        question_count: questionCount,
      });
    } catch (seedError) {
      await supabase.from("sessions").delete().eq("id", session.id);
      throw seedError;
    }
  }

  return {
    event,
    sessions: createdSessions,
  };
}
