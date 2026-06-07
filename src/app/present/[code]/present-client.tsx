"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { ResultBars } from "@/components/result-bars";
import { Badge, Card, PageShell } from "@/components/ui";
import { adminAuthHeaders } from "@/lib/admin-session";
import { questionAllowsMultiple } from "@/lib/question-rules";
import type { PresenterQuestionResults } from "@/lib/presenter-data";
import type { Session } from "@/lib/types";

export default function PresentClient({ code }: { code: string }) {
  const [session, setSession] = useState<Session | null>(null);
  const [results, setResults] = useState<PresenterQuestionResults[]>([]);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [error, setError] = useState("");

  const refreshData = useCallback(async () => {
    const response = await fetch(`/api/sessions/${code}/present-data`, {
      credentials: "include",
      headers: adminAuthHeaders(),
    });
    const data = await response.json();

    if (!response.ok) {
      setError(
        response.status === 401
          ? "Admin sign-in required to view presenter results."
          : (data.error ?? "Failed to load presenter data"),
      );
      setConnectionStatus("error");
      return;
    }

    setSession(data.session);
    setResults(data.results);
    setConnectionStatus("live");
    setError("");
  }, [code]);

  useEffect(() => {
    void refreshData();
    const interval = window.setInterval(() => {
      void refreshData();
    }, 3000);

    return () => window.clearInterval(interval);
  }, [refreshData]);

  if (error) {
    return (
      <PageShell className="items-center justify-center">
        <Card className="max-w-lg text-center">
          <p className="text-red-400">{error}</p>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Badge>{code}</Badge>
          <h1 className="mt-3 text-3xl font-bold text-mezi-primary sm:text-4xl">
            {session?.title ?? "Presenter View"}
          </h1>
          <p className="mt-2 text-sm text-mezi-muted">
            Results refresh every few seconds as attendees complete the survey.
          </p>
        </div>
        <div className="text-right text-sm">
          <p
            className={
              connectionStatus === "live" ? "text-mezi-accent" : "text-mezi-warm"
            }
          >
            Status: {connectionStatus}
          </p>
          <Link href={`/admin/${code}`} className="text-mezi-teal underline">
            Admin panel
          </Link>
        </div>
      </header>

      {results.length === 0 ? (
        <Card className="text-center">
          <p className="text-mezi-muted">No questions in this session yet.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {results.map(({ question, responses: questionResponses, results: aggregates }) => {
            if (question.is_confidential && question.question_type === "text") {
              return (
                <Card key={question.id}>
                  <p className="text-xs text-mezi-muted">
                    Q{question.sort_order + 1}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-mezi-primary">
                    {question.prompt}
                  </h2>
                  <p className="mt-4 text-mezi-muted">
                    Confidential responses collected privately.
                  </p>
                  <p className="mt-2 text-2xl font-bold text-mezi-accent">
                    {questionResponses.length} submitted
                  </p>
                </Card>
              );
            }

            return (
              <Card key={question.id}>
                <p className="text-sm text-mezi-teal">{question.section}</p>
                <p className="text-xs text-mezi-muted">
                  Q{question.sort_order + 1}
                  {questionAllowsMultiple(question)
                    ? " · Multiple answers allowed"
                    : ""}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-mezi-primary sm:text-2xl">
                  {question.prompt}
                </h2>
                {question.is_confidential ? (
                  <p className="mt-2 text-sm text-mezi-primary">
                    Aggregate counts only — details remain confidential.
                  </p>
                ) : null}
                <div className="mt-6">
                  <ResultBars
                    results={aggregates}
                    totalResponses={questionResponses.length}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
