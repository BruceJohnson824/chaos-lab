import type { ReactionDefinition } from "./types.ts";

/** Water + water draws droplets into a heavier bead. */
export const tidewell: ReactionDefinition = {
  id: "tidewell",
  title: "Tidewell",
  pair: ["water", "water"],
  summary: "Droplets pull together into a heavier bead.",
  lockedHint: "Two bodies of water occupy one place.",
  accent: "#3ec5ff",
  resolve(a, b, api) {
    const keeper = a.radius >= b.radius ? a : b;
    const donor = keeper === a ? b : a;
    api.burst(keeper.x, keeper.y, "#8fd8ff", api.reducedMotion ? 28 : 54);
    if (keeper.radius >= 22) {
      api.nudge(a, b, 60);
      return;
    }
    keeper.radius = Math.min(22, keeper.radius + donor.radius * 0.38);
    keeper.life = Math.max(keeper.life, donor.life);
    api.remove(donor);
  },
};
