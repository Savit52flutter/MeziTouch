"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminAuthGate, AdminAuthProvider } from "@/components/admin-auth-gate";
import { PastEventsList } from "@/components/past-events-list";
import { Badge, Button, Card, Input, PageShell } from "@/components/ui";
import { adminAuthHeaders } from "@/lib/admin-session";

function CreateSessionCard() {
  const router = useRouter();
  const [title, setTitle] = useState("Workplace Wellness Survey");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function createSession() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...adminAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({ title }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to create session");
      }

      router.push(`/admin/event/${data.eventId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h2 className="text-xl font-semibold text-mezi-primary">Start a session</h2>
      <p className="mt-2 text-sm text-mezi-muted">
        Creates 3 password-protected question packs plus a confidential referral
        pack with no password.
      </p>
      <div className="mt-6">
        <label className="mb-2 block text-sm font-medium text-mezi-muted">
          Session title
        </label>
        <Input
          placeholder="Town Hall Q&A"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>
      <Button className="mt-6 w-full" onClick={createSession} disabled={loading}>
        {loading ? "Creating..." : "Create session"}
      </Button>
      {error ? <p className="mt-4 text-red-400">{error}</p> : null}
    </Card>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");

  function joinSession() {
    const code = joinCode.trim().toUpperCase();
    if (!code) {
      setError("Enter a session code");
      return;
    }
    router.push(`/join/${code}`);
  }

  return (
    <AdminAuthProvider>
    <PageShell>
      <header className="mb-10 text-center">
        <Badge>Mezitouch Live</Badge>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-mezi-primary sm:text-5xl">
          Live Questionnaire
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-mezi-muted">
          Attendees complete the full survey at their own pace. Presenter results
          refresh automatically.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <AdminAuthGate>
          <CreateSessionCard />
        </AdminAuthGate>

        <Card>
          <h2 className="text-xl font-semibold text-mezi-primary">Join as audience</h2>
          <p className="mt-2 text-sm text-mezi-muted">
            Enter the session code and MT + 6-digit password given by the presenter.
          </p>
          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-mezi-muted">
              Session code
            </label>
            <Input
              placeholder="ABC123"
              value={joinCode}
              onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
              maxLength={6}
            />
          </div>
          <Button className="mt-6 w-full" onClick={joinSession}>
            Join session
          </Button>
        </Card>
      </div>

      {error ? <p className="mt-6 text-center text-red-400">{error}</p> : null}

      <div id="past-events" className="mt-8 scroll-mt-8">
        <Card>
          <h2 className="text-xl font-semibold text-mezi-primary">Past events</h2>
          <p className="mt-2 text-sm text-mezi-muted">
            Open a previous event to view its session codes, QR codes, and results.
          </p>
          <div className="mt-4">
            <PastEventsList />
          </div>
        </Card>
      </div>

      <footer className="mt-12 text-center text-sm text-mezi-muted">
        <Link href="https://supabase.com/docs/guides/realtime" className="underline">
          Supabase Realtime docs
        </Link>
      </footer>
    </PageShell>
    </AdminAuthProvider>
  );
}
