import {
  isOtherAnswer,
  OTHER_OPTION_LABEL,
  parseStoredAnswer,
} from "./answers";
import { questionAllowsMultiple } from "./question-rules";
import type { Question, Response, ResponseAggregate } from "./types";

export function aggregateResponses(
  responses: Response[],
  question: Question,
): ResponseAggregate[] {
  const total = responses.length;
  const allowsMultiple = questionAllowsMultiple(question);

  if (question.question_type === "multiple_choice") {
    const counts = new Map<string, number>();

    for (const option of question.options) {
      counts.set(option, 0);
    }

    let otherCount = 0;

    for (const response of responses) {
      const parsed = parseStoredAnswer(response.answer, allowsMultiple);

      if (Array.isArray(parsed)) {
        for (const selection of parsed) {
          if (isOtherAnswer(selection)) {
            otherCount += 1;
            continue;
          }

          counts.set(selection, (counts.get(selection) ?? 0) + 1);
        }
        continue;
      }

      if (isOtherAnswer(parsed)) {
        otherCount += 1;
        continue;
      }

      counts.set(parsed, (counts.get(parsed) ?? 0) + 1);
    }

    const optionResults = question.options.map((option) => {
      const count = counts.get(option) ?? 0;
      return {
        answer: option,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      };
    });

    if (otherCount === 0) {
      return optionResults;
    }

    return [
      ...optionResults,
      {
        answer: OTHER_OPTION_LABEL,
        count: otherCount,
        percentage: total > 0 ? Math.round((otherCount / total) * 100) : 0,
      },
    ];
  }

  const textCounts = new Map<string, number>();

  for (const response of responses) {
    const normalized = response.answer.trim();
    if (!normalized) {
      continue;
    }
    textCounts.set(normalized, (textCounts.get(normalized) ?? 0) + 1);
  }

  return Array.from(textCounts.entries())
    .map(([answer, count]) => ({
      answer,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
}
