"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { ConfidentialReferralsPanel } from "@/components/confidential-referrals";
import { Badge, Button, Card, Input, Label, PageShell, Textarea } from "@/components/ui";
import {
  questionAllowsMultiple,
  questionAllowsOther,
} from "@/lib/question-rules";
import { CONFIDENTIAL_SECTION_NOTE } from "@/lib/wellness-survey";
import type { Question, Session } from "@/lib/types";

export default function AdminClient({ code }: { code: string }) {
  const [session, setSession] = useState<Session | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [prompt, setPrompt] = useState("");
  const [optionsText, setOptionsText] = useState("Yes\nNo\nMaybe");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [showReloadPrompt, setShowReloadPrompt] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    const response = await fetch(`/api/admin/sessions/${code}`, {
      credentials: "include",
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Session not found");
      setLoading(false);
      return;
    }

    setSession(data.session);
    setQuestions(data.questions ?? []);
    setLoading(false);
  }, [code]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function addQuestion() {
    if (!session || !prompt.trim()) {
      return;
    }

    const options = optionsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (options.length < 2) {
      setError("Add at least two answer options.");
      return;
    }

    setSaving(true);
    setError("");

    const response = await fetch(`/api/admin/sessions/${code}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        prompt: prompt.trim(),
        options,
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Failed to add question");
      setSaving(false);
      return;
    }

    setPrompt("");
    await loadData();
    setSaving(false);
  }

  async function loadWellnessSurvey() {
    setSeeding(true);
    setError("");

    try {
      const response = await fetch(`/api/sessions/${code}/seed-survey`, {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load survey");
      }

      setShowReloadPrompt(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load survey");
    } finally {
      setSeeding(false);
    }
  }

  if (loading) {
    return (
      <PageShell className="items-center justify-center">
        <p className="text-mezi-muted">Loading admin panel...</p>
      </PageShell>
    );
  }

  if (!session) {
    return (
      <PageShell className="items-center justify-center">
        <Card className="max-w-md text-center">
          <p className="text-red-400">{error || "Session not found"}</p>
        </Card>
      </PageShell>
    );
  }

  const joinUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/join/${code}`
      : `/join/${code}`;

  return (
    <PageShell>
      <header className="mb-8">
        <Badge>Admin</Badge>
        <h1 className="mt-3 text-3xl font-bold text-mezi-primary">{session.title}</h1>
        <p className="mt-2 text-mezi-muted">
          Session code: <span className="font-mono text-mezi-teal">{code}</span>
        </p>
        {session.event_id ? (
          <Link
            href={`/admin/event/${session.event_id}`}
            className="mt-2 inline-block text-sm text-mezi-teal underline"
          >
            Back to all session packs
          </Link>
        ) : null}
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-xl font-semibold text-mezi-primary">Share links</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div>
              <p className="text-mezi-muted">Audience join URL</p>
              <p className="break-all font-mono text-mezi-teal">{joinUrl}</p>
            </div>
            <div>
              <p className="text-mezi-muted">Presenter screen</p>
              <Link href={`/present/${code}`} className="text-mezi-teal underline">
                /present/{code}
              </Link>
            </div>
          </div>
          {session.access_password ? (
            <p className="mt-4 text-sm text-mezi-muted">
              Audience password:{" "}
              <span className="font-mono text-mezi-primary">
                {session.access_password}
              </span>
            </p>
          ) : (
            <p className="mt-4 text-sm text-mezi-muted">
              No password required for this pack.
            </p>
          )}
          <Button
            className="mt-4 w-full"
            variant="secondary"
            onClick={() => {
              setError("");
              setShowReloadPrompt(true);
            }}
            disabled={seeding}
          >
            Reload pack questions
          </Button>
        </Card>

        {showReloadPrompt ? (
          <Card className="border-mezi-warm/40 lg:col-span-2">
            <h2 className="text-xl font-semibold text-mezi-primary">Confirm reload</h2>
            <p className="mt-2 text-sm text-mezi-muted">
              This will erase all responses and reload the survey questions for
              this pack.
            </p>
            <div className="mt-4 flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowReloadPrompt(false);
                  setError("");
                }}
                disabled={seeding}
              >
                Cancel
              </Button>
              <Button onClick={loadWellnessSurvey} disabled={seeding}>
                {seeding ? "Reloading..." : "Confirm reload"}
              </Button>
            </div>
          </Card>
        ) : null}

        <Card>
          <h2 className="text-xl font-semibold text-mezi-primary">Add custom question</h2>
          <div className="mt-4">
            <Label>Question</Label>
            <Input
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="How satisfied are you with today's session?"
            />
          </div>
          <div className="mt-4">
            <Label>Options (one per line)</Label>
            <Textarea
              rows={4}
              value={optionsText}
              onChange={(event) => setOptionsText(event.target.value)}
            />
          </div>
          <Button className="mt-4" onClick={addQuestion} disabled={saving}>
            {saving ? "Saving..." : "Add question"}
          </Button>
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="mb-4 text-xl font-semibold text-mezi-primary">
          Questions ({questions.length})
        </h2>

        {questions.length === 0 ? (
          <p className="text-mezi-muted">
            No questions yet. Create a new event to load all survey packs.
          </p>
        ) : (
          <div className="space-y-4">
            {session.survey_pack === "confidential_referral" ? (
              <p className="text-sm text-mezi-muted">{CONFIDENTIAL_SECTION_NOTE}</p>
            ) : null}
            {questions.map((question) => (
              <div
                key={question.id}
                className="rounded-xl border border-mezi-border bg-mezi-surface p-4"
              >
                <p className="text-xs text-mezi-muted">
                  Q{question.sort_order + 1}
                  {question.is_confidential ? " · Confidential" : ""}
                  {question.question_type === "text" ? " · Text" : ""}
                </p>
                <p className="mt-1 font-medium text-mezi-primary">
                  {question.prompt}
                </p>
                {question.question_type === "multiple_choice" ? (
                  <p className="mt-2 text-sm text-mezi-muted">
                    {[
                      questionAllowsMultiple(question)
                        ? "Multiple answers allowed"
                        : null,
                      questionAllowsOther(question) ? "Other option" : null,
                      question.options.join(" · "),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Card>

      {session.survey_pack === "confidential_referral" ? (
        <ConfidentialReferralsPanel code={code} />
      ) : null}

      {error ? <p className="mt-4 text-red-400">{error}</p> : null}
    </PageShell>
  );
}
