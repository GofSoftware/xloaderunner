import { Script } from '../game-object/script';
import { GameObject } from '../game-object/game-object';
import { Lives, MAX_LIVES } from '../lives';
import { CELL_SIZE, SCREEN_WIDTH } from '../screen/screen.constants';
import { OBJECT_HEART } from '../../data/sprites';

export class HeartsRenderer extends Script {
  public static create(gameObject: GameObject, lives: Lives, layer: number): HeartsRenderer {
    return new HeartsRenderer(gameObject, lives, layer);
  }

  private readonly lives: Lives;
  private readonly layer: number;

  private constructor(gameObject: GameObject, lives: Lives, layer: number) {
    super(gameObject);

    this.lives = lives;
    this.layer = layer;
  }

  public override update(): void {
    const startX = SCREEN_WIDTH - MAX_LIVES * CELL_SIZE;
    for (let i = 0; i < this.lives.count; i++) {
      this.gameObject.engineState.screenBuffer.copy(OBJECT_HEART, startX + i * CELL_SIZE, 0, this.layer);
    }
  }
}
