export type ElementId = "fire" | "water" | "ice" | "electricity";

export type VisualKind =
  | ElementId
  | "steam"
  | "spark"
  | "shard"
  | "bubble"
  | "frost"
  | "plasma";

export type BoundaryMode = "rise" | "pool" | "slide" | "bounce";

export interface Bounds {
  width: number;
  height: number;
}

export interface ParticleDraft {
  element: ElementId | "effect";
  visual: VisualKind;
  tint: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  life: number;
  maxLife: number;
  rotation: number;
  spin: number;
  seed: number;
  phase: number;
}

export interface Particle extends ParticleDraft {
  id: number;
  cooldown: number;
  history: Array<{ x: number; y: number }>;
}

export interface Flash {
  x: number;
  y: number;
  radius: number;
  life: number;
  maxLife: number;
  color: string;
}

export interface LogEntry {
  id: number;
  at: number;
  message: string;
  tone: "place" | "reaction" | "system";
}

export interface AimPoint {
  x: number;
  y: number;
}

export interface LabSnapshot {
  running: boolean;
  particleCount: number;
  discoveries: string[];
  log: LogEntry[];
}
