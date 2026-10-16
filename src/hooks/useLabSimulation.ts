import { useEffect, useState } from "react";
import { LabSimulation } from "../simulation/engine.ts";
import type { ElementId, LabSnapshot } from "../simulation/types.ts";

export function useLabSimulation(reducedMotion: boolean, selected: ElementId, aimColor: string) {
  const [sim] = useState(() => new LabSimulation());
  const [snapshot, setSnapshot] = useState<LabSnapshot>(() => sim.getSnapshot());

  useEffect(() => {
    sim.configure({ reducedMotion, selected, aimColor });
  }, [aimColor, reducedMotion, selected, sim]);

  useEffect(() => sim.subscribe(() => setSnapshot(sim.getSnapshot())), [sim]);

  return { sim, snapshot };
}
