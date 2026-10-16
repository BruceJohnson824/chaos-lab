import { reactions } from "../reactions/index.ts";
import type { ElementId } from "../simulation/types.ts";

export type EffectId = "steam" | "spark" | "shard" | "bubble" | "frost" | "plasma";

export interface ExperimentPlacement {
  element: ElementId;
  x: number;
  y: number;
  mode: "stamp" | "brush";
}

/** A checked experiment. Placements are the only thing applied to the canvas. */
export interface ExperimentPlan {
  title: string;
  summary: string;
  reactionIds: string[];
  effectIds: EffectId[];
  placements: ExperimentPlacement[];
}

export const EFFECT_IDS: EffectId[] = ["steam", "spark", "shard", "bubble", "frost", "plasma"];

const EFFECT_SET = new Set<string>(EFFECT_IDS);

const reactionEffects: Record<string, EffectId[]> = {
  "steam-burst": ["steam"],
  "melt-shatter": ["shard", "steam"],
  "frost-bloom": ["frost"],
  "storm-brew": ["spark", "bubble"],
  "crystal-arc": ["shard", "spark"],
  "plasma-flare": ["plasma", "spark"],
  inferno: ["spark"],
  tidewell: ["bubble"],
  glacier: ["frost"],
  "arc-bridge": ["spark"],
};

const reactionById = new Map(reactions.map((reaction) => [reaction.id, reaction.pair] as const));

export const reactionCatalog = reactions.map((reaction) => ({
  id: reaction.id,
  title: reaction.title,
  pair: reaction.pair,
  effects: reactionEffects[reaction.id] ?? [],
}));

export const SAMPLE_PROMPTS = [
  "Boil a still pool with a single flame",
  "Trap a storm inside a frozen lantern",
  "Let two flames fold into one",
];

const ANCHORS: Array<[number, number]> = [
  [0.47, 0.48],
  [0.55, 0.52],
  [0.45, 0.56],
  [0.58, 0.44],
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function clip(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

function uniqueStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  for (const item of value) {
    if (typeof item !== "string") continue;
    const id = item.trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
  }
  return [...seen];
}

/**
 * Accepts only known elements, reactions, and effects.
 * Extra fields, including anything that looks like code, are ignored.
 */
export function validatePlan(input: unknown): ExperimentPlan | null {
  if (!isRecord(input)) return null;

  const title = clip(input.title, 80) || "Untitled experiment";
  const summary =
    clip(input.summary, 240) || "A bench experiment using the elements already in the lab.";
  const reactionIds = uniqueStrings(input.reactionIds)
    .filter((id) => reactionById.has(id))
    .slice(0, 4);
  const effectIds = uniqueStrings(input.effectIds)
    .filter((id): id is EffectId => EFFECT_SET.has(id))
    .slice(0, 6);

  const placements: ExperimentPlacement[] = [];
  if (Array.isArray(input.placements)) {
    for (const item of input.placements) {
      if (placements.length >= 8 || !isRecord(item)) continue;
      if (typeof item.element !== "string" || !reactionElements().has(item.element)) continue;
      if (typeof item.x !== "number" || typeof item.y !== "number") continue;
      if (!Number.isFinite(item.x) || !Number.isFinite(item.y)) continue;
      if (item.x < 0 || item.x > 1 || item.y < 0 || item.y > 1) continue;
      const mode = item.mode === "brush" ? "brush" : item.mode === "stamp" || item.mode === undefined ? "stamp" : null;
      if (!mode) continue;
      placements.push({
        element: item.element as ElementId,
        x: Math.min(0.92, Math.max(0.08, item.x)),
        y: Math.min(0.92, Math.max(0.08, item.y)),
        mode,
      });
    }
  }

  const present = new Set(placements.map((placement) => placement.element));
  let spot = 0;
  for (const id of reactionIds) {
    const pair = reactionById.get(id);
    if (!pair) continue;
    for (const element of pair) {
      if (present.has(element) || placements.length >= 8) continue;
      const anchor = ANCHORS[spot % ANCHORS.length] ?? [0.5, 0.5];
      spot += 1;
      placements.push({ element, x: anchor[0], y: anchor[1], mode: "stamp" });
      present.add(element);
    }
  }

  if (placements.length === 0) return null;
  return { title, summary, reactionIds, effectIds, placements };
}

function reactionElements(): Set<string> {
  return new Set<ElementId>(["fire", "water", "ice", "electricity"]);
}

export function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = (fenced?.[1] ?? text).trim();
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start < 0 || end <= start) {
    throw new Error("The model reply did not contain a JSON object.");
  }
  return JSON.parse(body.slice(start, end + 1)) as unknown;
}

