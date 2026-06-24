"use client";

import { MeziTouchLogo } from "@/components/mezitouch-logo";
import { QrCode } from "@/components/qr-code";
import { getJoinUrl } from "@/lib/join-url";
import { SURVEY_PACK_LABELS } from "@/lib/survey-pack-labels";
import type { EventSessionSummary, SurveyEvent } from "@/lib/types";

interface EventQrPrintSheetProps {
  event: SurveyEvent;
  sessions: EventSessionSummary[];
  origin: string;
  active?: boolean;
}

export function EventQrPrintSheet({
  event,
  sessions,
  origin,
  active = false,
}: EventQrPrintSheetProps) {
  if (!active) {
    return null;
  }

  return (
    <div className="hidden print:block">
      <div className="mx-auto max-w-[210mm] p-6 text-mezi-text">
        <div className="flex justify-center">
          <MeziTouchLogo size="lg" linked={false} />
        </div>
        <h1 className="mt-4 text-center text-2xl font-bold text-mezi-primary">
          {event.title}
        </h1>
        <p className="mt-2 text-center text-sm text-mezi-muted">
          Scan a QR code or use the join link for each session pack.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-8">
          {sessions.map((session) => {
            const joinUrl = getJoinUrl(origin, session.code);
            const label =
              SURVEY_PACK_LABELS[session.survey_pack] ?? session.title;

            return (
              <div
                key={session.id}
                className="flex flex-col items-center rounded-xl border border-mezi-border p-4 text-center"
              >
                <h2 className="text-base font-semibold text-mezi-primary">
                  {label}
                </h2>
                <div className="mt-4">
                  <QrCode value={joinUrl} size={150} />
                </div>
                <p className="mt-4 break-all text-xs font-mono text-mezi-teal">
                  {joinUrl}
                </p>
                <p className="mt-2 text-sm">
                  <span className="text-mezi-muted">Code: </span>
                  <span className="font-mono font-semibold">{session.code}</span>
                </p>
                <p className="mt-1 text-sm">
                  <span className="text-mezi-muted">Password: </span>
                  <span className="font-mono font-semibold">
                    {session.access_password ?? "None required"}
                  </span>
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
