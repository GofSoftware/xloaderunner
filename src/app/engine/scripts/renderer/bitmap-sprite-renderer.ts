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
  private oneTime: boolean = false;

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
    this.oneTime = bitmapAnimationDescription.oneTime ?? this.oneTime;
  }

  public setColorOverrides(colorOverrides: ColorOverride[]): void {
    this.colorOverrides = colorOverrides;
  }

  public override update(): void {
    this.spriteIndexTime += this.framePerSecond * this.gameObject.engineState.deltaTime;
    let currentIndex = Math.floor(this.spriteIndexTime);
    if (currentIndex >= this.bitmaps.length) {
      currentIndex = this.oneTime ? this.bitmaps.length - 1 : 0;
      this.spriteIndexTime = this.oneTime
        ? this.bitmaps.length - 1
        : this.spriteIndexTime - Math.floor(this.spriteIndexTime / this.bitmaps.length) * this.bitmaps.length;
    }

    this.gameObject.engineState.screenBuffer.copy(
      this.bitmaps[currentIndex],
      this.gameObject.position.x,
      this.gameObject.position.y,
      this.layer,
      this.colorOverrides,
    );
  }
}
