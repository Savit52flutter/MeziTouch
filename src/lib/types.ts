export type QuestionType = "multiple_choice" | "text";

export type SurveyPackId =
  | "silent_struggle"
  | "wake_up_call"
  | "reality_recovery"
  | "confidential_referral";

export interface SurveyEvent {
  id: string;
  title: string;
  created_at: string;
}

export interface Session {
  id: string;
  event_id: string;
  code: string;
  title: string;
  survey_pack: SurveyPackId;
  access_password: string | null;
  is_active: boolean;
  active_question_id: string | null;
  created_at: string;
}

export interface SessionMeta {
  id: string;
  code: string;
  title: string;
  survey_pack: SurveyPackId;
  requires_password: boolean;
}

export interface Question {
  id: string;
  session_id: string;
  section: string;
  prompt: string;
  question_type: QuestionType;
  options: string[];
  sort_order: number;
  is_confidential: boolean;
  allow_multiple: boolean;
  allow_other: boolean;
  created_at: string;
}

export interface Response {
  id: string;
  session_id: string;
  question_id: string;
  participant_id: string;
  answer: string;
  created_at: string;
}

export interface ResponseAggregate {
  answer: string;
  count: number;
  percentage: number;
}

export interface EventSessionSummary {
  id: string;
  code: string;
  title: string;
  survey_pack: SurveyPackId;
  access_password: string | null;
  question_count: number;
}
