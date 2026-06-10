import type { QuestionType } from "./types";

export const YOUR_VOICE_MATTERS_PACK_ID = "your_voice_matters" as const;

export interface VoiceMattersQuestionTemplate {
  section: string;
  prompt: string;
  question_type: QuestionType;
  options: string[];
  allow_multiple?: boolean;
}

export const YOUR_VOICE_MATTERS_TITLE = "Your Voice Matters";

const SECTION = "Your Voice Matters";

export const YOUR_VOICE_MATTERS_QUESTIONS: VoiceMattersQuestionTemplate[] = [
  {
    section: SECTION,
    prompt:
      "What leadership challenge currently has the greatest impact on your district's performance?",
    question_type: "multiple_choice",
    options: [
      "Resource constraints",
      "Staff shortages",
      "Communication gaps",
      "Programme delivery pressures",
      "Stakeholder expectations",
      "Budget limitations",
    ],
  },
  {
    section: SECTION,
    prompt:
      "What organisational support would help you be more effective in leading your district?",
    question_type: "multiple_choice",
    options: [
      "Additional resources",
      "Better systems",
      "Leadership development",
      "Faster decision-making",
      "Improved communication",
      "Administrative support",
    ],
  },
  {
    section: SECTION,
    prompt:
      "Which programme implementation challenge requires the most urgent attention in your district?",
    question_type: "multiple_choice",
    options: [
      "Capacity constraints",
      "Training needs",
      "Stakeholder engagement",
      "Monitoring and evaluation",
      "Funding",
      "Operational processes",
    ],
  },
  {
    section: SECTION,
    prompt:
      "What is one organisational process that could be improved to better support district operations?",
    question_type: "multiple_choice",
    options: [
      "Reporting processes",
      "Approval processes",
      "Communication channels",
      "Procurement",
      "HR support",
      "Information sharing",
    ],
  },
  {
    section: SECTION,
    prompt:
      "What leadership capability should be prioritised for development across district management teams?",
    question_type: "multiple_choice",
    options: [
      "People management",
      "Strategic planning",
      "Change management",
      "Communication",
      "Conflict resolution",
      "Decision-making",
    ],
  },
  {
    section: SECTION,
    prompt:
      "What aspect of the current organisational culture most enables success in your district?",
    question_type: "multiple_choice",
    options: [
      "Collaboration",
      "Accountability",
      "Teamwork",
      "Innovation",
      "Commitment",
      "Service orientation",
    ],
  },
  {
    section: SECTION,
    prompt:
      "What is the most important strategic priority that management should focus on over the next 6 months?",
    question_type: "multiple_choice",
    options: [
      "Service delivery",
      "Staff wellbeing",
      "Capacity building",
      "Programme quality",
      "Operational efficiency",
      "Stakeholder relationships",
    ],
  },
  {
    section: SECTION,
    prompt:
      "What one recommendation would you make to strengthen district level performance and outcomes?",
    question_type: "text",
    options: [],
  },
];

export function getYourVoiceMattersQuestions(): VoiceMattersQuestionTemplate[] {
  return YOUR_VOICE_MATTERS_QUESTIONS;
}
