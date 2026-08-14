import { Script } from '../game-object/script';
import { GameObject } from '../game-object/game-object';
import { TextHelper } from '../screen/text.helper';
import { ITextureEffect } from './effects/i-texture-effect';

export class TextRenderer extends Script {
  public static create(gameObject: GameObject, text: string, layer: number, effects: ITextureEffect[] = []): TextRenderer {
    return new TextRenderer(gameObject, text, layer, effects);
  }

  private readonly text: string;
  private readonly layer: number;
  private readonly effects: ITextureEffect[];

  private constructor(gameObject: GameObject, text: string, layer: number, effects: ITextureEffect[]) {
    super(gameObject);

    this.text = text;
    this.layer = layer;
    this.effects = effects;
  }

  public override update(): void {
    TextHelper.print(
      this.gameObject.engineState.screenBuffer,
      this.text,
      this.gameObject.position.x,
      this.gameObject.position.y,
      this.layer,
      this.effects,
    );
  }
}
