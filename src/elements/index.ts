import { electricity } from "./electricity.ts";
import { fire } from "./fire.ts";
import { ice } from "./ice.ts";
import type { ElementDefinition } from "./types.ts";
import { water } from "./water.ts";
import type { ElementId } from "../simulation/types.ts";

/** Register new elements here, in palette order. */
export const elements: ElementDefinition[] = [fire, water, ice, electricity];

const byId = new Map(elements.map((element) => [element.id, element]));

export function getElement(id: ElementId): ElementDefinition {
  const element = byId.get(id);
  if (!element) throw new Error(`Unknown element: ${id}`);
  return element;
}
