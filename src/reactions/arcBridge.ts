import { makeEffect, pointsBetween } from "./helpers.ts";
import type { ReactionDefinition } from "./types.ts";

/** Electricity + electricity bridges the gap with a jumping arc. */
export const arcBridge: ReactionDefinition = {
  id: "arc-bridge",
  title: "Arc Bridge",
  pair: ["electricity", "electricity"],
  summary: "Two bolts clasp for a moment and kick apart.",
  lockedHint: "A bolt reaches another bolt.",
  accent: "#c9a6ff",
  resolve(a, b, api) {
    api.nudge(a, b, 160);
    a.phase = 0;
    b.phase = 0;
    api.burst((a.x + b.x) / 2, (a.y + b.y) / 2, "#d8c8ff", api.reducedMotion ? 40 : 84);
    const marks = pointsBetween(a, b, api.reducedMotion ? 2 : 5);
    for (const mark of marks) {
      api.spawn(
        makeEffect({
          visual: "spark",
          x: mark.x,
          y: mark.y,
          vx: (Math.random() - 0.5) * 20,
          vy: (Math.random() - 0.5) * 20,
          radius: 6,
          life: 0.22,
          tint: "#f4edff",
        }),
      );
    }
  },
};
