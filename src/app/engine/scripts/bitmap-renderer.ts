import { Script } from '../game-object/script';
import { GameObject } from '../game-object/game-object';

export class BitmapRenderer extends Script {
  public static create(
    gameObject: GameObject,
    bitmap: number[][],
    layer: number,
  ): BitmapRenderer {
    return new BitmapRenderer(gameObject, bitmap, layer);
  }

  private bitmap: number[][];
  private readonly layer: number;

  private constructor(gameObject: GameObject, bitmap: number[][], layer: number) {
    super(gameObject);

    this.bitmap = bitmap;
    this.layer = layer;
  }

  public setBitmap(bitmap: number[][]): void {
    this.bitmap = bitmap;
  }

  public override update(): void {
    this.gameObject.engineState.screenBuffer.copy(
      this.bitmap,
      this.gameObject.position.x,
      this.gameObject.position.y,
      this.layer,
    );
  }
}
