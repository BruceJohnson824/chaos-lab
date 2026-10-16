import { getElement } from "../elements/index.ts";
import { findReaction } from "../reactions/index.ts";
import type { ReactionApi } from "../reactions/types.ts";
import { updateEffect } from "./effects.ts";
import { clamp } from "./math.ts";
import type {
  AimPoint,
  Bounds,
  BoundaryMode,
  ElementId,
  Flash,
  LabSnapshot,
  LogEntry,
  Particle,
  ParticleDraft,
} from "./types.ts";

const MAX_PARTICLES = 420;
const CELL = 56;
const DISCOVERY_KEY = "chaos-exe-discoveries";

function loadDiscoveries(): Set<string> {
  try {
    const raw = sessionStorage.getItem(DISCOVERY_KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((item) => typeof item === "string"));
  } catch {
    return new Set();
  }
}

function applyBounds(particle: Particle, mode: BoundaryMode, bounds: Bounds): void {
  const pad = 6;
  if (mode === "rise") {
    if (particle.x < pad) {
      particle.x = pad;
      particle.vx = Math.abs(particle.vx) * 0.4;
    } else if (particle.x > bounds.width - pad) {
      particle.x = bounds.width - pad;
      particle.vx = -Math.abs(particle.vx) * 0.4;
    }
    if (particle.y < -70) particle.life = 0;
    return;
  }

  if (mode === "bounce") {
    if (particle.x < particle.radius) {
      particle.x = particle.radius;
      particle.vx = Math.abs(particle.vx);
    } else if (particle.x > bounds.width - particle.radius) {
      particle.x = bounds.width - particle.radius;
      particle.vx = -Math.abs(particle.vx);
    }
    if (particle.y < particle.radius) {
      particle.y = particle.radius;
      particle.vy = Math.abs(particle.vy);
    } else if (particle.y > bounds.height - particle.radius) {
      particle.y = bounds.height - particle.radius;
      particle.vy = -Math.abs(particle.vy);
    }
    return;
  }

  const restitution = mode === "pool" ? 0.22 : 0.38;
  const friction = mode === "pool" ? 0.8 : 0.9;
  if (particle.x < particle.radius) {
    particle.x = particle.radius;
    particle.vx = Math.abs(particle.vx) * restitution;
  } else if (particle.x > bounds.width - particle.radius) {
    particle.x = bounds.width - particle.radius;
    particle.vx = -Math.abs(particle.vx) * restitution;
  }
  if (particle.y < particle.radius) {
    particle.y = particle.radius;
    particle.vy = Math.abs(particle.vy) * 0.3;
  }
  const floor = bounds.height - particle.radius - 8;
  if (particle.y > floor) {
    particle.y = floor;
    particle.vy = -Math.abs(particle.vy) * restitution;
    particle.vx *= friction;
    if (Math.abs(particle.vy) < 18) particle.vy = 0;
  }
}

/**
 * Playful particle bench. Elements move, then overlapping pairs consult
 * the reaction registry. UI state is published through `subscribe`.
 */
export class LabSimulation {
  particles: Particle[] = [];
  flashes: Flash[] = [];
  aim: AimPoint | null = null;
  aimColor = "#5cefff";
  running = true;
  reducedMotion = false;
  width = 1;
  height = 1;
  selected: ElementId = "fire";

  private nextId = 1;
  private nextLogId = 1;
  private log: LogEntry[] = [];
  private discoveries = loadDiscoveries();
  private listeners = new Set<() => void>();
  private pending: ParticleDraft[] = [];
  private lastLogAt = new Map<string, number>();
  private countTimer = 0;
  private lastCount = 0;

