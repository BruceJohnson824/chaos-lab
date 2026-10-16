import { elementDraft, scatter } from "./draft.ts";
import type { ElementDefinition } from "./types.ts";

/** Water falls, splashes lightly, and pools along the floor of the bench. */
export const water: ElementDefinition = {
  id: "water",
  name: "Water",
  blurb: "Falls, pools, and carries a charge.",
  accent: "#3ec5ff",
  glow: "#1f8bff",
  shortcut: "2",
  boundary: "pool",
  stamp(x, y, reducedMotion) {
    const count = reducedMotion ? 3 : 5;
    const spread = reducedMotion ? 18 : 34;
    return Array.from({ length: count }, (_, index) => {
      const point = scatter(x, y, index, count, spread);
      return elementDraft("water", {
        x: point.x,
        y: point.y,
        vx: (Math.random() - 0.5) * (reducedMotion ? 12 : 30),
        vy: 4 + Math.random() * (reducedMotion ? 10 : 24),
        radius: 7 + Math.random() * 4,
        life: 16 + Math.random() * 6,
      });
    });
  },
  brush(x, y) {
    return elementDraft("water", {
      x: x + (Math.random() - 0.5) * 8,
      y: y + (Math.random() - 0.5) * 8,
      vx: (Math.random() - 0.5) * 20,
      vy: 16 + Math.random() * 28,
      radius: 6.5 + Math.random() * 3,
      life: 14 + Math.random() * 5,
    });
  },
  update(particle, dt, reducedMotion) {
    particle.vy += (reducedMotion ? 180 : 320) * dt;
    particle.vx *= 0.992;
    particle.phase += dt;
    particle.life -= dt * 0.08;
  },
};
