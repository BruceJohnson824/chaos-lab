import type { LogEntry } from "../simulation/types.ts";

interface ActivityLogProps {
  entries: LogEntry[];
}

export function ActivityLog({ entries }: ActivityLogProps) {
  const latest = entries[0];

  return (
    <section className="panel log-panel" aria-labelledby="log-title">
      <div className="panel-head">
        <h2 id="log-title">Activity</h2>
        <p>Placements, reactions, and lab notes.</p>
      </div>
      <p className="sr-only" aria-live="polite">
        {latest ? latest.message : "Activity log empty."}
      </p>
      {entries.length === 0 ? (
        <p className="empty-copy">Placements and reactions will appear here.</p>
      ) : (
        <ol className="log-list">
          {entries.map((entry) => (
            <li key={entry.id} className={`log-entry tone-${entry.tone}`}>
              <time dateTime={new Date(entry.at).toISOString()}>{formatClock(entry.at)}</time>
              <p>{entry.message}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function formatClock(at: number): string {
  return new Date(at).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}
