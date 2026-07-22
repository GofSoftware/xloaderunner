import { Script } from '../game-object/script';
import { GameObject } from '../game-object/game-object';

export class BitmapRenderer extends Script {
  public static create(
    gameObject: GameObject,
    bitmap: number[][]
  ): BitmapRenderer {
    return new BitmapRenderer(gameObject, bitmap);
  }

  private readonly gameObject: GameObject;
  private readonly bitmap: number[][];

  private constructor(gameObject: GameObject, bitmap: number[][]) {
    super();

    this.gameObject = gameObject;
    this.bitmap = bitmap;
  }

  public override update(): void {
    this.gameObject.engineState.screenBuffer.copy(
      this.bitmap,
      this.gameObject.position.x,
      this.gameObject.position.y,
    );
  }
}
