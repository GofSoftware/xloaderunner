import { Script } from '../../engine/game-object/script';
import { GameObject } from '../../engine/game-object/game-object';
import { VoidCallback } from '../data/level/start-menu-level';

export class LivesScript extends Script {
  public static create(
    gameObject: GameObject, lives: number, loseLifeCallback: VoidCallback, nextLevelCallback: VoidCallback
  ): LivesScript {
    return new LivesScript(gameObject, lives, loseLifeCallback, nextLevelCallback);
  }

  private readonly remaining: number;
  private readonly loseLifeCallback: VoidCallback;
  private readonly nextLevelCallback: VoidCallback;

  private constructor(gameObject: GameObject, lives: number, loseLifeCallback: VoidCallback, nextLevelCallback: VoidCallback) {
    super(gameObject);
    this.remaining = lives;
    this.loseLifeCallback = loseLifeCallback;
    this.nextLevelCallback = nextLevelCallback;
  }

  public get count(): number {
    return this.remaining;
  }

  public loseLife(): void {
    this.gameObject.engineState.registerAfterUpdate(() => this.loseLifeCallback());
  }

  public nextLevel(): void {
    this.gameObject.engineState.registerAfterUpdate(() => this.nextLevelCallback());
  }
}
