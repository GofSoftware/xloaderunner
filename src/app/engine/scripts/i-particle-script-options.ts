import { Vector2 } from '../math/vector-2';

export interface IParticle {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  remainingLife: number;
}

export interface IParticleScriptOptions {
  numberOfParticles: number;
  speed: number;
  weight: number;
  gravity: number;
  // Called once per particle, with its index, to get its (normalized) initial direction. Pass null
  // to give every particle its own random direction instead.
  direction: ((index: number) => Vector2) | null;
  color: number;
  colorOverrides: ((color: number, particle: IParticle) => number)[];
  // How long (seconds) a particle lives before it resets back to the GameObject's current position
  // with a fresh direction/velocity. Drawn fresh from [min, max] each time a particle (re)spawns, so
  // particles fall out of sync with each other and the effect reads as a continuous spread rather
  // than everything popping back at once - pass the same value for both to make it fixed instead.
  timeToLive: { min: number; max: number };
  // Offset from the GameObject's position that particles (re)spawn from. Defaults to CELL_SIZE / 2
  // in both axes - the center of a default 8x8 tile - so most callers can leave these unset; pass
  // either to spawn from somewhere else instead (an edge, a corner, off to one side, ...).
  shiftX?: number;
  shiftY?: number;
}
