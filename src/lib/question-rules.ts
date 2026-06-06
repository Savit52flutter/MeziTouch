import type { Question } from "./types";

const SINGLE_CHOICE_SCALES = [
  ["Yes", "Sometimes", "No"],
  ["Yes", "Maybe", "No"],
  ["Yes, a lot", "Sometimes", "Not really"],
  ["Very tired", "Sometimes tired", "Mostly okay"],
  ["Yes", "No", "Maybe, I would like more information"],
  ["Phone call", "WhatsApp", "Email", "Confidential in person discussion"],
];

function scaleKey(options: string[]): string {
  return [...options].sort().join("|");
}

export function isSingleChoiceScale(options: string[]): boolean {
  const key = scaleKey(options);
  return SINGLE_CHOICE_SCALES.some((scale) => scaleKey(scale) === key);
}

/** Runtime check — derives from options so existing DB rows still work. */
export function questionAllowsMultiple(
  question: Pick<Question, "question_type" | "options">,
): boolean {
  if (question.question_type !== "multiple_choice") {
    return false;
  }

  return !isSingleChoiceScale(question.options);
}

/** Used when seeding questions into the database. */
export function resolveAllowMultipleForSeed(
  questionType: string,
  options: string[],
  templateAllowMultiple?: boolean,
): boolean {
  if (questionType !== "multiple_choice") {
    return false;
  }

  if (templateAllowMultiple === false) {
    return false;
  }

  if (templateAllowMultiple === true) {
    return true;
  }

  return questionAllowsMultiple({ question_type: questionType, options });
}

export function questionAllowsOther(
  question: Pick<Question, "question_type" | "options" | "allow_other">,
): boolean {
  if (question.allow_other) {
    return true;
  }

  return questionAllowsMultiple(question);
}
