import { hexToRgba } from "./math.ts";
import type { LabSimulation } from "./engine.ts";
import type { Particle, VisualKind } from "./types.ts";

const DUST = Array.from({ length: 42 }, () => ({
  x: Math.random(),
  y: Math.random(),
  radius: Math.random() * 1.3 + 0.25,
  speed: Math.random() * 0.012 + 0.004,
  alpha: Math.random() * 0.22 + 0.05,
}));

const DRAW_ORDER: VisualKind[] = [
  "steam",
  "frost",
  "bubble",
  "shard",
  "water",
  "ice",
  "fire",
  "plasma",
  "spark",
  "electricity",
];

export function renderLab(
  ctx: CanvasRenderingContext2D,
  sim: LabSimulation,
  time: number,
): void {
  const { width, height } = sim;
  ctx.clearRect(0, 0, width, height);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  drawBackdrop(ctx, width, height, time, sim.reducedMotion);
  drawFlashes(ctx, sim);
  const buckets = new Map<VisualKind, Particle[]>();
  for (const particle of sim.particles) {
    const list = buckets.get(particle.visual);
    if (list) list.push(particle);
    else buckets.set(particle.visual, [particle]);
  }
  for (const visual of DRAW_ORDER) {
    const list = buckets.get(visual);
    if (!list) continue;
    if (visual === "electricity") drawArcs(ctx, list, sim.particles, time, sim.reducedMotion);
    for (const particle of list) drawParticle(ctx, particle, time, sim.reducedMotion);
  }
  drawVignette(ctx, width, height);
  if (sim.aim) drawAim(ctx, sim.aim.x, sim.aim.y, sim.aimColor);
}

function drawBackdrop(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  reducedMotion: boolean,
): void {
  ctx.fillStyle = "#08090e";
  ctx.fillRect(0, 0, width, height);

  const cyan = ctx.createRadialGradient(width * 0.12, height * 0.08, 0, width * 0.12, height * 0.08, width * 0.55);
  cyan.addColorStop(0, "rgba(70, 210, 230, 0.16)");
  cyan.addColorStop(1, "rgba(70, 210, 230, 0)");
  ctx.fillStyle = cyan;
  ctx.fillRect(0, 0, width, height);

  const orange = ctx.createRadialGradient(width * 0.92, height * 0.95, 0, width * 0.92, height * 0.95, width * 0.48);
  orange.addColorStop(0, "rgba(255, 90, 30, 0.12)");
  orange.addColorStop(1, "rgba(255, 90, 30, 0)");
  ctx.fillStyle = orange;
  ctx.fillRect(0, 0, width, height);

  const violet = ctx.createRadialGradient(width * 0.7, height * 0.05, 0, width * 0.7, height * 0.05, width * 0.35);
  violet.addColorStop(0, "rgba(150, 90, 255, 0.1)");
  violet.addColorStop(1, "rgba(150, 90, 255, 0)");
  ctx.fillStyle = violet;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(150, 190, 220, 0.06)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  const gap = 36;
  for (let x = gap; x < width; x += gap) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  for (let y = gap; y < height; y += gap) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();

  ctx.strokeStyle = "rgba(140, 190, 220, 0.2)";
  ctx.beginPath();
  ctx.moveTo(28, height - 12);
  ctx.lineTo(width - 28, height - 12);
  ctx.stroke();

  for (const speck of DUST) {
    const drift = reducedMotion ? 0 : (time * speck.speed) % 1;
    const y = ((speck.y - drift + 1) % 1) * height;
    ctx.fillStyle = `rgba(210, 230, 255, ${speck.alpha})`;
    ctx.fillRect(speck.x * width, y, speck.radius, speck.radius);
  }
}

