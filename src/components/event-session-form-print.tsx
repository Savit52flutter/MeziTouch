"use client";

import { MeziTouchLogo } from "@/components/mezitouch-logo";
import { questionAllowsMultiple, questionAllowsOther } from "@/lib/question-rules";
import { SURVEY_PACK_LABELS } from "@/lib/survey-pack-labels";
import type { EventSessionSummary, Question } from "@/lib/types";

interface EventSessionFormPrintProps {
  eventTitle: string;
  session: EventSessionSummary;
  questions: Question[];
}

function isMultiSelect(question: Question): boolean {
  return question.allow_multiple || questionAllowsMultiple(question);
}

export function EventSessionFormPrint({
  eventTitle,
  session,
  questions,
}: EventSessionFormPrintProps) {
  const label = SURVEY_PACK_LABELS[session.survey_pack] ?? session.title;

  return (
    <div className="hidden print:block">
      <div className="mx-auto max-w-[210mm] p-6 text-mezi-text">
        <div className="flex justify-center">
          <MeziTouchLogo size="lg" linked={false} />
        </div>

        <h1 className="mt-4 text-center text-2xl font-bold text-mezi-primary">
          {eventTitle}
        </h1>
        <h2 className="mt-2 text-center text-lg font-semibold text-mezi-teal">
          {label}
        </h2>

        <div className="mt-4 grid gap-2 rounded-xl border border-mezi-border p-4 text-sm sm:grid-cols-2">
          <p>
            <span className="font-medium text-mezi-muted">Session code: </span>
            <span className="font-mono font-semibold">{session.code}</span>
          </p>
          <p>
            <span className="font-medium text-mezi-muted">Password: </span>
            <span className="font-mono font-semibold">
              {session.access_password ?? "None required"}
            </span>
          </p>
        </div>

        <div className="mt-6 border-b border-mezi-border pb-4">
          <p className="text-sm font-medium text-mezi-muted">Name (optional)</p>
          <div className="mt-2 border-b border-mezi-gray" />
        </div>

        <div className="mt-6 space-y-8">
          {questions.map((question, index) => (
            <div key={question.id} className="break-inside-avoid">
              <p className="text-sm font-semibold text-mezi-primary">
                {index + 1}. {question.prompt}
              </p>
              {question.section && question.section !== label ? (
                <p className="mt-1 text-xs text-mezi-muted">{question.section}</p>
              ) : null}

              {question.question_type === "text" ? (
                <div className="mt-3 space-y-6">
                  <div className="border-b border-mezi-gray" />
                  <div className="border-b border-mezi-gray" />
                  <div className="border-b border-mezi-gray" />
                </div>
              ) : (
                <ul className="mt-3 space-y-2">
                  {question.options.map((option) => (
                    <li key={option} className="flex items-start gap-3 text-sm">
                      <span className="mt-0.5 inline-block h-4 w-4 shrink-0 rounded border border-mezi-gray" />
                      <span>{option}</span>
                    </li>
                  ))}
                  {questionAllowsOther(question) ? (
                    <li className="flex items-start gap-3 text-sm">
                      <span className="mt-0.5 inline-block h-4 w-4 shrink-0 rounded border border-mezi-gray" />
                      <span className="flex-1">
                        Other:{" "}
                        <span className="inline-block min-w-[12rem] border-b border-mezi-gray" />
                      </span>
                    </li>
                  ) : null}
                </ul>
              )}

              {question.question_type === "multiple_choice" && isMultiSelect(question) ? (
                <p className="mt-2 text-xs text-mezi-muted">Select all that apply</p>
              ) : null}
            </div>
          ))}
        </div>

        {questions.length === 0 ? (
          <p className="mt-8 text-center text-sm text-mezi-muted">
            No questions in this session pack.
          </p>
        ) : null}
      </div>
    </div>
  );
}
