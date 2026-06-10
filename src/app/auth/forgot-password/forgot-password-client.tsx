"use client";

import Link from "next/link";
import { useState } from "react";

import { Button, Card, Input, Label, PageShell } from "@/components/ui";

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function requestReset() {
    if (!email.trim()) {
      setError("Enter your admin email address.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to send reset email");
      }

      setMessage(
        data.message ??
          "If an account exists for that email, a reset link has been sent.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell className="items-center justify-center">
      <Card className="w-full max-w-md">
        <h1 className="text-xl font-semibold text-mezi-primary">Reset admin password</h1>
        <p className="mt-2 text-sm text-mezi-muted">
          Enter your admin email. We will send a link to set a new password.
        </p>
        <div className="mt-4">
          <Label>Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@mezitouch.co.za"
            autoComplete="username"
          />
        </div>
        <Button className="mt-4 w-full" onClick={requestReset} disabled={loading}>
          {loading ? "Sending..." : "Send reset link"}
        </Button>
        {message ? <p className="mt-4 text-sm text-mezi-primary">{message}</p> : null}
        {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
        <p className="mt-6 text-center text-sm text-mezi-muted">
          <Link href="/" className="underline">
            Back to sign in
          </Link>
        </p>
      </Card>
    </PageShell>
  );
}