function drawFlashes(ctx: CanvasRenderingContext2D, sim: LabSimulation): void {
  for (const flash of sim.flashes) {
    const alpha = Math.max(0, flash.life / flash.maxLife);
    const gradient = ctx.createRadialGradient(flash.x, flash.y, 0, flash.x, flash.y, flash.radius);
    gradient.addColorStop(0, hexToRgba(flash.color, 0.55 * alpha));
    gradient.addColorStop(0.45, hexToRgba(flash.color, 0.16 * alpha));
    gradient.addColorStop(1, hexToRgba(flash.color, 0));
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(flash.x, flash.y, flash.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawParticle(
  ctx: CanvasRenderingContext2D,
  particle: Particle,
  time: number,
  reducedMotion: boolean,
): void {
  const fade = Math.min(1, particle.life / 0.7);
  ctx.save();
  ctx.globalAlpha = fade;
  switch (particle.visual) {
    case "fire":
      drawFire(ctx, particle, time, reducedMotion);
      break;
    case "water":
      drawWater(ctx, particle);
      break;
    case "ice":
      drawIce(ctx, particle);
      break;
    case "electricity":
      drawElectricity(ctx, particle, reducedMotion);
      break;
    case "steam":
      drawSteam(ctx, particle);
      break;
    case "spark":
      drawSpark(ctx, particle);
      break;
    case "shard":
      drawShard(ctx, particle);
      break;
    case "bubble":
      drawBubble(ctx, particle);
      break;
    case "frost":
      drawFrost(ctx, particle);
      break;
    case "plasma":
      drawPlasma(ctx, particle);
      break;
    default:
      break;
  }
  ctx.restore();
}

function drawFire(
  ctx: CanvasRenderingContext2D,
  particle: Particle,
  time: number,
  reducedMotion: boolean,
): void {
  const flicker = reducedMotion ? 1 : 0.86 + Math.sin(time * 16 + particle.seed) * 0.16;
  const radius = particle.radius * flicker;
  const glow = ctx.createRadialGradient(particle.x, particle.y, radius * 0.1, particle.x, particle.y, radius * 2.6);
  glow.addColorStop(0, "rgba(255, 244, 214, 0.95)");
  glow.addColorStop(0.28, "rgba(255, 170, 60, 0.9)");
  glow.addColorStop(0.62, "rgba(255, 78, 20, 0.55)");
  glow.addColorStop(1, "rgba(255, 40, 0, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(particle.x, particle.y, radius * 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 214, 120, 0.9)";
  ctx.beginPath();
  ctx.ellipse(particle.x, particle.y - radius * 0.45, radius * 0.48, radius * 1.15, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawWater(ctx: CanvasRenderingContext2D, particle: Particle): void {
  const radius = particle.radius;
  const glow = ctx.createRadialGradient(
    particle.x - radius * 0.2,
    particle.y - radius * 0.25,
    radius * 0.1,
    particle.x,
    particle.y,
    radius * 1.35,
  );
  glow.addColorStop(0, "rgba(236, 251, 255, 0.95)");
  glow.addColorStop(0.45, "rgba(80, 186, 255, 0.9)");
  glow.addColorStop(1, "rgba(18, 86, 210, 0.15)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.ellipse(particle.x, particle.y, radius * 0.92, radius * 1.05, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.beginPath();
  ctx.ellipse(particle.x - radius * 0.28, particle.y - radius * 0.32, radius * 0.18, radius * 0.1, -0.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawIce(ctx: CanvasRenderingContext2D, particle: Particle): void {
  const radius = particle.radius;
  ctx.save();
  ctx.translate(particle.x, particle.y);
  ctx.rotate(particle.rotation);
  const glow = ctx.createRadialGradient(0, 0, radius * 0.2, 0, 0, radius * 1.8);
  glow.addColorStop(0, "rgba(255, 255, 255, 0.45)");
  glow.addColorStop(1, "rgba(170, 230, 255, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 1.8, 0, Math.PI * 2);
  ctx.fill();
  polygon(ctx, 0, 0, radius, 6, 0);
  ctx.fillStyle = "rgba(214, 246, 255, 0.38)";
  ctx.fill();
  ctx.strokeStyle = "rgba(247, 253, 255, 0.95)";
  ctx.lineWidth = 1.4;
  ctx.stroke();
  polygon(ctx, 0, 0, radius * 0.45, 6, Math.PI / 6);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -radius * 0.7);
  ctx.lineTo(radius * 0.35, radius * 0.15);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
  ctx.fill();
  ctx.restore();
}

function drawElectricity(
  ctx: CanvasRenderingContext2D,
  particle: Particle,
  reducedMotion: boolean,
): void {
  const trail = particle.history;
  const first = trail[0];
  if (trail.length > 1 && first) {
    ctx.beginPath();
    ctx.moveTo(first.x, first.y);
    for (const point of trail.slice(1)) ctx.lineTo(point.x, point.y);
    ctx.lineTo(particle.x, particle.y);
    ctx.strokeStyle = "rgba(198, 170, 255, 0.85)";
    ctx.lineWidth = reducedMotion ? 1.4 : 2;
    ctx.stroke();
  }
  const glow = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.radius * 2.4);
  glow.addColorStop(0, "rgba(255, 255, 255, 0.95)");
  glow.addColorStop(0.35, "rgba(198, 160, 255, 0.85)");
  glow.addColorStop(1, "rgba(120, 70, 255, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(particle.x, particle.y, particle.radius * 2.4, 0, Math.PI * 2);
  ctx.fill();
}

function drawSteam(ctx: CanvasRenderingContext2D, particle: Particle): void {
  const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.radius);
  gradient.addColorStop(0, "rgba(244, 252, 255, 0.35)");
  gradient.addColorStop(1, "rgba(244, 252, 255, 0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawSpark(ctx: CanvasRenderingContext2D, particle: Particle): void {
  const speed = Math.hypot(particle.vx, particle.vy) || 1;
  const length = particle.radius * 1.8;
  ctx.strokeStyle = particle.tint || "#efe7ff";
  ctx.lineWidth = 1.7;
  ctx.beginPath();
  ctx.moveTo(particle.x, particle.y);
  ctx.lineTo(particle.x - (particle.vx / speed) * length, particle.y - (particle.vy / speed) * length);
  ctx.stroke();
}

function drawShard(ctx: CanvasRenderingContext2D, particle: Particle): void {
  ctx.save();
  ctx.translate(particle.x, particle.y);
  ctx.rotate(particle.rotation);
  ctx.beginPath();
  ctx.moveTo(0, -particle.radius);
  ctx.lineTo(particle.radius * 0.42, particle.radius * 0.75);
  ctx.lineTo(-particle.radius * 0.42, particle.radius * 0.75);
  ctx.closePath();
  ctx.fillStyle = particle.tint || "rgba(236, 248, 255, 0.92)";
  ctx.fill();
  ctx.restore();
}

function drawBubble(ctx: CanvasRenderingContext2D, particle: Particle): void {
  ctx.strokeStyle = particle.tint || "rgba(200, 242, 255, 0.85)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
  ctx.beginPath();
  ctx.arc(particle.x - particle.radius * 0.3, particle.y - particle.radius * 0.3, Math.max(0.8, particle.radius * 0.18), 0, Math.PI * 2);
  ctx.fill();
}

function drawFrost(ctx: CanvasRenderingContext2D, particle: Particle): void {
  ctx.save();
  ctx.translate(particle.x, particle.y);
  ctx.rotate(particle.rotation);
  polygon(ctx, 0, 0, particle.radius, 6, 0);
  ctx.strokeStyle = "rgba(245, 253, 255, 0.8)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

function drawPlasma(ctx: CanvasRenderingContext2D, particle: Particle): void {
  const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.radius);
  gradient.addColorStop(0, "rgba(255, 255, 255, 0.95)");
  gradient.addColorStop(0.4, particle.tint || "rgba(255, 170, 80, 0.7)");
  gradient.addColorStop(1, "rgba(180, 120, 255, 0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawArcs(
  ctx: CanvasRenderingContext2D,
  bolts: Particle[],
  particles: Particle[],
  time: number,
  reducedMotion: boolean,
): void {
  ctx.lineWidth = reducedMotion ? 1 : 1.4;
  ctx.strokeStyle = "rgba(214, 196, 255, 0.75)";
  for (let index = 0; index < bolts.length; index += 1) {
    const bolt = bolts[index];
    if (!bolt) continue;
    let links = 0;
    for (let otherIndex = index + 1; otherIndex < bolts.length; otherIndex += 1) {
      const other = bolts[otherIndex];
      if (!other) continue;
      const distance = Math.hypot(other.x - bolt.x, other.y - bolt.y);
      if (distance > 120) continue;
      boltLine(ctx, bolt.x, bolt.y, other.x, other.y, bolt.seed, time, reducedMotion);
      links += 1;
      if (links >= 2) break;
    }
    if (links > 0) continue;
    for (const particle of particles) {
      if (particle.visual !== "water") continue;
      const distance = Math.hypot(particle.x - bolt.x, particle.y - bolt.y);
      if (distance > 78) continue;
      boltLine(ctx, bolt.x, bolt.y, particle.x, particle.y, bolt.seed, time, reducedMotion);
      break;
    }
  }
}

function boltLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  seed: number,
  time: number,
  reducedMotion: boolean,
): void {
  const distance = Math.hypot(x2 - x1, y2 - y1) || 1;
  const steps = reducedMotion ? 2 : Math.max(3, Math.floor(distance / 18));
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  for (let step = 1; step < steps; step += 1) {
    const t = step / steps;
    const px = x1 + (x2 - x1) * t;
    const py = y1 + (y2 - y1) * t;
    const magnitude = reducedMotion ? 0 : Math.sin(seed + time * 14 + step) * 7;
    ctx.lineTo(px + (-(y2 - y1) / distance) * magnitude, py + ((x2 - x1) / distance) * magnitude);
  }
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawVignette(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.25,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.72,
  );
  gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0.42)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawAim(ctx: CanvasRenderingContext2D, x: number, y: number, color: string): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(x, y, 12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 18, y);
  ctx.lineTo(x - 6, y);
  ctx.moveTo(x + 6, y);
  ctx.lineTo(x + 18, y);
  ctx.moveTo(x, y - 18);
  ctx.lineTo(x, y - 6);
  ctx.moveTo(x, y + 6);
  ctx.lineTo(x, y + 18);
  ctx.stroke();
  ctx.restore();
}

function polygon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  sides: number,
  rotation: number,
): void {
  ctx.beginPath();
  for (let side = 0; side < sides; side += 1) {
    const angle = rotation + (side / sides) * Math.PI * 2 - Math.PI / 2;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (side === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}
