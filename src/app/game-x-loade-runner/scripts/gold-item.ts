import { Script } from '../../engine/game-object/script';
import { GameObject } from '../../engine/game-object/game-object';

/** Marker script - tags a GameObject as a collectible gold star so GoldScript can recognize it via getScript(GoldItem). */
export class GoldItem extends Script {
  public static create(gameObject: GameObject): GoldItem {
    return new GoldItem(gameObject);
  }

  private constructor(gameObject: GameObject) {
    super(gameObject);
  }
}
