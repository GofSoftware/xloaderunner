import { Script } from '../../game-object/script';
import { GameObject } from '../../game-object/game-object';
import { ColorOverride } from './color-override';

export class BitmapRenderer extends Script {
  public static create(gameObject: GameObject, bitmap: number[][], layer: number, colorOverrides: ColorOverride[] = []): BitmapRenderer {
    return new BitmapRenderer(gameObject, bitmap, layer, colorOverrides);
  }

  private bitmap: number[][];
  private readonly layer: number;
  private _colorOverrides: ColorOverride[];

  private constructor(gameObject: GameObject, bitmap: number[][], layer: number, colorOverrides: ColorOverride[]) {
    super(gameObject);

    this.bitmap = bitmap;
    this.layer = layer;
    this._colorOverrides = colorOverrides;
  }

  public setBitmap(bitmap: number[][]): void {
    this.bitmap = bitmap;
  }

  public set colorOverrides(value: ColorOverride[]) {
    this._colorOverrides = value;
  }

  public get colorOverrides(): ColorOverride[] {
    return this._colorOverrides;
  }

  public override update(): void {
    this.gameObject.engineState.screenBuffer.copy(
      this.bitmap,
      this.gameObject.position.x,
      this.gameObject.position.y,
      this.layer,
      this._colorOverrides,
    );
  }
}
