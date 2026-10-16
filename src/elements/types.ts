import type { BoundaryMode, ElementId, Particle, ParticleDraft } from "../simulation/types.ts";

/**
 * Contract for a placeable element.
 * Copy an existing file in this folder, then register it in `index.ts`.
 */
export interface ElementDefinition {
  id: ElementId;
  name: string;
  blurb: string;
  accent: string;
  glow: string;
  shortcut: string;
  boundary: BoundaryMode;
  stamp(x: number, y: number, reducedMotion: boolean): ParticleDraft[];
  brush(x: number, y: number): ParticleDraft;
  update(particle: Particle, dt: number, reducedMotion: boolean): void;
}
