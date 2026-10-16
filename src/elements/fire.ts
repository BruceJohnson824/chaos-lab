import { elementDraft, scatter } from "./draft.ts";
import type { ElementDefinition } from "./types.ts";

/** Fire rises, flickers, and burns out unless something feeds it. */
export const fire: ElementDefinition = {
  id: "fire",
  name: "Fire",
  blurb: "Rises and flickers. Hungry, brief, bright.",
  accent: "#ff7a3c",
  glow: "#ff4d1a",
  shortcut: "1",
  boundary: "rise",
  stamp(x, y, reducedMotion) {
    const count = reducedMotion ? 3 : 6;
    const spread = reducedMotion ? 16 : 30;
    return Array.from({ length: count }, (_, index) => {
      const point = scatter(x, y, index, count, spread);
      return elementDraft("fire", {
        x: point.x,
        y: point.y,
        vx: (Math.random() - 0.5) * (reducedMotion ? 10 : 22),
        vy: -8 - Math.random() * (reducedMotion ? 10 : 28),
        radius: 5.5 + Math.random() * 3.2,
        life: 6.5 + Math.random() * 2,
      });
    });
  },
  brush(x, y) {
    return elementDraft("fire", {
      x: x + (Math.random() - 0.5) * 6,
      y: y + (Math.random() - 0.5) * 6,
      vx: (Math.random() - 0.5) * 24,
      vy: -12 - Math.random() * 24,
      radius: 5 + Math.random() * 2.2,
      life: 6 + Math.random() * 1.6,
    });
  },
  update(particle, dt, reducedMotion) {
    const sway = reducedMotion ? 6 : 22;
    particle.phase += dt * (reducedMotion ? 2 : 6);
    particle.vx += Math.sin(particle.phase + particle.seed) * sway * dt;
    particle.vy -= (reducedMotion ? 10 : 22) * dt;
    particle.vx *= 0.985;
    particle.life -= dt;
  },
};
