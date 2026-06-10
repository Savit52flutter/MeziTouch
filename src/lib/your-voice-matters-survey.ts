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
    prompt: "What is one thing that makes being an educator worthwhile for you?",
    question_type: "multiple_choice",
    options: [
      "Seeing learners succeed",
      "Making a difference",
      "Working with great colleagues",
      "Being a role model",
      "Changing lives",
    ],
  },
  {
    section: SECTION,
    prompt:
      "If you could describe your ideal workplace in three words, what would they be?",
    question_type: "multiple_choice",
    options: [
      "Supportive",
      "Respectful",
      "Family orientated",
      "Professional",
      "Fun",
      "Inspiring",
    ],
    allow_multiple: true,
  },
  {
    section: SECTION,
    prompt:
      "Which employee benefit or support programme brings the most value to you and your family?",
    question_type: "multiple_choice",
    options: [
      "Housing assistance",
      "Vehicle benefits",
      "Medical aid",
      "Leave benefits",
      "Training opportunities",
      "Wellness support",
    ],
  },
  {
    section: SECTION,
    prompt: "If HR could make one thing easier for educators tomorrow, what would it be?",
    question_type: "multiple_choice",
    options: [
      "Communication",
      "Access to information",
      "Administrative processes",
      "Training opportunities",
      "Leave applications",
      "Recognition",
    ],
  },
  {
    section: SECTION,
    prompt: 'Complete this sentence: "I feel most valued at work when..."',
    question_type: "multiple_choice",
    options: [
      "My efforts are recognised",
      "My manager checks in on me",
      "I receive positive feedback",
      "I am trusted",
      "My family is considered",
      "I have opportunities to grow",
    ],
  },
  {
    section: SECTION,
    prompt: "If your teaching style had a movie title, what would it be?",
    question_type: "multiple_choice",
    options: [
      "Fast & Curious",
      "Mission Possible",
      "The Classroom Whisperer",
      "Back to the Whiteboard",
      "Guardians of the Gradebook",
      "Finding Homework",
    ],
  },
  {
    section: SECTION,
    prompt: "If you could have one superpower to help you survive a school day, what would it be?",
    question_type: "multiple_choice",
    options: [
      "Cloning myself",
      "Reading minds",
      "Unlimited energy",
      "Instant marking powers",
      "Teleportation",
      "Endless patience",
    ],
  },
  {
    section: SECTION,
    prompt: "What is the funniest thing a learner has ever said to you?",
    question_type: "text",
    options: [],
  },
];

export function getYourVoiceMattersQuestions(): VoiceMattersQuestionTemplate[] {
  return YOUR_VOICE_MATTERS_QUESTIONS;
}
