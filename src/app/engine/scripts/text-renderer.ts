import { Script } from '../game-object/script';
import { GameObject } from '../game-object/game-object';
import { TextHelper } from '../screen/text.helper';

export class TextRenderer extends Script {
  public static create(
    gameObject: GameObject,
    text: string,
    layer: number,
  ): TextRenderer {
    return new TextRenderer(gameObject, text, layer);
  }

  private readonly gameObject: GameObject;
  private readonly text: string;
  private readonly layer: number;

  private constructor(gameObject: GameObject, text: string, layer: number) {
    super();

    this.gameObject = gameObject;
    this.text = text;
    this.layer = layer;
  }

  public override update(): void {
    TextHelper.print(
      this.gameObject.engineState.screenBuffer,
      this.text,
      this.gameObject.position.x,
      this.gameObject.position.y,
      this.layer,
    );
  }
}
