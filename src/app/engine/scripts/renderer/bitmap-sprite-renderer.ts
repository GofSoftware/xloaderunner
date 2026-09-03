import { Script } from '../../game-object/script';
import { GameObject } from '../../game-object/game-object';
import { IBitmapAnimationDescription } from '../i-bitmap-animation-description';
import { ColorOverride } from './color-override';

export class BitmapSpriteRenderer extends Script {
  public static create(
    gameObject: GameObject,
    bitmapAnimationDescription: IBitmapAnimationDescription,
    layer: number,
    colorOverrides: ColorOverride[] = [],
  ): BitmapSpriteRenderer {
    return new BitmapSpriteRenderer(gameObject, bitmapAnimationDescription, layer, colorOverrides);
  }

  private bitmaps: number[][][] = [];
  private framePerSecond: number = 1;
  private spriteIndexTime: number = 0;
  private colorOverrides: ColorOverride[] = [];

  private readonly layer: number;

  private constructor(
    gameObject: GameObject,
    bitmapAnimationDescription: IBitmapAnimationDescription,
    layer: number,
    colorOverrides: ColorOverride[],
  ) {
    super(gameObject);

    this.layer = layer;
    this.colorOverrides = colorOverrides;
    this.setAnimation(bitmapAnimationDescription);
  }

  public setAnimation(bitmapAnimationDescription: IBitmapAnimationDescription): void {
    this.bitmaps = bitmapAnimationDescription.bitmap ?? this.bitmaps;
    this.framePerSecond = bitmapAnimationDescription.framePerSecond ?? this.framePerSecond;
    this.spriteIndexTime = bitmapAnimationDescription.spriteIndexTime ?? this.spriteIndexTime;
  }

  public setColorOverrides(colorOverrides: ColorOverride[]): void {
    this.colorOverrides = colorOverrides;
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
      this.colorOverrides,
    );
  }
}
