"use client";

import { useState } from "react";

import { Button } from "@/components/ui";
import { adminAuthHeaders } from "@/lib/admin-session";
import type { EventSessionSummary, Question } from "@/lib/types";

export type SessionFormPrintPayload = {
  session: EventSessionSummary;
  questions: Question[];
};

export function SessionFormButton({
  session,
  onPrint,
}: {
  session: EventSessionSummary;
  onPrint: (payload: SessionFormPrintPayload) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/sessions/${session.code}`, {
        credentials: "include",
        headers: adminAuthHeaders(),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load questions");
      }

      onPrint({
        session,
        questions: data.questions ?? [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load form");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <Button
        variant="secondary"
        className="w-full min-w-[120px]"
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? "Loading..." : "Forms"}
      </Button>
      {error ? <p className="mt-1 max-w-[140px] text-center text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
