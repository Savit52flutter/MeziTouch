"use client";

import { useState } from "react";

import { Button, Card } from "@/components/ui";
import { adminAuthHeaders } from "@/lib/admin-session";
import {
  confidentialReferralsToCsv,
  type ConfidentialReferral,
} from "@/lib/confidential-referrals";

export function ConfidentialReferralsPanel({ code }: { code: string }) {
  const [referrals, setReferrals] = useState<ConfidentialReferral[] | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function closeReferrals() {
    setUnlocked(false);
    setReferrals(null);
    setError("");
  }

  function downloadCsv() {
    if (!referrals || referrals.length === 0) {
      return;
    }

    const csv = confidentialReferralsToCsv(referrals);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `confidential-referrals-${code}-${date}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function loadReferrals() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/sessions/${code}/confidential-referrals`, {
        method: "POST",
        credentials: "include",
        headers: adminAuthHeaders(),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load referrals");
      }

      setReferrals(data.referrals);
      setUnlocked(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load referrals");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mt-6 border-mezi-teal/30">
      <h2 className="text-xl font-semibold text-mezi-primary">
        Confidential referrals
      </h2>
      <p className="mt-2 text-sm text-mezi-muted">
        Names, phone numbers, and emails are only visible here — not on the
        presenter screen. Admin login required.
      </p>

      {!unlocked ? (
        <Button className="mt-4" onClick={loadReferrals} disabled={loading}>
          {loading ? "Loading..." : "View confidential referrals"}
        </Button>
      ) : (
        <div className="mt-4">
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="text-sm text-mezi-muted">
              {referrals?.length ?? 0} submission
              {(referrals?.length ?? 0) === 1 ? "" : "s"}
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={loadReferrals} disabled={loading}>
                {loading ? "Refreshing..." : "Refresh"}
              </Button>
              <Button variant="secondary" onClick={closeReferrals} disabled={loading}>
                Close
              </Button>
              <Button
                variant="secondary"
                onClick={downloadCsv}
                disabled={loading || !referrals || referrals.length === 0}
              >
                Download CSV
              </Button>
            </div>
          </div>

          {!referrals || referrals.length === 0 ? (
            <p className="text-mezi-muted">No confidential referrals submitted yet.</p>
          ) : (
            <div className="space-y-4">
              {referrals.map((referral, index) => (
                <div
                  key={referral.participant_id}
                  className="rounded-xl border border-mezi-border bg-mezi-cream-soft p-4"
                >
                  <p className="text-sm font-semibold text-mezi-primary">
                    Submission {referrals.length - index}
                  </p>
                  <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-mezi-muted">Wants contact</dt>
                      <dd className="text-mezi-text">{referral.wants_contact || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-mezi-muted">Support type</dt>
                      <dd className="text-mezi-text">{referral.support_type || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-mezi-muted">Contact method</dt>
                      <dd className="text-mezi-text">{referral.contact_method || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-mezi-muted">Name and surname</dt>
                      <dd className="text-mezi-text">{referral.name || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-mezi-muted">Contact number</dt>
                      <dd className="text-mezi-text">{referral.phone || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-mezi-muted">Email address</dt>
                      <dd className="text-mezi-text">{referral.email || "—"}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-mezi-muted">Additional comments</dt>
                      <dd className="text-mezi-text">{referral.comments || "—"}</dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {error ? <p className="mt-4 text-red-500">{error}</p> : null}
    </Card>
  );
}
