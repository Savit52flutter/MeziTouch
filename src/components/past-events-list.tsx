"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { useAdminAuth } from "@/components/admin-auth-gate";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { DeleteEventButton } from "@/components/delete-event-button";
import { Button } from "@/components/ui";
import { adminAuthHeaders } from "@/lib/admin-session";

interface PastEvent {
  id: string;
  title: string;
  created_at: string;
  session_count: number;
}

export function PastEventsList() {
  const adminAuth = useAdminAuth();
  const [events, setEvents] = useState<PastEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const [error, setError] = useState("");

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError("");
    setNeedsSignIn(false);

    try {
      const response = await fetch("/api/events", {
        credentials: "include",
        headers: adminAuthHeaders(),
      });
      const data = await response.json();

      if (response.status === 401) {
        setNeedsSignIn(true);
        setEvents([]);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load events");
      }

      setEvents(data.events ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (adminAuth?.authenticated === null) {
      return;
    }

    if (adminAuth?.authenticated === false) {
      setNeedsSignIn(true);
      setEvents([]);
      setLoading(false);
      return;
    }

    if (adminAuth?.authenticated === true) {
      void loadEvents();
      return;
    }

    void loadEvents();
  }, [adminAuth?.authenticated, loadEvents]);

  if (loading) {
    return <p className="text-sm text-mezi-muted">Loading past events...</p>;
  }

  if (needsSignIn) {
    return (
      <p className="text-sm text-mezi-muted">
        Sign in above to view past events.
      </p>
    );
  }

  if (error) {
    return <p className="text-sm text-red-500">{error}</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <AdminLogoutButton redirectHome={false} />
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-mezi-muted">
          No past events yet. Create a session to get started.
        </p>
      ) : null}

      {events.map((event) => (
        <div
          key={event.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-mezi-border bg-mezi-cream-soft p-4"
        >
          <div>
            <p className="font-medium text-mezi-primary">{event.title}</p>
            <p className="mt-1 text-xs text-mezi-muted">
              {new Date(event.created_at).toLocaleString()} · {event.session_count}{" "}
              session packs
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/admin/event/${event.id}`}>
              <Button variant="secondary">Open event</Button>
            </Link>
            <DeleteEventButton
              eventId={event.id}
              eventTitle={event.title}
              onDeleted={() => {
                void loadEvents();
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
