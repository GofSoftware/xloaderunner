import { Script } from '../../engine/game-object/script';
import { GameObject } from '../../engine/game-object/game-object';

export const MAX_LIVES = 5;

export class LivesScript extends Script {
  public static create(gameObject: GameObject, count: number = MAX_LIVES): LivesScript {
    return new LivesScript(gameObject, count);
  }

  private remaining: number;

  private constructor(gameObject: GameObject, count: number) {
    super(gameObject);
    this.remaining = count;
  }

  public get count(): number {
    return this.remaining;
  }

  public get isGameOver(): boolean {
    return this.remaining <= 0;
  }

  public loseLife(): void {
    if (this.remaining > 0) {
      this.remaining--;
    }
  }
}
