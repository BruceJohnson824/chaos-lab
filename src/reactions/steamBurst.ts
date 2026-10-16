import { makeEffect, midpoint } from "./helpers.ts";
import type { ReactionDefinition } from "./types.ts";

/** Fire + water lifts a pale column and spends the flame. */
export const steamBurst: ReactionDefinition = {
  id: "steam-burst",
  title: "Steam Burst",
  pair: ["fire", "water"],
  summary: "The flame collapses into a rising veil of vapor.",
  lockedHint: "Heat and a flowing element share the bench.",
  accent: "#d7f6ff",
  resolve(a, b, api) {
    const flame = a.element === "fire" ? a : b;
    const drop = flame === a ? b : a;
    const mid = midpoint(flame, drop);
    api.damage(flame, 0.42);
    api.damage(drop, 0.24);
    flame.vy -= 90;
    drop.vy -= 50;
    api.nudge(flame, drop, 50);
    api.burst(mid.x, mid.y, "#e9fbff", api.reducedMotion ? 48 : 92);
    const count = api.reducedMotion ? 5 : 14;
    for (let index = 0; index < count; index += 1) {
      api.spawn(
        makeEffect({
          visual: "steam",
          x: mid.x + (Math.random() - 0.5) * 18,
          y: mid.y + (Math.random() - 0.5) * 10,
          vx: (Math.random() - 0.5) * 28,
          vy: -50 - Math.random() * 70,
          radius: 8 + Math.random() * 14,
          life: 0.8 + Math.random() * 0.9,
          tint: "#f4fdff",
        }),
      );
    }
  },
};
