import { makeEffect, midpoint } from "./helpers.ts";
import type { ReactionDefinition } from "./types.ts";

/** Ice + electricity explodes the lattice into violet shards. */
export const crystalArc: ReactionDefinition = {
  id: "crystal-arc",
  title: "Crystal Arc",
  pair: ["electricity", "ice"],
  summary: "The lattice shatters along a violet fault line.",
  lockedHint: "Lightning strikes a frozen lattice.",
  accent: "#d2c4ff",
  resolve(a, b, api) {
    const bolt = a.element === "electricity" ? a : b;
    const crystal = bolt === a ? b : a;
    const mid = midpoint(bolt, crystal);
    api.remove(crystal);
    api.damage(bolt, 0.28);
    bolt.phase = 0;
    api.burst(mid.x, mid.y, "#c7b0ff", api.reducedMotion ? 56 : 120);
    const count = api.reducedMotion ? 5 : 12;
    for (let index = 0; index < count; index += 1) {
      const angle = (index / count) * Math.PI * 2;
      const speed = 90 + Math.random() * 140;
      api.spawn(
        makeEffect({
          visual: index % 3 === 0 ? "spark" : "shard",
          x: mid.x,
          y: mid.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 3.5 + Math.random() * 4,
          life: 0.45 + Math.random() * 0.45,
          tint: index % 2 === 0 ? "#efe7ff" : "#f4fdff",
          spin: (Math.random() - 0.5) * 10,
        }),
      );
    }
  },
};
