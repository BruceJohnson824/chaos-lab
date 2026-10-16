import { makeEffect, midpoint } from "./helpers.ts";
import type { ReactionDefinition } from "./types.ts";

/** Fire + electricity blooms into a white-hot plasma ring. */
export const plasmaFlare: ReactionDefinition = {
  id: "plasma-flare",
  title: "Plasma Flare",
  pair: ["electricity", "fire"],
  summary: "Charge and flame collapse into a white-hot ring.",
  lockedHint: "Fire is given a charge.",
  accent: "#ffd2a8",
  resolve(a, b, api) {
    const mid = midpoint(a, b);
    api.damage(a, 0.62);
    api.damage(b, 0.62);
    api.nudge(a, b, 120);
    api.burst(mid.x, mid.y, "#fff4e4", api.reducedMotion ? 70 : 150);
    const count = api.reducedMotion ? 6 : 16;
    for (let index = 0; index < count; index += 1) {
      const angle = (index / count) * Math.PI * 2;
      const speed = 40 + Math.random() * 90;
      api.spawn(
        makeEffect({
          visual: index % 2 === 0 ? "plasma" : "spark",
          x: mid.x,
          y: mid.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: index % 2 === 0 ? 10 + Math.random() * 8 : 5,
          life: 0.35 + Math.random() * 0.4,
          tint: index % 3 === 0 ? "#ffb15a" : "#f3e9ff",
        }),
      );
    }
  },
};
