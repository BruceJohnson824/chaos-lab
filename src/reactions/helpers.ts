import { rand } from "../simulation/math.ts";
import type { ParticleDraft, VisualKind } from "../simulation/types.ts";

export function midpoint(a: { x: number; y: number }, b: { x: number; y: number }) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function pointsBetween(
  a: { x: number; y: number },
  b: { x: number; y: number },
  count: number,
): Array<{ x: number; y: number }> {
  return Array.from({ length: count }, (_, index) => {
    const t = (index + 1) / (count + 1);
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
    };
  });
}

export function makeEffect(fields: {
  visual: VisualKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  life: number;
  tint?: string;
  spin?: number;
}): ParticleDraft {
  return {
    element: "effect",
    visual: fields.visual,
    tint: fields.tint ?? "",
    x: fields.x,
    y: fields.y,
    vx: fields.vx,
    vy: fields.vy,
    radius: fields.radius,
    life: fields.life,
    maxLife: fields.life,
    rotation: Math.random() * Math.PI,
    spin: fields.spin ?? rand(-3, 3),
    seed: Math.random() * 1000,
    phase: Math.random() * Math.PI * 2,
  };
}
