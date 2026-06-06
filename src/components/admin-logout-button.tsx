"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Button, Card, Input, Label } from "@/components/ui";

export function AdminLogoutButton() {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadStatus = useCallback(async () => {
    const response = await fetch("/api/admin/status", { credentials: "include" });
    const data = await response.json();

    if (data.email) {
      setEmail(data.email);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  function openConfirm() {
    setError("");
    setPassword("");
    setShowConfirm(true);
  }

  function cancelConfirm() {
    setShowConfirm(false);
    setPassword("");
    setError("");
  }

  async function logout() {
    if (!password) {
      setError("Enter your admin password to log out.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to log out");
      }

      setShowConfirm(false);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log out");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <Button variant="secondary" onClick={openConfirm}>
        Log out
      </Button>

      {showConfirm ? (
        <Card className="absolute right-0 top-full z-10 mt-2 w-[280px] p-4 shadow-md">
          <p className="text-sm font-medium text-mezi-primary">Confirm log out</p>
          <p className="mt-1 text-xs text-mezi-muted">
            Enter your admin password to sign out
            {email ? ` (${email})` : ""}.
          </p>
          <div className="mt-3">
            <Label>Admin password</Label>
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>
          <div className="mt-3 flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={cancelConfirm}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={logout} disabled={loading}>
              {loading ? "Signing out..." : "Confirm"}
            </Button>
          </div>
          {error ? <p className="mt-2 text-xs text-red-500">{error}</p> : null}
        </Card>
      ) : null}
    </div>
  );
}
