import { Script } from '../game-object/script';
import { GameObject } from '../game-object/game-object';
import { StateScript } from '../../game-x-loade-runner/scripts/state-script';

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
    if (keyboard.wasPressedThisFrame('ArrowLeft')) {
      stateScript.forceLeft(true);
    }
    if (keyboard.wasPressedThisFrame('ArrowRight')) {
      stateScript.forceRight(true);
    }
    if (keyboard.wasPressedThisFrame('ArrowUp')) {
      stateScript.forceUp(true);
    }
    if (keyboard.wasPressedThisFrame('ArrowDown')) {
      stateScript.forceDown(true);
    }
    if (keyboard.wasReleasedThisFrame('ArrowLeft')) {
      stateScript.forceLeft(false);
    }
    if (keyboard.wasReleasedThisFrame('ArrowRight')) {
      stateScript.forceRight(false);
    }
    if (keyboard.wasReleasedThisFrame('ArrowUp')) {
      stateScript.forceUp(false);
    }
    if (keyboard.wasReleasedThisFrame('ArrowDown')) {
      stateScript.forceDown(false);
    }
  }
}
