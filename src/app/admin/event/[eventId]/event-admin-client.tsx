"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { AdminLogoutButton } from "@/components/admin-logout-button";
import { EventQrPrintSheet } from "@/components/event-qr-print-sheet";
import { EventPrizeDraw } from "@/components/event-prize-draw";
import { QrCode } from "@/components/qr-code";
import { Badge, Button, Card, PageShell } from "@/components/ui";
import { adminAuthHeaders } from "@/lib/admin-session";
import { getJoinUrl } from "@/lib/join-url";
import { SURVEY_PACK_LABELS } from "@/lib/survey-pack-labels";
import { CONFIDENTIAL_SECTION_NOTE } from "@/lib/wellness-survey";
import type { EventSessionSummary, SurveyEvent } from "@/lib/types";

export default function EventAdminClient({ eventId }: { eventId: string }) {
  const [event, setEvent] = useState<SurveyEvent | null>(null);
  const [sessions, setSessions] = useState<EventSessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDraw, setShowDraw] = useState(false);

  const loadData = useCallback(async () => {
    const response = await fetch(`/api/events/${eventId}`, {
      credentials: "include",
      headers: adminAuthHeaders(),
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Failed to load event");
      setLoading(false);
      return;
    }

    setEvent(data.event);
    setSessions(data.sessions);
    setLoading(false);
  }, [eventId]);

  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
    void loadData();
  }, [loadData]);

  if (loading) {
    return (
      <PageShell className="items-center justify-center print-hidden">
        <p className="text-mezi-muted">Loading event dashboard...</p>
      </PageShell>
    );
  }

  if (!event) {
    return (
      <PageShell className="items-center justify-center print-hidden">
        <Card className="max-w-md text-center">
          <p className="text-red-400">{error || "Event not found"}</p>
        </Card>
      </PageShell>
    );
  }

  return (
    <>
      <PageShell className="print-hidden">
        <header className="mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Badge>Event Admin</Badge>
              <h1 className="mt-3 text-3xl font-bold text-mezi-primary">
                {event.title}
              </h1>
              <p className="mt-2 text-mezi-muted">
                Four separate session packs. The first three require an MT +
                6-digit password.
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="secondary" onClick={() => window.print()}>
                  Print QR codes
                </Button>
                <Button variant="secondary" onClick={() => setShowDraw(true)}>
                  Win
                </Button>
              </div>
              <div className="flex items-start gap-2">
                <Link href="/#past-events">
                  <Button variant="secondary">Past events</Button>
                </Link>
                <AdminLogoutButton />
              </div>
            </div>
          </div>
        </header>

        <div className="space-y-6">
          {sessions.map((session) => {
            const joinUrl = getJoinUrl(origin, session.code);

            return (
              <Card key={session.id}>
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center">
                  <div className="space-y-3">
                    <h2 className="text-xl font-semibold text-mezi-primary">
                      {SURVEY_PACK_LABELS[session.survey_pack] ?? session.title}
                    </h2>
                    <div className="grid gap-2 text-sm sm:grid-cols-2">
                      <p>
                        <span className="text-mezi-muted">Join code: </span>
                        <span className="font-mono text-mezi-teal">
                          {session.code}
                        </span>
                      </p>
                      <p>
                        <span className="text-mezi-muted">Password: </span>
                        <span className="font-mono text-mezi-primary">
                          {session.access_password ?? "None required"}
                        </span>
                      </p>
                      <p>
                        <span className="text-mezi-muted">Questions: </span>
                        <span className="text-mezi-primary">
                          {session.question_count}
                        </span>
                      </p>
                      <p className="break-all sm:col-span-2">
                        <span className="text-mezi-muted">Join URL: </span>
                        <span className="font-mono text-mezi-teal">{joinUrl}</span>
                      </p>
                    </div>
                    {session.survey_pack === "confidential_referral" ? (
                      <p className="text-sm text-mezi-muted">
                        {CONFIDENTIAL_SECTION_NOTE}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-col items-center justify-center px-2">
                    <QrCode value={joinUrl} size={140} />
                    <p className="mt-2 text-center text-xs text-mezi-muted">
                      Scan to join
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 lg:min-w-[180px]">
                    <Link href={`/admin/${session.code}`}>
                      <Button className="w-full">Manage questions</Button>
                    </Link>
                    <Link href={`/present/${session.code}`}>
                      <Button variant="secondary" className="w-full">
                        Presenter screen
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {error ? <p className="mt-4 text-red-400">{error}</p> : null}
      </PageShell>

      <EventQrPrintSheet event={event} sessions={sessions} origin={origin} />
      {showDraw ? (
        <EventPrizeDraw
          eventId={eventId}
          eventTitle={event.title}
          onClose={() => setShowDraw(false)}
        />
      ) : null}
    </>
  );
}
