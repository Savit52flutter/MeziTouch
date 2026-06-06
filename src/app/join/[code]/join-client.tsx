"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Badge, Button, Card, Input, PageShell, Textarea } from "@/components/ui";
import {
  buildMultiSelectAnswer,
  OTHER_OPTION_LABEL,
  splitMultiSelectAnswer,
} from "@/lib/answers";
import { getParticipantId } from "@/lib/participant";
import {
  questionAllowsMultiple,
  questionAllowsOther,
} from "@/lib/question-rules";
import {
  normalizeSessionPassword,
  SESSION_PASSWORD_DIGITS,
  SESSION_PASSWORD_PREFIX,
  sessionPasswordHint,
} from "@/lib/session-password";
import { CONFIDENTIAL_SECTION_NOTE } from "@/lib/wellness-survey";
import type { Question, SessionMeta } from "@/lib/types";

function isLongTextQuestion(question: Question) {
  return (
    question.question_type === "text" &&
    question.prompt.toLowerCase().includes("comments")
  );
}

export default function JoinClient({ code }: { code: string }) {
  const [sessionMeta, setSessionMeta] = useState<SessionMeta | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [singleAnswer, setSingleAnswer] = useState("");
  const [multiAnswers, setMultiAnswers] = useState<string[]>([]);
  const [otherSelected, setOtherSelected] = useState(false);
  const [otherText, setOtherText] = useState("");
  const [textAnswer, setTextAnswer] = useState("");
  const [savedAnswers, setSavedAnswers] = useState<Record<string, string>>({});
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");

  const currentQuestion = questions[currentIndex] ?? null;

  const answeredCount = useMemo(
    () => questions.filter((question) => savedAnswers[question.id]).length,
    [questions, savedAnswers],
  );

  const loadSessionMeta = useCallback(async () => {
    const response = await fetch(`/api/sessions/${code}`);
    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Session not found. Check the code and try again.");
      setLoading(false);
      return null;
    }

    setSessionMeta(data);
    return data as SessionMeta;
  }, [code]);

  const loadSurvey = useCallback(async () => {
    const participantId = getParticipantId();
    const response = await fetch(
      `/api/sessions/${code}/survey?participant_id=${encodeURIComponent(participantId)}`,
      { credentials: "include" },
    );
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        setIsUnlocked(false);
      }
      setError(data.error ?? "Failed to load survey.");
      setLoading(false);
      return;
    }

    const loadedQuestions = (data.questions ?? []) as Question[];
    setQuestions(loadedQuestions);
    setSessionMeta((current) => current ?? data.session);

    const answers: Record<string, string> = {};
    for (const item of data.answers ?? []) {
      answers[item.question_id] = item.answer;
    }

    setSavedAnswers(answers);

    const firstUnanswered = loadedQuestions.findIndex(
      (question) => !answers[question.id],
    );
    if (firstUnanswered === -1 && loadedQuestions.length > 0) {
      setIsComplete(true);
      setCurrentIndex(loadedQuestions.length - 1);
    } else {
      setCurrentIndex(firstUnanswered >= 0 ? firstUnanswered : 0);
    }

    setLoading(false);
  }, [code]);

  const loadQuestionDraft = useCallback(
    (question: Question | null) => {
      if (!question) {
        return;
      }

      const saved = savedAnswers[question.id];

      if (question.question_type === "text") {
        setTextAnswer(saved ?? "");
        setSingleAnswer("");
        setMultiAnswers([]);
        setOtherSelected(false);
        setOtherText("");
        return;
      }

      if (questionAllowsMultiple(question)) {
        const { selections, otherText: savedOther } = splitMultiSelectAnswer(
          saved ?? "",
        );
        setMultiAnswers(selections);
        setOtherSelected(savedOther.length > 0);
        setOtherText(savedOther);
        setSingleAnswer("");
        setTextAnswer("");
        return;
      }

      setSingleAnswer(saved ?? "");
      setMultiAnswers([]);
      setOtherSelected(false);
      setOtherText("");
      setTextAnswer("");
    },
    [savedAnswers],
  );

  useEffect(() => {
    loadQuestionDraft(currentQuestion);
  }, [currentQuestion, loadQuestionDraft]);

  useEffect(() => {
    async function init() {
      const meta = await loadSessionMeta();
      if (!meta) {
        return;
      }

      const statusResponse = await fetch(`/api/sessions/${code}/access-status`, {
        credentials: "include",
      });
      const status = await statusResponse.json();

      if (status.has_access) {
        setIsUnlocked(true);
        await loadSurvey();
        return;
      }

      if (!meta.requires_password) {
        const accessResponse = await fetch(`/api/sessions/${code}/access`, {
          method: "POST",
          credentials: "include",
        });

        if (accessResponse.ok) {
          setIsUnlocked(true);
          await loadSurvey();
          return;
        }
      }

      setLoading(false);
    }

    void init();
  }, [code, loadSessionMeta, loadSurvey]);

  async function verifyPassword() {
    if (!password.trim()) {
      setError(`Enter the password (${sessionPasswordHint()}).`);
      return;
    }

    setVerifying(true);
    setError("");

    try {
      const response = await fetch(`/api/sessions/${code}/verify-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: normalizeSessionPassword(password) }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Incorrect password");
      }

      setIsUnlocked(true);
      setLoading(true);
      await loadSurvey();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setVerifying(false);
    }
  }

  function getCurrentAnswerValue(question: Question): string {
    if (question.question_type === "text") {
      return textAnswer.trim();
    }

    if (questionAllowsMultiple(question)) {
      return buildMultiSelectAnswer(multiAnswers, otherText);
    }

    return singleAnswer;
  }

  function validateCurrentAnswer(question: Question): boolean {
    if (question.question_type === "text") {
      return textAnswer.trim().length > 0;
    }

    if (questionAllowsMultiple(question)) {
      const hasSelections = multiAnswers.length > 0;
      const hasOther =
        questionAllowsOther(question) &&
        otherSelected &&
        otherText.trim().length > 0;

      if (
        questionAllowsOther(question) &&
        otherSelected &&
        otherText.trim().length === 0
      ) {
        return false;
      }

      return hasSelections || hasOther;
    }

    return singleAnswer.length > 0;
  }

  async function saveCurrentAnswer(question: Question): Promise<boolean> {
    if (!sessionMeta) {
      return false;
    }

    if (!validateCurrentAnswer(question)) {
      setError(
        questionAllowsMultiple(question)
          ? otherSelected && !otherText.trim()
            ? "Please describe your Other answer."
            : "Select at least one option."
          : "Choose or enter an answer first.",
      );
      return false;
    }

    setSubmitting(true);
    setError("");

    const answer = getCurrentAnswerValue(question);

    try {
      const response = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          session_id: sessionMeta.id,
          session_code: sessionMeta.code,
          question_id: question.id,
          participant_id: getParticipantId(),
          answer,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to submit answer");
      }

      setSavedAnswers((current) => ({
        ...current,
        [question.id]: answer,
      }));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function goNext() {
    if (!currentQuestion) {
      return;
    }

    const saved = await saveCurrentAnswer(currentQuestion);
    if (!saved) {
      return;
    }

    if (currentIndex >= questions.length - 1) {
      setIsComplete(true);
      return;
    }

    setCurrentIndex((index) => index + 1);
  }

  function goPrevious() {
    if (currentIndex > 0) {
      setCurrentIndex((index) => index - 1);
      setIsComplete(false);
    }
  }

  function toggleMultiAnswer(option: string) {
    setMultiAnswers((current) =>
      current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option],
    );
  }

  if (loading && !sessionMeta) {
    return (
      <PageShell className="items-center justify-center">
        <p className="text-mezi-muted">Loading session...</p>
      </PageShell>
    );
  }

  if (error && !sessionMeta) {
    return (
      <PageShell className="items-center justify-center">
        <Card className="max-w-md text-center">
          <p className="text-red-400">{error}</p>
        </Card>
      </PageShell>
    );
  }

  if (!isUnlocked && sessionMeta) {
    return (
      <PageShell>
        <header className="mb-8 text-center">
          <Badge>{code}</Badge>
          <h1 className="mt-3 text-2xl font-bold text-mezi-primary">{sessionMeta.title}</h1>
          <p className="mt-2 text-sm text-mezi-muted">
            Enter the password provided by the presenter ({sessionPasswordHint()}).
          </p>
        </header>

        <Card className="mx-auto max-w-md">
          <div className="flex items-center gap-2">
            <span className="rounded-xl border border-mezi-gray bg-mezi-cream-soft px-4 py-3 font-mono font-semibold text-mezi-primary">
              {SESSION_PASSWORD_PREFIX}
            </span>
            <Input
              className="font-mono"
              placeholder={`${SESSION_PASSWORD_DIGITS} digits`}
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                    .replace(/\D/g, "")
                    .slice(0, SESSION_PASSWORD_DIGITS),
                )
              }
              inputMode="numeric"
              maxLength={SESSION_PASSWORD_DIGITS}
            />
          </div>
          <Button
            className="mt-4 w-full"
            onClick={verifyPassword}
            disabled={verifying}
          >
            {verifying ? "Checking..." : "Enter session"}
          </Button>
        </Card>

        {error ? <p className="mt-4 text-center text-red-400">{error}</p> : null}
      </PageShell>
    );
  }

  return (
    <PageShell>
      <header className="mb-8 text-center">
        <Badge>{code}</Badge>
        <h1 className="mt-3 text-2xl font-bold text-mezi-primary">
          {sessionMeta?.title}
        </h1>
        {currentQuestion ? (
          <p className="mt-2 text-sm text-mezi-teal">{currentQuestion.section}</p>
        ) : null}
      </header>

      {loading ? (
        <Card className="mx-auto max-w-lg text-center">
          <p className="text-mezi-muted">Loading survey...</p>
        </Card>
      ) : questions.length === 0 ? (
        <Card className="mx-auto max-w-lg text-center">
          <p className="text-mezi-muted">No questions are available for this session.</p>
        </Card>
      ) : isComplete ? (
        <Card className="mx-auto max-w-lg text-center">
          <h2 className="text-xl font-semibold text-mezi-primary">Thank you</h2>
          <p className="mt-2 text-mezi-muted">
            You have completed all {questions.length} questions in this session.
          </p>
          <Button
            className="mt-6"
            variant="secondary"
            onClick={() => {
              setIsComplete(false);
              setCurrentIndex(questions.length - 1);
            }}
          >
            Review answers
          </Button>
        </Card>
      ) : currentQuestion ? (
        <Card className="mx-auto max-w-lg">
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-sm text-mezi-muted">
              <span>
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span>
                {answeredCount}/{questions.length} saved
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-mezi-border">
              <div
                className="h-full rounded-full bg-mezi-accent transition-all"
                style={{
                  width: `${((currentIndex + 1) / questions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {currentQuestion.section === "Confidential Referral" &&
          currentQuestion.sort_order === 0 ? (
            <p className="mb-4 rounded-xl border border-mezi-warm/30 bg-mezi-warm/20 p-4 text-sm text-mezi-text">
              {CONFIDENTIAL_SECTION_NOTE}
            </p>
          ) : null}

          <h2 className="text-xl font-semibold text-mezi-primary">
            {currentQuestion.prompt}
          </h2>

          {questionAllowsMultiple(currentQuestion) ? (
            <p className="mt-2 text-sm text-mezi-teal">
              Select all that apply
            </p>
          ) : null}

          {currentQuestion.is_confidential ? (
            <p className="mt-2 text-xs text-mezi-muted">
              This response is confidential and will not be shown on the presenter
              screen.
            </p>
          ) : null}

          {currentQuestion.question_type === "multiple_choice" ? (
            <div className="mt-6 space-y-3">
              {currentQuestion.options.map((option) => {
                const isMulti = questionAllowsMultiple(currentQuestion);
                const isSelected = isMulti
                  ? multiAnswers.includes(option)
                  : singleAnswer === option;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() =>
                      isMulti
                        ? toggleMultiAnswer(option)
                        : setSingleAnswer(option)
                    }
                    className={`w-full rounded-xl border px-4 py-4 text-left transition ${
                      isSelected
                        ? "border-mezi-teal bg-mezi-teal/10 text-mezi-primary"
                        : "border-mezi-gray bg-mezi-surface text-mezi-text hover:border-mezi-teal-light"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}

              {questionAllowsOther(currentQuestion) ? (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setOtherSelected((current) => !current)}
                    className={`w-full rounded-xl border px-4 py-4 text-left transition ${
                      otherSelected
                        ? "border-mezi-teal bg-mezi-teal/10 text-mezi-primary"
                        : "border-mezi-gray bg-mezi-surface text-mezi-text hover:border-mezi-teal-light"
                    }`}
                  >
                    {OTHER_OPTION_LABEL}
                  </button>
                  {otherSelected ? (
                    <Input
                      placeholder="Please specify..."
                      value={otherText}
                      onChange={(event) => setOtherText(event.target.value)}
                    />
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : isLongTextQuestion(currentQuestion) ? (
            <div className="mt-6">
              <Textarea
                rows={4}
                placeholder="Share any additional comments or concerns"
                value={textAnswer}
                onChange={(event) => setTextAnswer(event.target.value)}
              />
            </div>
          ) : (
            <div className="mt-6">
              <Input
                placeholder={`Enter your ${currentQuestion.prompt.toLowerCase()}`}
                value={textAnswer}
                onChange={(event) => setTextAnswer(event.target.value)}
              />
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={goPrevious}
              disabled={currentIndex === 0 || submitting}
            >
              Previous
            </Button>
            <Button
              className="flex-1"
              onClick={goNext}
              disabled={submitting}
            >
              {submitting
                ? "Saving..."
                : currentIndex >= questions.length - 1
                  ? "Finish"
                  : "Next"}
            </Button>
          </div>
        </Card>
      ) : null}

      {error ? <p className="mt-4 text-center text-red-400">{error}</p> : null}
    </PageShell>
  );
}
