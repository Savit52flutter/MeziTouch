import { aggregateResponses } from "./aggregate";
import type { Question, Response, ResponseAggregate } from "./types";

export interface PresenterQuestionResults {
  question: Question;
  responses: Response[];
  results: ResponseAggregate[];
}

function sanitizeResponse(question: Question, response: Response): Response {
  if (question.is_confidential && question.question_type === "text") {
    return {
      ...response,
      answer: "[confidential]",
    };
  }

  return response;
}

export function buildPresenterResults(
  questions: Question[],
  responses: Response[],
): PresenterQuestionResults[] {
  return questions.map((question) => {
    const questionResponses = responses
      .filter((response) => response.question_id === question.id)
      .map((response) => sanitizeResponse(question, response));

    return {
      question,
      responses: questionResponses,
      results: aggregateResponses(questionResponses, question),
    };
  });
}
