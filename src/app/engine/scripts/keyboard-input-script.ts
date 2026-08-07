import { Script } from '../game-object/script';
import { GameObject } from '../game-object/game-object';
import { StateScript } from './state-script';

export class KeyboardInputScript extends Script {
  public static create(gameObject: GameObject): KeyboardInputScript {
    return new KeyboardInputScript(gameObject);
  }

  private constructor(gameObject: GameObject) {
    super(gameObject);
  }

  public override update(): void {
    const stateScript = this.gameObject.getScript(StateScript);
    if (!stateScript) {
      return;
    }

    const { keyboard } = this.gameObject.engineState;
    if (keyboard.isPressed('ArrowLeft')) {
      stateScript.forceLeft();
    }
    if (keyboard.isPressed('ArrowRight')) {
      stateScript.forceRight();
    }
    if (keyboard.isPressed('ArrowUp')) {
      stateScript.forceUp();
    }
    if (keyboard.isPressed('ArrowDown')) {
      stateScript.forceDown();
    }
  }
}
