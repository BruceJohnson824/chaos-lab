import { elementDraft, scatter } from "./draft.ts";
import type { ElementDefinition } from "./types.ts";

/** Electricity dashes in short jumps and arcs toward nearby charge. */
export const electricity: ElementDefinition = {
  id: "electricity",
  name: "Electricity",
  blurb: "Erratic bolts. Brief, branching, loud.",
  accent: "#c9a6ff",
  glow: "#8b5cff",
  shortcut: "4",
  boundary: "bounce",
  stamp(x, y, reducedMotion) {
    const count = reducedMotion ? 1 : 3;
    const spread = reducedMotion ? 12 : 26;
    return Array.from({ length: count }, (_, index) => {
      const point = scatter(x, y, index, count, spread);
      const angle = Math.random() * Math.PI * 2;
      const speed = reducedMotion ? 70 : 140 + Math.random() * 160;
      return elementDraft("electricity", {
        x: point.x,
        y: point.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 5 + Math.random() * 1.5,
        life: 4.6 + Math.random() * 1.4,
        phase: Math.random() * 0.2,
      });
    });
  },
  brush(x, y) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 120 + Math.random() * 140;
    return elementDraft("electricity", {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 4.5,
      life: 4.2 + Math.random(),
      phase: 0.05,
    });
  },
  update(particle, dt, reducedMotion) {
    particle.phase -= dt;
    if (particle.phase <= 0) {
      const angle = Math.random() * Math.PI * 2;
      const speed = reducedMotion ? 80 : 150 + Math.random() * 220;
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed;
      particle.phase = reducedMotion ? 0.32 : 0.07 + Math.random() * 0.12;
    }
    particle.life -= dt * 0.85;
  },
};
