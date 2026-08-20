import { Script } from '../game-object/script';
import { GameObject } from '../game-object/game-object';
import { ISpriteBitmapDescription } from './i-sprite-bitmap-description';

export class BitmapSpriteRenderer extends Script {
  public static create(
    gameObject: GameObject,
    bitmapDescription: ISpriteBitmapDescription,
    layer: number,
    colorOverrides: ((color: number) => number)[] = [],
  ): BitmapSpriteRenderer {
    return new BitmapSpriteRenderer(gameObject, bitmapDescription, layer, colorOverrides);
  }

  private bitmaps: number[][][];
  private framePerSecond: number;
  private readonly layer: number;
  private spriteIndexTime: number = 0;
  private colorOverrides: ((color: number) => number)[] = [];

  private constructor(
    gameObject: GameObject,
    bitmapDescription: ISpriteBitmapDescription,
    layer: number,
    colorOverrides: ((color: number) => number)[],
  ) {
    super(gameObject);

    this.bitmaps = bitmapDescription.bitmap;
    this.framePerSecond = bitmapDescription.framePerSecond;
    this.layer = layer;
    this.colorOverrides = colorOverrides;
  }

  public setAnimation(bitmap: number[][][], framePerSecond: number = this.framePerSecond): void {
    this.bitmaps = bitmap;
    this.framePerSecond = framePerSecond;
    this.spriteIndexTime = 0;
  }

  public override update(): void {
    this.spriteIndexTime += this.framePerSecond * this.gameObject.engineState.deltaTime;
    if (this.spriteIndexTime >= this.bitmaps.length) {
      this.spriteIndexTime = this.spriteIndexTime % this.bitmaps.length;
    }

    this.gameObject.engineState.screenBuffer.copy(
      this.bitmaps[Math.floor(this.spriteIndexTime)],
      this.gameObject.position.x,
      this.gameObject.position.y,
      this.layer,
      this.colorOverrides
    );
  }
}
