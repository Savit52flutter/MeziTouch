import type { QuestionType } from "./types";

export type SurveyPackId =
  | "silent_struggle"
  | "wake_up_call"
  | "reality_recovery"
  | "confidential_referral";

export interface SurveyQuestionTemplate {
  section: string;
  prompt: string;
  question_type: QuestionType;
  options: string[];
  is_confidential?: boolean;
  allow_multiple?: boolean;
}

export interface SurveyPackConfig {
  id: SurveyPackId;
  title: string;
  section: string;
  requiresPassword: boolean;
}

export const SURVEY_PACKS: SurveyPackConfig[] = [
  {
    id: "silent_struggle",
    title: "The Silent Struggle",
    section: "The Silent Struggle",
    requiresPassword: true,
  },
  {
    id: "wake_up_call",
    title: "Wake Up Call",
    section: "Wake Up Call",
    requiresPassword: true,
  },
  {
    id: "reality_recovery",
    title: "Reality and Recovery",
    section: "Reality and Recovery",
    requiresPassword: true,
  },
  {
    id: "confidential_referral",
    title: "Confidential Referral",
    section: "Confidential Referral",
    requiresPassword: false,
  },
];

const PACK_QUESTIONS: Record<SurveyPackId, SurveyQuestionTemplate[]> = {
  silent_struggle: [
    {
      section: "The Silent Struggle",
      prompt:
        "Do you sometimes feel stressed or overwhelmed, even when you seem okay at work or home?",
      question_type: "multiple_choice",
      options: ["Yes", "Sometimes", "No"],
    },
    {
      section: "The Silent Struggle",
      prompt: "What do you usually do when you feel stressed or worried?",
      question_type: "multiple_choice",
      options: [
        "Drink alcohol",
        "Sleep",
        "Use my phone/social media scroll",
        "Talk to someone",
        "Keep it to myself",
        "Exercise",
        "Use a substance (drugs)",
      ],
    },
    {
      section: "The Silent Struggle",
      prompt: "Do you use unhealthy habits to cope with stress?",
      question_type: "multiple_choice",
      options: ["Yes, a lot", "Sometimes", "Not really"],
    },
    {
      section: "The Silent Struggle",
      prompt: "What do you think you struggle with the most?",
      question_type: "multiple_choice",
      options: [
        "Stress",
        "Money problems (finances)",
        "Alcohol or gambling",
        "Mental health",
        "Family problems",
        "Burnout in general (at work and home)",
      ],
    },
    {
      section: "The Silent Struggle",
      prompt:
        "Do you feel supported when you are going through a difficult time at work or at home?",
      question_type: "multiple_choice",
      options: ["Yes", "Sometimes", "No"],
    },
  ],
  wake_up_call: [
    {
      section: "Wake Up Call",
      prompt:
        "Do you find it difficult to relax without something like alcohol, drugs, your phone or gambling?",
      question_type: "multiple_choice",
      options: ["Yes", "Sometimes", "No"],
    },
    {
      section: "Wake Up Call",
      prompt: "Which problem do you think affects you the most today?",
      question_type: "multiple_choice",
      options: [
        "Stress (at home) or (at work)",
        "Alcohol",
        "Gambling",
        "Depression or anxiety",
        "Financial pressure",
        "Burnout",
      ],
    },
    {
      section: "Wake Up Call",
      prompt:
        "Do you know someone struggling with gambling, using a substance (drugs), alcohol or emotional stress?",
      question_type: "multiple_choice",
      options: ["Yes", "Maybe", "No"],
    },
    {
      section: "Wake Up Call",
      prompt: "How tired or emotionally drained do you feel lately?",
      question_type: "multiple_choice",
      options: ["Very tired", "Sometimes tired", "Mostly okay"],
    },
    {
      section: "Wake Up Call",
      prompt:
        "What part of this time we spent together today stood out to you the most?",
      question_type: "multiple_choice",
      options: [
        "Stress and burnout",
        "Alcohol discussion",
        "Gambling discussion",
        "Mental health",
        "Coping habits",
      ],
    },
  ],
  reality_recovery: [
    {
      section: "Reality and Recovery",
      prompt: "Would you ask for help if you were struggling emotionally?",
      question_type: "multiple_choice",
      options: ["Yes", "Maybe", "No"],
    },
    {
      section: "Reality and Recovery",
      prompt: "Which warning sign do you notice most in yourself?",
      question_type: "multiple_choice",
      options: [
        "Stress",
        "Poor sleep",
        "Feeling tired",
        "Mood swings",
        "Anxiety",
        "Financial stress",
      ],
    },
    {
      section: "Reality and Recovery",
      prompt: "Do you think it is okay for yourself to ask for help?",
      question_type: "multiple_choice",
      options: ["Yes", "Sometimes", "No"],
    },
    {
      section: "Reality and Recovery",
      prompt:
        "Which unhealthy habit do you think has become too normal today for you?",
      question_type: "multiple_choice",
      options: [
        "Drinking",
        "Gambling",
        "Social media",
        "Overworking",
        "Smoking/vaping",
      ],
    },
    {
      section: "Reality and Recovery",
      prompt: "Would you like more support or information?",
      question_type: "multiple_choice",
      options: ["Yes", "Maybe", "No"],
    },
  ],
  confidential_referral: [
    {
      section: "Confidential Referral",
      prompt:
        "Would you like someone from MeziTouch Rehab to contact you confidentially?",
      question_type: "multiple_choice",
      options: ["Yes", "No", "Maybe, I would like more information"],
      is_confidential: true,
    },
    {
      section: "Confidential Referral",
      prompt: "What type of support would you like information about?",
      question_type: "multiple_choice",
      options: [
        "Stress and burnout support",
        "Alcohol-related support",
        "Gambling addiction support",
        "Mental health support",
        "Trauma counselling",
        "Family support",
        "Substance abuse treatment",
        "Emotional wellness coaching",
        "Unsure, I just need someone to talk to",
      ],
      is_confidential: true,
    },
    {
      section: "Confidential Referral",
      prompt: "Preferred contact method",
      question_type: "multiple_choice",
      options: [
        "Phone call",
        "WhatsApp",
        "Email",
        "Confidential in person discussion",
      ],
      is_confidential: true,
    },
    {
      section: "Confidential Referral",
      prompt: "Employee Name and Surname",
      question_type: "text",
      options: [],
      is_confidential: true,
    },
    {
      section: "Confidential Referral",
      prompt: "Contact Number",
      question_type: "text",
      options: [],
      is_confidential: true,
    },
    {
      section: "Confidential Referral",
      prompt: "Email Address",
      question_type: "text",
      options: [],
      is_confidential: true,
    },
    {
      section: "Confidential Referral",
      prompt: "Additional comments or concerns",
      question_type: "text",
      options: [],
      is_confidential: true,
    },
  ],
};

export function getPackQuestions(packId: SurveyPackId): SurveyQuestionTemplate[] {
  return PACK_QUESTIONS[packId];
}

export const CONFIDENTIAL_SECTION_NOTE =
  "This is an optional confidential referral section. Employees may complete this section privately if they would like support, guidance or confidential follow up from MeziTouch Rehab.";
