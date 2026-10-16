import type { ReactionDefinition } from "./types.ts";

/** Ice + ice locks into a slower, larger crystal. */
export const glacier: ReactionDefinition = {
  id: "glacier",
  title: "Glacier",
  pair: ["ice", "ice"],
  summary: "Crystals lock together and drift as one mass.",
  lockedHint: "Ice prefers company.",
  accent: "#e7f8ff",
  resolve(a, b, api) {
    const keeper = a.radius >= b.radius ? a : b;
    const donor = keeper === a ? b : a;
    api.burst(keeper.x, keeper.y, "#f4fdff", api.reducedMotion ? 30 : 60);
    if (keeper.radius >= 22) {
      api.nudge(a, b, 40);
      a.vx *= 0.6;
      b.vx *= 0.6;
      return;
    }
    keeper.radius = Math.min(22, keeper.radius + donor.radius * 0.34);
    keeper.vx = (keeper.vx + donor.vx) * 0.35;
    keeper.vy = (keeper.vy + donor.vy) * 0.35;
    keeper.life = Math.max(keeper.life, donor.life);
    api.remove(donor);
  },
};
