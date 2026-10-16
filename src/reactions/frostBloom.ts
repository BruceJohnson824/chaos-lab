import { elementDraft } from "../elements/draft.ts";
import { makeEffect, midpoint } from "./helpers.ts";
import type { ReactionDefinition } from "./types.ts";

/** Water + ice blooms into frost and can freeze a droplet solid. */
export const frostBloom: ReactionDefinition = {
  id: "frost-bloom",
  title: "Frost Bloom",
  pair: ["ice", "water"],
  summary: "Frost races across the droplet and leaves new crystals behind.",
  lockedHint: "Still water meets a colder cousin.",
  accent: "#bfefff",
  resolve(a, b, api) {
    const crystal = a.element === "ice" ? a : b;
    const drop = crystal === a ? b : a;
    const mid = midpoint(crystal, drop);
    api.damage(drop, 0.34);
    crystal.radius = Math.min(20, crystal.radius + 1.2);
    crystal.life = Math.min(crystal.maxLife, crystal.life + 1.5);
    api.nudge(crystal, drop, 24);
    api.burst(mid.x, mid.y, "#e7f8ff", api.reducedMotion ? 40 : 78);
    const count = api.reducedMotion ? 4 : 9;
    for (let index = 0; index < count; index += 1) {
      const angle = (index / count) * Math.PI * 2;
      api.spawn(
        makeEffect({
          visual: "frost",
          x: mid.x + Math.cos(angle) * 8,
          y: mid.y + Math.sin(angle) * 8,
          vx: Math.cos(angle) * 36,
          vy: Math.sin(angle) * 36,
          radius: 5 + Math.random() * 4,
          life: 0.6 + Math.random() * 0.5,
          tint: "#f5fdff",
        }),
      );
    }
    if (drop.radius < 7 || drop.life < drop.maxLife * 0.45) {
      api.remove(drop);
      api.spawn(
        elementDraft("ice", {
          x: drop.x,
          y: drop.y,
          vx: drop.vx * 0.2,
          vy: drop.vy * 0.2,
          radius: Math.max(7, drop.radius),
          life: 16,
          spin: 0.4,
        }),
      );
    }
  },
};
