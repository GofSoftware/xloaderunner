import { Script } from '../../../engine/game-object/script';
import { GameObject } from '../../../engine/game-object/game-object';
import { VoidCallback } from '../../data/level/start-menu-level';

export class StartMenuScript extends Script {
  public static create(gameObject: GameObject, continueCallback: VoidCallback): StartMenuScript {
    return new StartMenuScript(gameObject, continueCallback);
  }

  private readonly continueCallback: VoidCallback;

  private constructor(gameObject: GameObject, continueCallback: VoidCallback) {
    super(gameObject);
    this.continueCallback = continueCallback;
  }

  public override update(): void {
    if (this.gameObject.engineState.keyboard.pressedThisRoundCodes.length > 0) {
      this.continueCallback();
    }
  }
}
