import { Script } from '../../engine/game-object/script';
import { GameObject } from '../../engine/game-object/game-object';

export class LivesScript extends Script {
  public static create(gameObject: GameObject, lives: number): LivesScript {
    return new LivesScript(gameObject, lives);
  }

  private remaining: number;

  private constructor(gameObject: GameObject, lives: number) {
    super(gameObject);
    this.remaining = lives;
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
