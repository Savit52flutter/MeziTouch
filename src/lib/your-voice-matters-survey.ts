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
      "What aspect of your role as a District Manager gives you the greatest sense of purpose?",
    question_type: "multiple_choice",
    options: [
      "Improving learner outcomes",
      "Supporting schools",
      "Developing educators",
      "Driving compliance",
      "Leading change",
      "Building partnerships",
    ],
  },
  {
    section: SECTION,
    prompt:
      "What three words best describe the culture you would like to see across our organisation?",
    question_type: "multiple_choice",
    options: [
      "Accountable",
      "Collaborative",
      "Innovative",
      "Respectful",
      "Supportive",
      "High-performing",
    ],
    allow_multiple: true,
  },
  {
    section: SECTION,
    prompt:
      "Which support from Head Office would have the greatest impact on your district's performance?",
    question_type: "multiple_choice",
    options: [
      "Timely communication",
      "Capacity building",
      "Resource allocation",
      "Faster decision-making",
      "Compliance support",
      "Data systems",
    ],
  },
  {
    section: SECTION,
    prompt:
      "If you could improve one organisational process tomorrow, what would it be and why?",
    question_type: "multiple_choice",
    options: [
      "Reporting processes",
      "Approval processes",
      "Communication channels",
      "Procurement turnaround times",
      "Data management systems",
    ],
  },
  {
    section: SECTION,
    prompt: 'Complete this statement: "I feel most empowered to lead when..."',
    question_type: "multiple_choice",
    options: [
      "I am trusted to make decisions",
      "I receive clear direction",
      "My contributions are recognised",
      "I have the necessary resources",
      "My team collaborates effectively",
    ],
  },
  {
    section: SECTION,
    prompt:
      "What leadership quality do you believe is most important for a District Manager to succeed?",
    question_type: "multiple_choice",
    options: [
      "Integrity",
      "Accountability",
      "Communication",
      "Adaptability",
      "Strategic thinking",
      "Resilience",
    ],
  },
  {
    section: SECTION,
    prompt:
      "If you had the ability to solve one challenge affecting programme implementation instantly, what would it be?",
    question_type: "multiple_choice",
    options: [
      "Delayed submissions",
      "Resource constraints",
      "Stakeholder buy-in",
      "Compliance challenges",
      "Communication gaps",
      "Capacity limitations",
    ],
  },
  {
    section: SECTION,
    prompt:
      "What achievement in your district are you most proud of during the past year?",
    question_type: "multiple_choice",
    options: [
      "Improved learner performance",
      "Successful programme implementation",
      "Strong compliance",
      "Stakeholder partnerships",
      "Team development",
    ],
  },
  {
    section: SECTION,
    prompt:
      "What is one thing that Head Office does well that should be maintained or strengthened?",
    question_type: "multiple_choice",
    options: [
      "Technical support",
      "Communication",
      "Monitoring",
      "Training",
      "Stakeholder engagement",
    ],
  },
  {
    section: SECTION,
    prompt:
      "Looking ahead, what is the single most important priority for strengthening programme implementation in your district?",
    question_type: "multiple_choice",
    options: [
      "Monitoring",
      "Capacity building",
      "Data management",
      "Stakeholder engagement",
      "Compliance",
      "Learner support",
    ],
  },
];

export function getYourVoiceMattersQuestions(): VoiceMattersQuestionTemplate[] {
  return YOUR_VOICE_MATTERS_QUESTIONS;
}
