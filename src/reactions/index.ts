import type { ElementId } from "../simulation/types.ts";
import { arcBridge } from "./arcBridge.ts";
import { crystalArc } from "./crystalArc.ts";
import { frostBloom } from "./frostBloom.ts";
import { glacier } from "./glacier.ts";
import { inferno } from "./inferno.ts";
import { meltShatter } from "./meltShatter.ts";
import { plasmaFlare } from "./plasmaFlare.ts";
import { steamBurst } from "./steamBurst.ts";
import { stormBrew } from "./stormBrew.ts";
import { tidewell } from "./tidewell.ts";
import type { ReactionDefinition } from "./types.ts";

/** Register new reactions here. Pair order does not matter. */
export const reactions: ReactionDefinition[] = [
  steamBurst,
  meltShatter,
  frostBloom,
  stormBrew,
  crystalArc,
  plasmaFlare,
  inferno,
  tidewell,
  glacier,
  arcBridge,
];

export function pairKey(a: ElementId, b: ElementId): string {
  return a < b ? `${a}+${b}` : `${b}+${a}`;
}

const byPair = new Map<string, ReactionDefinition>();
for (const reaction of reactions) {
  const key = pairKey(reaction.pair[0], reaction.pair[1]);
  if (byPair.has(key)) {
    throw new Error(`Duplicate reaction registered for ${key}`);
  }
  byPair.set(key, reaction);
}

export function findReaction(a: ElementId, b: ElementId): ReactionDefinition | undefined {
  return byPair.get(pairKey(a, b));
}
