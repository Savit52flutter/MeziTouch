"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button, Card, Input, Label, PageShell } from "@/components/ui";
import { createAuthBrowserClient } from "@/lib/supabase/auth-browser";

type PageStatus = "loading" | "ready" | "error";

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<PageStatus>("loading");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function prepareSession() {
      const queryError = searchParams.get("error");

      if (queryError === "invalid_link") {
        setError("This reset link is invalid or has expired. Request a new one.");
        setStatus("error");
        return;
      }

      if (queryError === "missing_code") {
        setError("This reset link is incomplete. Request a new one.");
        setStatus("error");
        return;
      }

      try {
        const supabase = createAuthBrowserClient();

        const hash = window.location.hash.startsWith("#")
          ? window.location.hash.slice(1)
          : window.location.hash;

        if (hash) {
          const params = new URLSearchParams(hash);
          const accessToken = params.get("access_token");
          const refreshToken = params.get("refresh_token");
          const type = params.get("type");

          if (accessToken && refreshToken && type === "recovery") {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (sessionError) {
              throw sessionError;
            }

            window.history.replaceState(null, "", window.location.pathname);
          }
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setError("This reset link is invalid or has expired. Request a new one.");
          setStatus("error");
          return;
        }

        setStatus("ready");
      } catch {
        setError("Could not verify your reset link. Request a new one.");
        setStatus("error");
      }
    }

    void prepareSession();
  }, [searchParams]);

  async function updatePassword() {
    if (!password || password.length < 8) {
      setError("Enter a new password with at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const supabase = createAuthBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        throw updateError;
      }

      await supabase.auth.signOut();
      router.push("/?reset=success");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <PageShell className="items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <p className="text-mezi-muted">Verifying reset link...</p>
        </Card>
      </PageShell>
    );
  }

  if (status === "error") {
    return (
      <PageShell className="items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <h1 className="text-xl font-semibold text-mezi-primary">Reset link problem</h1>
          <p className="mt-2 text-sm text-red-500">{error}</p>
          <div className="mt-6 flex flex-col gap-3">
            <Link href="/auth/forgot-password">
              <Button className="w-full">Request a new reset link</Button>
            </Link>
            <Link href="/" className="text-sm text-mezi-muted underline">
              Back to sign in
            </Link>
          </div>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell className="items-center justify-center">
      <Card className="w-full max-w-md">
        <h1 className="text-xl font-semibold text-mezi-primary">Choose a new password</h1>
        <p className="mt-2 text-sm text-mezi-muted">
          Enter a new password for your admin account.
        </p>
        <div className="mt-4">
          <Label>New password</Label>
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />
        </div>
        <div className="mt-4">
          <Label>Confirm password</Label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Repeat new password"
            autoComplete="new-password"
          />
        </div>
        <Button className="mt-4 w-full" onClick={updatePassword} disabled={loading}>
          {loading ? "Saving..." : "Update password"}
        </Button>
        {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
      </Card>
    </PageShell>
  );
}
