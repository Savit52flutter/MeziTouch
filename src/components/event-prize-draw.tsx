"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button, Card } from "@/components/ui";
import { adminAuthHeaders } from "@/lib/admin-session";

type DrawState = "idle" | "loading" | "ready" | "spinning" | "won" | "error";

type EntriesPayload = {
  entries: string[];
  winners: string[];
  source?: "names" | "participants";
};

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function Confetti({ active }: { active: boolean }) {
  const pieces = useMemo(() => {
    const colors = ["#0f766e", "#14b8a6", "#0ea5e9", "#f59e0b", "#ef4444"];
    return Array.from({ length: 80 }).map((_, index) => ({
      id: index,
      left: randomBetween(0, 100),
      delay: randomBetween(0, 0.6),
      duration: randomBetween(1.8, 3.2),
      rotate: randomBetween(0, 360),
      color: colors[index % colors.length],
      size: randomBetween(6, 12),
    }));
  }, []);

  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-[-20px] rounded-sm opacity-90"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size * 0.6}px`,
            backgroundColor: p.color,
            transform: `rotate(${p.rotate}deg)`,
            animation: `mt-confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes mt-confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export function EventPrizeDraw({
  eventId,
  eventTitle,
  onClose,
}: {
  eventId: string;
  eventTitle: string;
  onClose: () => void;
}) {
  const [state, setState] = useState<DrawState>("idle");
  const [entries, setEntries] = useState<string[]>([]);
  const [winners, setWinners] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [confetti, setConfetti] = useState(false);
  const spinTimer = useRef<number | null>(null);

  const currentLabel = entries.length
    ? entries[Math.min(currentIndex, entries.length - 1)]
    : "No entries yet";

  const loadEntries = useCallback(async () => {
    setState("loading");
    setError("");
    setWinner(null);

    try {
      const response = await fetch(`/api/events/${eventId}/draw/entries`, {
        credentials: "include",
        headers: adminAuthHeaders(),
      });
      const data = (await response.json()) as EntriesPayload & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load entries");
      }

      setEntries(data.entries ?? []);
      setWinners(data.winners ?? []);
      setCurrentIndex(0);
      setState("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load entries");
      setState("error");
    }
  }, [eventId]);

  useEffect(() => {
    void loadEntries();
    return () => {
      if (spinTimer.current) {
        window.clearInterval(spinTimer.current);
      }
    };
  }, [loadEntries]);

  async function recordWinner(label: string) {
    const response = await fetch(`/api/events/${eventId}/draw/winner`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...adminAuthHeaders(),
      },
      credentials: "include",
      body: JSON.stringify({ label }),
    });

    const data = (await response.json()) as { ok?: boolean; error?: string };

    if (!response.ok) {
      throw new Error(data.error ?? "Failed to record winner");
    }
  }

  async function spin() {
    if (entries.length === 0 || state === "spinning") {
      return;
    }

    setState("spinning");
    setError("");
    setWinner(null);
    setConfetti(false);

    const totalMs = 3200;
    const start = Date.now();
    const targetIndex = Math.floor(Math.random() * entries.length);

    let step = 0;
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(1, elapsed / totalMs);
      const speed = Math.max(40, 180 - Math.floor(progress * 140)); // slows down

      step += 1;
      setCurrentIndex((i) => (entries.length ? (i + 1) % entries.length : i));

      if (progress >= 1) {
        if (spinTimer.current) window.clearInterval(spinTimer.current);
        spinTimer.current = null;
        setCurrentIndex(targetIndex);

        const chosen = entries[targetIndex]!;
        void (async () => {
          try {
            await recordWinner(chosen);
            setWinner(chosen);
            setWinners((w) => [...w, chosen]);
            setEntries((e) => e.filter((x) => x !== chosen));
            setState("won");
            setConfetti(true);
            window.setTimeout(() => setConfetti(false), 3500);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to record winner");
            setState("error");
          }
        })();

        return;
      }

      // crude dynamic interval: restart timer occasionally
      if (step % 12 === 0) {
        if (spinTimer.current) window.clearInterval(spinTimer.current);
        spinTimer.current = window.setInterval(tick, speed);
      }
    };

    spinTimer.current = window.setInterval(tick, 60);
  }

  return (
    <>
      <Confetti active={confetti} />
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-xl">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-mezi-muted">
                Prize draw
              </p>
              <h2 className="mt-1 text-xl font-semibold text-mezi-primary">
                {eventTitle}
              </h2>
              <p className="mt-1 text-sm text-mezi-muted">
                Spin to choose a winner. A name can only win once.
              </p>
            </div>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>

          <div className="mt-6 rounded-2xl border border-mezi-border bg-mezi-cream-soft p-6 text-center">
            <div className="mx-auto flex max-w-md items-center justify-center gap-3">
              <div className="h-3 w-3 rounded-full bg-mezi-accent" />
              <p className="font-mono text-lg font-semibold text-mezi-primary">
                {currentLabel}
              </p>
              <div className="h-3 w-3 rounded-full bg-mezi-accent" />
            </div>
            {winner ? (
              <p className="mt-3 text-sm text-mezi-teal">
                Winner: <span className="font-semibold">{winner}</span>
              </p>
            ) : null}
          </div>

          {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}

          <div className="mt-6 flex flex-wrap gap-2">
            <Button
              className="flex-1"
              onClick={spin}
              disabled={state === "loading" || state === "spinning" || entries.length === 0}
            >
              {state === "spinning"
                ? "Spinning..."
                : entries.length === 0
                  ? "No entries"
                  : "Spin"}
            </Button>
            <Button variant="secondary" onClick={loadEntries} disabled={state === "spinning"}>
              Refresh list
            </Button>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-mezi-primary">
                Available ({entries.length})
              </p>
              <div className="mt-2 max-h-44 overflow-auto rounded-xl border border-mezi-border bg-white/60 p-3 text-sm">
                {entries.length ? (
                  <ul className="space-y-1">
                    {entries.slice(0, 80).map((e) => (
                      <li key={e} className="font-mono text-mezi-text">
                        {e}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-mezi-muted">
                    No eligible entries yet for this event.
                  </p>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-mezi-primary">
                Winners ({winners.length})
              </p>
              <div className="mt-2 max-h-44 overflow-auto rounded-xl border border-mezi-border bg-white/60 p-3 text-sm">
                {winners.length ? (
                  <ul className="space-y-1">
                    {winners.slice(0, 80).map((w) => (
                      <li key={w} className="font-mono text-mezi-text">
                        {w}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-mezi-muted">No winners yet.</p>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

