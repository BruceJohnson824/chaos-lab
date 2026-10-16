import type { ElementId, Particle, ParticleDraft } from "../simulation/types.ts";

/**
 * Helpers handed to a reaction while two motes are touching.
 * `resolve` may also edit either particle directly.
 */
export interface ReactionApi {
  reducedMotion: boolean;
  spawn(draft: ParticleDraft): void;
  damage(particle: Particle, portion: number): void;
  remove(particle: Particle): void;
  burst(x: number, y: number, color: string, radius: number): void;
  nudge(a: Particle, b: Particle, force: number): void;
}

export interface ReactionDefinition {
  id: string;
  title: string;
  /** Either order is fine. The registry sorts the pair. */
  pair: [ElementId, ElementId];
  summary: string;
  lockedHint: string;
  accent: string;
  resolve(a: Particle, b: Particle, api: ReactionApi): void;
}
