import { Script } from '../../engine/game-object/script';
import { GameObject } from '../../engine/game-object/game-object';

export class PlayerScript extends Script {
  public static create(gameObject: GameObject): PlayerScript {
    return new PlayerScript(gameObject);
  }

  private constructor(gameObject: GameObject) {
    super(gameObject);
  }
}
