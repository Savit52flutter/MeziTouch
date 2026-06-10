import type { SurveyPackId } from "./types";
import { createServerClient } from "./supabase/server";
import { getPackQuestions, type SurveyPackId as WellnessPackId } from "./wellness-survey";
import {
  getYourVoiceMattersQuestions,
  YOUR_VOICE_MATTERS_PACK_ID,
} from "./your-voice-matters-survey";

function getQuestionsForPack(packId: SurveyPackId) {
  if (packId === YOUR_VOICE_MATTERS_PACK_ID) {
    return getYourVoiceMattersQuestions();
  }

  return getPackQuestions(packId as WellnessPackId);
}

export async function seedSurveyPack(sessionId: string, packId: SurveyPackId) {
  const supabase = createServerClient();
  const questions = getQuestionsForPack(packId);

  const rows = questions.map((question, index) => ({
    session_id: sessionId,
    section: question.section,
    prompt: question.prompt,
    question_type: question.question_type,
    options: question.options,
    sort_order: index,
    is_confidential: "is_confidential" in question ? (question.is_confidential ?? false) : false,
  }));

  const { error } = await supabase.from("questions").insert(rows);

  if (error) {
    throw new Error(error.message);
  }

  return rows.length;
}
