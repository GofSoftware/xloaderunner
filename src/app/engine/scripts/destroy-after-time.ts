import { Script } from '../game-object/script';
import { GameObject } from '../game-object/game-object';

export class DestroyAfterTime extends Script {
  public static create(gameObject: GameObject, destroyTime: number): DestroyAfterTime {
    return new DestroyAfterTime(gameObject, destroyTime);
  }

  private constructor(gameObject: GameObject, private destroyTime: number) {
    super(gameObject);
    setTimeout(() => {
      this.gameObject.engineState.removeGameObject(gameObject);
    }, this.destroyTime);
  }
}
