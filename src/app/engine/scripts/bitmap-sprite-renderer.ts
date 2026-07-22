import { Script } from '../game-object/script';
import { GameObject } from '../game-object/game-object';

export class BitmapSpriteRenderer extends Script {
  public static create(gameObject: GameObject, bitmap: number[][][], framePerSecond: number): BitmapSpriteRenderer {
    return new BitmapSpriteRenderer(gameObject, bitmap, framePerSecond);
  }

  private readonly gameObject: GameObject;
  private readonly bitmap: number[][][];
  private readonly framePerSecond: number;
  private spriteIndexTime: number = 0;

  private constructor(gameObject: GameObject, bitmap: number[][][], framePerSecond: number) {
    super();

    this.gameObject = gameObject;
    this.bitmap = bitmap;
    this.framePerSecond = framePerSecond;
  }

  public override update(): void {
    this.spriteIndexTime += this.framePerSecond * this.gameObject.engineState.deltaTime;
    if (this.spriteIndexTime >= this.bitmap.length) {
      this.spriteIndexTime = this.spriteIndexTime - Math.floor(this.spriteIndexTime);
    }
    this.gameObject.engineState.screenBuffer.copy(
      this.bitmap[Math.floor(this.spriteIndexTime)],
      this.gameObject.position.x,
      this.gameObject.position.y,
    );
  }
}
