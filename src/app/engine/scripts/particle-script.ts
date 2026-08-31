import { Script } from '../game-object/script';
import { GameObject } from '../game-object/game-object';
import { Vector2 } from '../math/vector-2';
import { IParticle, IParticleScriptOptions } from './i-particle-script-options';
import { CELL_SIZE } from '../screen/screen.constants';

const DEFAULT_SHIFT = CELL_SIZE / 2;

/**
 * Spawns `numberOfParticles` particles at the GameObject's position (offset by `shiftX`/`shiftY`,
 * which default to the center of a default 8x8 tile) and draws each as a single `color` pixel every
 * update() - `colorOverrides` are applied in order and each also receives the particle itself, so a
 * fade-by-remaining-life effect is possible. A particle's initial velocity is `direction(index)` (or
 * a random direction if `direction` is null) normalized and scaled by `speed`; `gravity` then
 * accelerates its vertical velocity every frame (`velocityY += gravity * deltaTime`).
 *
 * Each particle carries its own countdown, drawn fresh from `timeToLive` on every (re)spawn; once it
 * expires the particle resets to the GameObject's current position with a new direction/velocity and
 * a freshly-rolled countdown, rather than being removed - so the effect keeps emitting indefinitely.
 * Randomizing `timeToLive` (rather than a fixed value) is what keeps particles out of sync with each
 * other, so the respawns read as continuous spread instead of the whole effect blinking at once.
 * Destroy the GameObject itself to end the effect outright.
 */
export class ParticleScript extends Script {
  public static create(gameObject: GameObject, options: IParticleScriptOptions, layer: number): ParticleScript {
    return new ParticleScript(gameObject, options, layer);
  }

  private readonly options: IParticleScriptOptions;
  private readonly layer: number;
  private readonly particles: IParticle[];

  private constructor(gameObject: GameObject, options: IParticleScriptOptions, layer: number) {
    super(gameObject);
    this.options = options;
    this.layer = layer;
    this.particles = Array.from({ length: options.numberOfParticles }, (_, index) => this.spawnParticle(index));
  }

  public override update(): void {
    const { screenBuffer, deltaTime } = this.gameObject.engineState;
    this.particles.forEach((particle, index) => {
      particle.remainingLife -= deltaTime;
      particle.velocityY += this.options.gravity * deltaTime;
      if (particle.remainingLife <= 0) {
        Object.assign(particle, this.spawnParticle(index));
      } else {
        particle.x += particle.velocityX * deltaTime;
        particle.y += particle.velocityY * deltaTime;
      }
      let color = this.options.color;
      if (this.options.colorOverrides != null) {
        color = this.options.colorOverrides.reduce((currentColor, override) => {
          return override(currentColor, particle);
        }, color);
      }
      screenBuffer.copy([[color]], particle.x, particle.y, this.layer);
    });
  }

  private spawnParticle(index: number): IParticle {
    const { direction, speed, gravity, weight, timeToLive, shiftX, shiftY } = this.options;
    const normalizedDirection = ParticleScript.normalize(direction ? direction(index) : ParticleScript.randomDirection());
    const { x, y } = this.gameObject.position;

    return {
      x: x + (shiftX ?? DEFAULT_SHIFT),
      y: y + (shiftY ?? DEFAULT_SHIFT),
      velocityX: normalizedDirection.x * speed,
      velocityY: normalizedDirection.y * speed,
      remainingLife: ParticleScript.randomInRange(timeToLive.min, timeToLive.max),
    };
  }

  private static randomDirection(): Vector2 {
    const angle = Math.random() * Math.PI * 2;
    return { x: Math.cos(angle), y: Math.sin(angle) };
  }

  private static normalize(vector: Vector2): Vector2 {
    const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y) || 1;
    return { x: vector.x / length, y: vector.y / length };
  }

  private static randomInRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }
}
