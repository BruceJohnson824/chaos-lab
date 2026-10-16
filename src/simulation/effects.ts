import type { Bounds, Particle } from "./types.ts";

/** Motion for short-lived visuals spawned by reactions. Elements move themselves. */
export function updateEffect(particle: Particle, dt: number, bounds: Bounds): void {
  switch (particle.visual) {
    case "steam":
      particle.vy -= 22 * dt;
      particle.vx *= 0.99;
      particle.radius += 12 * dt;
      particle.life -= dt;
      break;
    case "spark":
      particle.vx *= 0.96;
      particle.vy *= 0.96;
      particle.life -= dt * 2.4;
      break;
    case "shard":
      particle.vy += 280 * dt;
      particle.vx *= 0.99;
      particle.rotation += particle.spin * dt;
      particle.life -= dt * 1.15;
      break;
    case "bubble":
      particle.vy -= 36 * dt;
      particle.vx *= 0.99;
      particle.life -= dt;
      break;
    case "frost":
      particle.vx *= 0.97;
      particle.vy *= 0.97;
      particle.radius += 6 * dt;
      particle.rotation += particle.spin * dt;
      particle.life -= dt * 1.3;
      break;
    case "plasma":
      particle.radius += 28 * dt;
      particle.life -= dt * 1.8;
      break;
    default:
      particle.life -= dt;
      break;
  }

  particle.x += particle.vx * dt;
  particle.y += particle.vy * dt;

  if (
    particle.y < -120 ||
    particle.y > bounds.height + 80 ||
    particle.x < -80 ||
    particle.x > bounds.width + 80
  ) {
    particle.life = 0;
  }
}
