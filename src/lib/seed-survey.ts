import { getPackQuestions, type SurveyPackId } from "./wellness-survey";
import { createServerClient } from "./supabase/server";

export async function seedSurveyPack(sessionId: string, packId: SurveyPackId) {
  const supabase = createServerClient();
  const questions = getPackQuestions(packId);

  const rows = questions.map((question, index) => ({
    session_id: sessionId,
    section: question.section,
    prompt: question.prompt,
    question_type: question.question_type,
    options: question.options,
    sort_order: index,
    is_confidential: question.is_confidential ?? false,
  }));

  const { error } = await supabase.from("questions").insert(rows);

  if (error) {
    throw new Error(error.message);
  }

  return rows.length;
}
