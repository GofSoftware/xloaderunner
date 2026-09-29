import { Script } from '../../engine/game-object/script';
import { GameObject } from '../../engine/game-object/game-object';

export class LivesScript extends Script {
  public static create(gameObject: GameObject, lives: number, loseLifeCallback: () => void): LivesScript {
    return new LivesScript(gameObject, lives, loseLifeCallback);
  }

  private readonly remaining: number;
  private readonly loseLifeCallback: (() => void) | null = null;

  private constructor(gameObject: GameObject, lives: number, loseLifeCallback: () => void) {
    super(gameObject);
    this.remaining = lives;
    this.loseLifeCallback = loseLifeCallback;
  }

  public get count(): number {
    return this.remaining;
  }

  public loseLife(): void {
    this.gameObject.engineState.registerAfterUpdate(() => this.loseLifeCallback?.());
  }
}
