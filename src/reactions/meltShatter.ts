import { elementDraft } from "../elements/draft.ts";
import { makeEffect, midpoint } from "./helpers.ts";
import type { ReactionDefinition } from "./types.ts";

/** Fire + ice cracks the crystal into meltwater and bright shards. */
export const meltShatter: ReactionDefinition = {
  id: "melt-shatter",
  title: "Melt Shatter",
  pair: ["fire", "ice"],
  summary: "The crystal splits, sheds meltwater, and throws orange glass.",
  lockedHint: "A flame finds something brittle and cold.",
  accent: "#ffb088",
  resolve(a, b, api) {
    const flame = a.element === "fire" ? a : b;
    const crystal = flame === a ? b : a;
    const mid = midpoint(flame, crystal);
    api.remove(crystal);
    api.damage(flame, 0.16);
    flame.radius = Math.min(18, flame.radius * 1.12);
    flame.vy -= 40;
    api.burst(mid.x, mid.y, "#ff8a3d", api.reducedMotion ? 46 : 100);
    const shards = api.reducedMotion ? 4 : 10;
    for (let index = 0; index < shards; index += 1) {
      const angle = (index / shards) * Math.PI * 2;
      const speed = 70 + Math.random() * 110;
      api.spawn(
        makeEffect({
          visual: "shard",
          x: mid.x,
          y: mid.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 20,
          radius: 4 + Math.random() * 4,
          life: 0.7 + Math.random() * 0.5,
          tint: index % 2 === 0 ? "#ffe1c4" : "#d9f6ff",
          spin: (Math.random() - 0.5) * 8,
        }),
      );
    }
    const drops = api.reducedMotion ? 1 : 3;
    for (let index = 0; index < drops; index += 1) {
      api.spawn(
        elementDraft("water", {
          x: mid.x + (Math.random() - 0.5) * 12,
          y: mid.y,
          vx: (Math.random() - 0.5) * 40,
          vy: 20 + Math.random() * 30,
          radius: 5 + Math.random() * 2.5,
          life: 12,
        }),
      );
    }
  },
};
