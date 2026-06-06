import type { ResponseAggregate } from "@/lib/types";

export function ResultBars({
  results,
  totalResponses,
}: {
  results: ResponseAggregate[];
  totalResponses: number;
}) {
  if (results.length === 0) {
    return (
      <p className="text-center text-mezi-muted">
        Waiting for the first response...
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-mezi-muted">{totalResponses} responses</p>
      {results.map((result) => (
        <div key={result.answer} className="space-y-2">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="font-medium text-mezi-text">{result.answer}</span>
            <span className="text-mezi-muted">
              {result.count} ({result.percentage}%)
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-mezi-border">
            <div
              className="h-full rounded-full bg-gradient-to-r from-mezi-teal-light to-mezi-primary transition-all duration-500"
              style={{ width: `${result.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