function plan(input: unknown): ExperimentPlan {
  const validated = validatePlan(input);
  if (!validated) throw new Error("Preset experiment is invalid.");
  return validated;
}

const steamPlan = plan({
  title: "Boiling pool",
  summary: "A flame sits in the water until the bench lifts a veil of steam.",
  reactionIds: ["steam-burst"],
  effectIds: ["steam"],
  placements: [
    { element: "water", x: 0.5, y: 0.56, mode: "stamp" },
    { element: "fire", x: 0.5, y: 0.5, mode: "stamp" },
  ],
});

const stormPlan = plan({
  title: "Frozen lantern",
  summary: "Electricity strikes a cage of ice and the crystal splits along a violet fault.",
  reactionIds: ["crystal-arc"],
  effectIds: ["shard", "spark"],
  placements: [
    { element: "ice", x: 0.5, y: 0.48, mode: "stamp" },
    { element: "electricity", x: 0.54, y: 0.5, mode: "stamp" },
  ],
});

const infernoPlan = plan({
  title: "Folded flame",
  summary: "Two flames are set on the same spot so they fold into one hotter tongue.",
  reactionIds: ["inferno"],
  effectIds: ["spark"],
  placements: [
    { element: "fire", x: 0.48, y: 0.5, mode: "stamp" },
    { element: "fire", x: 0.52, y: 0.5, mode: "stamp" },
  ],
});

export function presetFor(prompt: string): ExperimentPlan {
  const text = prompt.toLowerCase();
  const frozenStorm = /storm|electric|lightning|bolt|thunder/.test(text) && /ice|frozen|crystal|lantern|frost/.test(text);
  if (frozenStorm) return stormPlan;
  if (/flame|fire|inferno|twin/.test(text) && /fold|two|pair|together|another/.test(text)) return infernoPlan;
  if (/boil|steam|evaporat|pool|lake|water/.test(text)) return steamPlan;
  if (/frost|freeze|ice/.test(text) && /water|pool|drop/.test(text)) {
    return plan({
      title: "Frost bloom",
      summary: "Ice meets a droplet and frost races across it.",
      reactionIds: ["frost-bloom"],
      effectIds: ["frost"],
      placements: [
        { element: "water", x: 0.5, y: 0.52, mode: "stamp" },
        { element: "ice", x: 0.5, y: 0.48, mode: "stamp" },
      ],
    });
  }
  return steamPlan;
}

export function catalogPrompt(idea: string): string {
  const catalog = {
    elements: ["fire", "water", "ice", "electricity"],
    reactions: reactionCatalog,
    effects: EFFECT_IDS,
  };
  return [
    "You are CHAOS CORE, the interpreter for a playful element sandbox.",
    "Choose only ids from the catalog. Do not invent elements, reactions, effects, or code.",
    "Reply with one JSON object and no other text.",
    'Shape: {"title": string, "summary": string, "reactionIds": string[], "effectIds": string[], "placements": [{"element": string, "x": number, "y": number, "mode": "stamp" | "brush"}]}',
    "x and y are fractions from 0 to 1. Put elements that should react on nearly the same point.",
    "Include every element required by the chosen reactions.",
    `Catalog: ${JSON.stringify(catalog)}`,
    `Experiment idea: ${idea}`,
  ].join("\n");
}
