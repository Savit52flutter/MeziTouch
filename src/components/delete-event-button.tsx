"use client";

import { useState } from "react";

import { Button, Card, Input, Label } from "@/components/ui";
import { adminAuthHeaders } from "@/lib/admin-session";

export function DeleteEventButton({
  eventId,
  eventTitle,
  onDeleted,
}: {
  eventId: string;
  eventTitle: string;
  onDeleted: () => void;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  async function deleteEvent() {
    if (!password) {
      setError("Enter your admin password to delete this event.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...adminAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({ password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to delete event");
      }

      setShowConfirm(false);
      setPassword("");
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete event");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <Button
        variant="secondary"
        className="border-red-200 text-red-600 hover:bg-red-50"
        onClick={openConfirm}
      >
        Delete
      </Button>

      {showConfirm ? (
        <Card className="absolute right-0 top-full z-10 mt-2 w-[min(280px,calc(100vw-2rem))] p-4 shadow-md">
          <p className="text-sm font-medium text-mezi-primary">Delete event?</p>
          <p className="mt-1 text-xs text-mezi-muted">
            This permanently removes <span className="font-medium">{eventTitle}</span>,
            all session packs, questions, and responses. Enter your admin password
            to confirm.
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
            <Button
              className="flex-1 border-red-200 bg-red-600 hover:bg-red-700"
              onClick={deleteEvent}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </div>
          {error ? <p className="mt-2 text-xs text-red-500">{error}</p> : null}
        </Card>
      ) : null}
    </div>
  );
}
