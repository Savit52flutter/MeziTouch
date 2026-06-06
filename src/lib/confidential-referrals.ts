import { formatAnswerForDisplay } from "./answers";
import { questionAllowsMultiple } from "./question-rules";
import type { Question, Response } from "./types";

export interface ConfidentialReferral {
  participant_id: string;
  submitted_at: string;
  wants_contact: string;
  support_type: string;
  contact_method: string;
  name: string;
  phone: string;
  email: string;
  comments: string;
}

function answerForQuestion(
  responses: Response[],
  question: Question | undefined,
): string {
  if (!question) {
    return "";
  }

  const response = responses.find((item) => item.question_id === question.id);
  if (!response) {
    return "";
  }

  return formatAnswerForDisplay(
    response.answer,
    questionAllowsMultiple(question),
  );
}

function latestSubmittedAt(responses: Response[]): string {
  const timestamps = responses
    .map((response) => response.created_at)
    .sort()
    .reverse();

  return timestamps[0] ?? "";
}

export function buildConfidentialReferrals(
  questions: Question[],
  responses: Response[],
): ConfidentialReferral[] {
  const byPrompt = new Map(questions.map((question) => [question.prompt, question]));
  const grouped = new Map<string, Response[]>();

  for (const response of responses) {
    const existing = grouped.get(response.participant_id) ?? [];
    existing.push(response);
    grouped.set(response.participant_id, existing);
  }

  return Array.from(grouped.entries())
    .map(([participantId, participantResponses]) => ({
      participant_id: participantId,
      submitted_at: latestSubmittedAt(participantResponses),
      wants_contact: answerForQuestion(
        participantResponses,
        byPrompt.get(
          "Would you like someone from MeziTouch Rehab to contact you confidentially?",
        ),
      ),
      support_type: answerForQuestion(
        participantResponses,
        byPrompt.get("What type of support would you like information about?"),
      ),
      contact_method: answerForQuestion(
        participantResponses,
        byPrompt.get("Preferred contact method"),
      ),
      name: answerForQuestion(
        participantResponses,
        byPrompt.get("Employee Name and Surname"),
      ),
      phone: answerForQuestion(
        participantResponses,
        byPrompt.get("Contact Number"),
      ),
      email: answerForQuestion(
        participantResponses,
        byPrompt.get("Email Address"),
      ),
      comments: answerForQuestion(
        participantResponses,
        byPrompt.get("Additional comments or concerns"),
      ),
    }))
    .sort((a, b) => b.submitted_at.localeCompare(a.submitted_at));
}

const CSV_HEADERS = [
  "Submitted at",
  "Wants contact",
  "Support type",
  "Contact method",
  "Name and surname",
  "Contact number",
  "Email address",
  "Additional comments",
] as const;

function escapeCsvCell(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

export function confidentialReferralsToCsv(referrals: ConfidentialReferral[]): string {
  const rows = referrals.map((referral) =>
    [
      referral.submitted_at,
      referral.wants_contact,
      referral.support_type,
      referral.contact_method,
      referral.name,
      referral.phone,
      referral.email,
      referral.comments,
    ]
      .map(escapeCsvCell)
      .join(","),
  );

  return [CSV_HEADERS.join(","), ...rows].join("\r\n");
}
