import { makeEffect, midpoint, pointsBetween } from "./helpers.ts";
import type { ReactionDefinition } from "./types.ts";

/** Water + electricity throws arcs, bubbles, and a bright cyan flash. */
export const stormBrew: ReactionDefinition = {
  id: "storm-brew",
  title: "Storm Brew",
  pair: ["electricity", "water"],
  summary: "Current tears through the water in bubbles and white arcs.",
  lockedHint: "A current runs through something that conducts.",
  accent: "#8ee7ff",
  resolve(a, b, api) {
    const bolt = a.element === "electricity" ? a : b;
    const drop = bolt === a ? b : a;
    const mid = midpoint(bolt, drop);
    api.damage(bolt, 0.18);
    api.damage(drop, 0.06);
    drop.vy -= 80;
    drop.vx += (Math.random() - 0.5) * 80;
    bolt.phase = 0;
    api.nudge(bolt, drop, 70);
    api.burst(mid.x, mid.y, "#b8f3ff", api.reducedMotion ? 50 : 110);
    const marks = pointsBetween(bolt, drop, api.reducedMotion ? 2 : 4);
    for (const mark of marks) {
      api.spawn(
        makeEffect({
          visual: "spark",
          x: mark.x,
          y: mark.y,
          vx: (Math.random() - 0.5) * 40,
          vy: (Math.random() - 0.5) * 40,
          radius: 7,
          life: 0.28,
          tint: "#e8fbff",
        }),
      );
    }
    const bubbles = api.reducedMotion ? 3 : 7;
    for (let index = 0; index < bubbles; index += 1) {
      api.spawn(
        makeEffect({
          visual: "bubble",
          x: drop.x + (Math.random() - 0.5) * drop.radius,
          y: drop.y,
          vx: (Math.random() - 0.5) * 20,
          vy: -30 - Math.random() * 50,
          radius: 3 + Math.random() * 4,
          life: 0.8 + Math.random() * 0.6,
          tint: "#d9f6ff",
        }),
      );
    }
  },
};
