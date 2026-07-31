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

  private readonly gameObject: GameObject;
  private readonly bitmap: number[][];
  private readonly layer: number;

  private constructor(gameObject: GameObject, bitmap: number[][], layer: number) {
    super();

    this.gameObject = gameObject;
    this.bitmap = bitmap;
    this.layer = layer;
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
