import type { ReactionDefinition } from "./types.ts";

/** Fire + fire feeds a larger flame until it is already roaring. */
export const inferno: ReactionDefinition = {
  id: "inferno",
  title: "Inferno",
  pair: ["fire", "fire"],
  summary: "Two flames fold into one hotter tongue.",
  lockedHint: "A flame is fed more of itself.",
  accent: "#ff6a2c",
  resolve(a, b, api) {
    const keeper = a.radius >= b.radius ? a : b;
    const donor = keeper === a ? b : a;
    api.burst(keeper.x, keeper.y, "#ffb15a", api.reducedMotion ? 36 : 72);
    if (keeper.radius >= 18) {
      api.nudge(a, b, 90);
      return;
    }
    keeper.radius = Math.min(18, keeper.radius + donor.radius * 0.42);
    keeper.life = Math.max(keeper.life, keeper.maxLife * 0.85);
    keeper.vy -= 30;
    api.remove(donor);
  },
};