  constructor() {
    this.pushLog("Lab online. Mix elements and watch what happens.", "system");
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getSnapshot(): LabSnapshot {
    return {
      running: this.running,
      particleCount: this.particles.length,
      discoveries: [...this.discoveries],
      log: this.log.slice(0, 48),
    };
  }

  configure(options: { reducedMotion: boolean; selected: ElementId; aimColor: string }): void {
    this.reducedMotion = options.reducedMotion;
    this.selected = options.selected;
    this.aimColor = options.aimColor;
  }

  setBounds(width: number, height: number): void {
    this.width = width;
    this.height = height;
    if (this.aim) this.aim = this.clampAim(this.aim.x, this.aim.y);
  }

  focusAim(): void {
    this.aim = { x: this.width / 2, y: this.height / 2 };
  }

  clearAim(): void {
    this.aim = null;
  }

  moveAim(dx: number, dy: number): void {
    const origin = this.aim ?? { x: this.width / 2, y: this.height / 2 };
    this.aim = this.clampAim(origin.x + dx, origin.y + dy);
  }

  place(x: number, y: number, mode: "stamp" | "brush"): void {
    if (this.width < 20 || this.height < 20) return;
    if (this.particles.length > MAX_PARTICLES - 8) {
      this.note("The bench is full. Clear space before adding more.", "system", "full");
      return;
    }
    const element = getElement(this.selected);
    const drafts =
      mode === "stamp" ? element.stamp(x, y, this.reducedMotion) : [element.brush(x, y)];
    for (const draft of drafts) this.add(draft, 0);
    this.note(`Placed ${element.name}.`, "place", `place:${element.id}`);
    this.emit();
  }

  placeElement(elementId: ElementId, x: number, y: number, mode: "stamp" | "brush"): void {
    const previous = this.selected;
    this.selected = elementId;
    this.place(x, y, mode);
    this.selected = previous;
  }

  announce(message: string): void {
    this.pushLog(message, "system");
    this.emit();
  }

  toggleRunning(): void {
    this.running = !this.running;
    this.pushLog(this.running ? "Simulation resumed." : "Simulation paused.", "system");
    this.emit();
  }

  clearCanvas(): void {
    this.particles = [];
    this.flashes = [];
    this.pending = [];
    this.pushLog("Canvas cleared.", "system");
    this.emit();
  }

  resetExperiment(): void {
    this.particles = [];
    this.flashes = [];
    this.pending = [];
    this.discoveries = new Set();
    this.lastLogAt.clear();
    this.log = [];
    try {
      sessionStorage.removeItem(DISCOVERY_KEY);
    } catch {
      // Ignore private-mode storage failures.
    }
    this.running = true;
    this.pushLog("Experiment reset. The lab is ready.", "system");
    this.emit();
  }

  step(dt: number): void {
    const bounds = { width: this.width, height: this.height };
    const frameBudget = this.reducedMotion ? 18 : 40;
    this.pending = [];

    for (const particle of this.particles) {
      particle.cooldown = Math.max(0, particle.cooldown - dt);
      if (particle.element === "effect") {
        updateEffect(particle, dt, bounds);
        continue;
      }
      const element = getElement(particle.element);
      element.update(particle, dt, this.reducedMotion);
      this.limitSpeed(particle);
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      applyBounds(particle, element.boundary, bounds);
      if (particle.visual === "electricity") {
        particle.history.push({ x: particle.x, y: particle.y });
        if (particle.history.length > (this.reducedMotion ? 3 : 6)) particle.history.shift();
      }
    }

    this.react(frameBudget);
    this.flushPending();
    this.particles = this.particles.filter((particle) => particle.life > 0 && particle.radius > 0.4);
    this.flashes = this.flashes.filter((flash) => {
      flash.life -= dt;
      return flash.life > 0;
    });

    this.countTimer += dt;
    if (this.countTimer > 0.35 && this.particles.length !== this.lastCount) {
      this.countTimer = 0;
      this.lastCount = this.particles.length;
      this.emit();
    }
  }

  private react(frameBudget: number): void {
    const grid = new Map<string, Particle[]>();
    for (const particle of this.particles) {
      if (particle.element === "effect" || particle.life <= 0 || particle.cooldown > 0) continue;
      const key = `${Math.floor(particle.x / CELL)}:${Math.floor(particle.y / CELL)}`;
      const bucket = grid.get(key);
      if (bucket) bucket.push(particle);
      else grid.set(key, [particle]);
    }

    let spawned = 0;
    const api: ReactionApi = {
      reducedMotion: this.reducedMotion,
      spawn: (draft) => {
        if (spawned >= frameBudget) return;
        spawned += 1;
        this.pending.push(draft);
      },
      damage: (particle, portion) => {
        particle.life -= particle.maxLife * portion;
        particle.radius *= 1 - portion * 0.25;
      },
      remove: (particle) => {
        particle.life = 0;
      },
      burst: (x, y, color, radius) => {
        this.flashes.push({ x, y, color, radius, life: 0.28, maxLife: 0.28 });
      },
      nudge: (a, b, force) => {
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        const distance = Math.hypot(dx, dy) || 1;
        dx /= distance;
        dy /= distance;
        a.vx -= dx * force;
        a.vy -= dy * force;
        b.vx += dx * force;
        b.vy += dy * force;
        const overlap = a.radius + b.radius - distance;
        if (overlap > 0) {
          a.x -= dx * overlap * 0.5;
          a.y -= dy * overlap * 0.5;
          b.x += dx * overlap * 0.5;
          b.y += dy * overlap * 0.5;
        }
      },
    };

    for (const particle of this.particles) {
      if (particle.element === "effect" || particle.life <= 0 || particle.cooldown > 0) continue;
      const ix = Math.floor(particle.x / CELL);
      const iy = Math.floor(particle.y / CELL);
      let consumed = false;
      for (let offsetY = -1; offsetY <= 1 && !consumed; offsetY += 1) {
        for (let offsetX = -1; offsetX <= 1 && !consumed; offsetX += 1) {
          const bucket = grid.get(`${ix + offsetX}:${iy + offsetY}`);
          if (!bucket) continue;
          for (const other of bucket) {
            if (other.id <= particle.id || other.life <= 0 || other.cooldown > 0) continue;
            if (other.element === "effect") continue;
            const reach = (particle.radius + other.radius) * 1.28;
            const distance = Math.hypot(other.x - particle.x, other.y - particle.y);
            if (distance > reach) continue;
            const reaction = findReaction(particle.element, other.element);
            if (!reaction) continue;
            reaction.resolve(particle, other, api);
            particle.cooldown = 0.55;
            other.cooldown = 0.55;
            this.recordReaction(reaction.id, reaction.title, reaction.summary);
            consumed = true;
            break;
          }
        }
      }
    }
  }

  private flushPending(): void {
    for (const draft of this.pending) this.add(draft, 0.2);
    this.pending = [];
    if (this.particles.length <= MAX_PARTICLES) return;
    const overflow = this.particles.length - MAX_PARTICLES;
    const effectIds = this.particles
      .filter((particle) => particle.element === "effect")
      .sort((a, b) => a.id - b.id)
      .slice(0, overflow)
      .map((particle) => particle.id);
    const drop = new Set(effectIds);
    this.particles = this.particles.filter((particle) => !drop.has(particle.id));
  }

  private add(draft: ParticleDraft, cooldown: number): void {
    this.particles.push({
      ...draft,
      id: this.nextId,
      cooldown,
      history: [],
    });
    this.nextId += 1;
  }

  private limitSpeed(particle: Particle): void {
    const max = particle.element === "electricity" ? 540 : 380;
    const speed = Math.hypot(particle.vx, particle.vy);
    if (speed <= max) return;
    particle.vx = (particle.vx / speed) * max;
    particle.vy = (particle.vy / speed) * max;
  }

  private recordReaction(id: string, title: string, summary: string): void {
    if (!this.discoveries.has(id)) {
      this.discoveries.add(id);
      this.lastLogAt.set(id, performance.now());
      try {
        sessionStorage.setItem(DISCOVERY_KEY, JSON.stringify([...this.discoveries]));
      } catch {
        // Ignore private-mode storage failures.
      }
      this.pushLog(`Discovered ${title}. ${summary}`, "reaction");
      this.emit();
      return;
    }
    this.note(title, "reaction", id, 8000);
  }

  private note(message: string, tone: LogEntry["tone"], key: string, interval = 1100): void {
    const now = performance.now();
    const previous = this.lastLogAt.get(key);
    if (previous !== undefined && now - previous < interval) return;
    this.lastLogAt.set(key, now);
    this.pushLog(message, tone);
    this.emit();
  }

  private pushLog(message: string, tone: LogEntry["tone"]): void {
    this.log.unshift({
      id: this.nextLogId,
      at: Date.now(),
      message,
      tone,
    });
    this.nextLogId += 1;
    if (this.log.length > 48) this.log.length = 48;
  }

  private emit(): void {
    this.lastCount = this.particles.length;
    for (const listener of this.listeners) listener();
  }

  private clampAim(x: number, y: number): AimPoint {
    return {
      x: clamp(x, 16, Math.max(16, this.width - 16)),
      y: clamp(y, 16, Math.max(16, this.height - 16)),
    };
  }
}
