import { elements } from "../elements/index.ts";
import { reactions } from "../reactions/index.ts";

interface DiscoveryTrackerProps {
  discovered: string[];
}

export function DiscoveryTracker({ discovered }: DiscoveryTrackerProps) {
  const known = new Set(reactions.map((reaction) => reaction.id));
  const found = new Set(discovered.filter((id) => known.has(id)));
  const names = new Map(elements.map((element) => [element.id, element.name]));
  const ratio = reactions.length === 0 ? 0 : found.size / reactions.length;

  return (
    <section className="panel tracker" aria-labelledby="discovery-title">
      <div className="panel-head">
        <h2 id="discovery-title">Discoveries</h2>
        <p>
          {found.size} of {reactions.length}
          {found.size === reactions.length ? " · catalog complete" : ""}
        </p>
      </div>
      <div className="progress" aria-hidden="true">
        <span style={{ width: `${ratio * 100}%` }} />
      </div>
      <ol className="discovery-list">
        {reactions.map((reaction) => {
          const unlocked = found.has(reaction.id);
          const pair = `${names.get(reaction.pair[0]) ?? reaction.pair[0]} + ${names.get(reaction.pair[1]) ?? reaction.pair[1]}`;
          return (
            <li key={reaction.id} className={unlocked ? "discovery is-found" : "discovery is-locked"}>
              <span className="discovery-mark" style={{ background: unlocked ? reaction.accent : undefined }} />
              <div>
                <p className="discovery-title">{unlocked ? reaction.title : "Undiscovered reaction"}</p>
                <p className="discovery-copy">{unlocked ? reaction.summary : reaction.lockedHint}</p>
                {unlocked ? <p className="discovery-pair">{pair}</p> : null}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
