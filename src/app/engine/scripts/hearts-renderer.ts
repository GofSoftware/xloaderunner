import { Script } from '../game-object/script';
import { GameObject } from '../game-object/game-object';
import { LivesScript, MAX_LIVES } from './lives-script';
import { CELL_SIZE, SCREEN_WIDTH } from '../screen/screen.constants';
import { OBJECT_HEART } from '../../data/sprites';

export class HeartsRenderer extends Script {
  public static create(gameObject: GameObject, layer: number): HeartsRenderer {
    return new HeartsRenderer(gameObject, layer);
  }

  private readonly layer: number;

  private constructor(gameObject: GameObject, layer: number) {
    super(gameObject);

    this.layer = layer;
  }

  private get lives(): LivesScript {
    return this.gameObject.getScript(LivesScript)!;
  }

  public override update(): void {
    const startX = SCREEN_WIDTH - MAX_LIVES * CELL_SIZE;
    for (let i = 0; i < this.lives.count; i++) {
      this.gameObject.engineState.screenBuffer.copy(OBJECT_HEART, startX + i * CELL_SIZE, 0, this.layer);
    }
  }
}
