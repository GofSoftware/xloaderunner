import { Script } from '../../engine/game-object/script';
import { GameObject } from '../../engine/game-object/game-object';

export class RunnerScript extends Script {
  public static create(gameObject: GameObject): RunnerScript {
    return new RunnerScript(gameObject);
  }

  private constructor(gameObject: GameObject) {
    super(gameObject);
  }
}
