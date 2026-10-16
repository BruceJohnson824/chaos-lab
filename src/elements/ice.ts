import { elementDraft, scatter } from "./draft.ts";
import type { ElementDefinition } from "./types.ts";

/** Ice drifts, facets the light, and holds its shape until shocked or burned. */
export const ice: ElementDefinition = {
  id: "ice",
  name: "Ice",
  blurb: "Slow crystals. Brittle under heat or current.",
  accent: "#e7f8ff",
  glow: "#9be7ff",
  shortcut: "3",
  boundary: "slide",
  stamp(x, y, reducedMotion) {
    const count = reducedMotion ? 2 : 4;
    const spread = reducedMotion ? 16 : 32;
    return Array.from({ length: count }, (_, index) => {
      const point = scatter(x, y, index, count, spread);
      return elementDraft("ice", {
        x: point.x,
        y: point.y,
        vx: (Math.random() - 0.5) * (reducedMotion ? 8 : 18),
        vy: Math.random() * (reducedMotion ? 8 : 18),
        radius: 8 + Math.random() * 4,
        life: 20 + Math.random() * 8,
        spin: (Math.random() - 0.5) * (reducedMotion ? 0.3 : 1.1),
      });
    });
  },
  brush(x, y) {
    return elementDraft("ice", {
      x: x + (Math.random() - 0.5) * 6,
      y: y + (Math.random() - 0.5) * 6,
      vx: (Math.random() - 0.5) * 12,
      vy: Math.random() * 10,
      radius: 7 + Math.random() * 3,
      life: 18 + Math.random() * 6,
      spin: (Math.random() - 0.5) * 0.8,
    });
  },
  update(particle, dt, reducedMotion) {
    particle.vy += (reducedMotion ? 30 : 70) * dt;
    particle.vx *= 0.99;
    particle.rotation += particle.spin * dt * (reducedMotion ? 0.35 : 1);
    particle.life -= dt * 0.035;
  },
};
