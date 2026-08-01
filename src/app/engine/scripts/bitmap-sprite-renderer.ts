import { Script } from '../game-object/script';
import { GameObject } from '../game-object/game-object';
import { ISpriteBitmapDescription } from './i-sprite-bitmap-description';

export class BitmapSpriteRenderer extends Script {
  public static create(
    gameObject: GameObject,
    bitmapDescription: ISpriteBitmapDescription,
    layer: number,
  ): BitmapSpriteRenderer {
    return new BitmapSpriteRenderer(gameObject, bitmapDescription, layer);
  }

  private readonly gameObject: GameObject;
  private bitmap: number[][][];
  private framePerSecond: number;
  private readonly layer: number;
  private spriteIndexTime: number = 0;

  private constructor(gameObject: GameObject, bitmapDescription: ISpriteBitmapDescription, layer: number) {
    super();

    this.gameObject = gameObject;
    this.bitmap = bitmapDescription.bitmap;
    this.framePerSecond = bitmapDescription.framePerSecond;
    this.layer = layer;
  }

  public setAnimation(bitmap: number[][][], framePerSecond: number = this.framePerSecond): void {
    this.bitmap = bitmap;
    this.framePerSecond = framePerSecond;
    this.spriteIndexTime = 0;
  }

  public override update(): void {
    this.spriteIndexTime += this.framePerSecond * this.gameObject.engineState.deltaTime;
    if (this.spriteIndexTime >= this.bitmap.length) {
      this.spriteIndexTime = this.spriteIndexTime % this.bitmap.length;
    }
    this.gameObject.engineState.screenBuffer.copy(
      this.bitmap[Math.floor(this.spriteIndexTime)],
      this.gameObject.position.x,
      this.gameObject.position.y,
      this.layer,
    );
  }
}
