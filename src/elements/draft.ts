import { rand } from "../simulation/math.ts";
import type { ElementId, ParticleDraft } from "../simulation/types.ts";

export function elementDraft(
  element: ElementId,
  fields: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    life: number;
    spin?: number;
    phase?: number;
  },
): ParticleDraft {
  return {
    element,
    visual: element,
    tint: "",
    x: fields.x,
    y: fields.y,
    vx: fields.vx,
    vy: fields.vy,
    radius: fields.radius,
    life: fields.life,
    maxLife: fields.life,
    rotation: Math.random() * Math.PI,
    spin: fields.spin ?? rand(-0.8, 0.8),
    seed: Math.random() * 1000,
    phase: fields.phase ?? Math.random() * Math.PI * 2,
  };
}

export function scatter(
  x: number,
  y: number,
  index: number,
  count: number,
  radius: number,
): { x: number; y: number } {
  if (index === 0 || count < 2) return { x, y };
  const angle = ((index - 1) / (count - 1)) * Math.PI * 2 + rand(-0.15, 0.15);
  const distance = radius * rand(0.82, 1.12);
  return {
    x: x + Math.cos(angle) * distance,
    y: y + Math.sin(angle) * distance * 0.78,
  };
}
