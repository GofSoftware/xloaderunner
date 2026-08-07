import { Script } from '../game-object/script';
import { GameObject } from '../game-object/game-object';
import { GoldItem } from './gold-item';
import { CELL_SIZE, SCREEN_WIDTH } from '../screen/screen.constants';
import { MAX_LIVES } from '../lives';
import { TextHelper } from '../screen/text.helper';
import { OBJECT_GOLD, OBJECT_GOLD_HUD } from '../../data/sprites';

export class GoldScript extends Script {
  public static create(gameObject: GameObject, hudLayer: number): GoldScript {
    return new GoldScript(gameObject, hudLayer);
  }

  private readonly hudLayer: number;
  private collected: number = 0;

  private constructor(gameObject: GameObject, hudLayer: number) {
    super(gameObject);
    this.hudLayer = hudLayer;
  }

  public get count(): number {
    return this.collected;
  }

  public override update(): void {
    this.collectAtPlayerPosition();
    this.drawHud();
  }

  private collectAtPlayerPosition(): void {
    const { x, y } = this.gameObject.position;
    const gold = this.gameObject.engineState.getGameObjectsAtPosition(x, y).find((gameObject) => gameObject.getScript(GoldItem));
    if (!gold) {
      return;
    }
    gold.destroy();
    this.collected++;
  }

  private drawHud(): void {
    const { screenBuffer } = this.gameObject.engineState;
    const startX = SCREEN_WIDTH - MAX_LIVES * CELL_SIZE;
    TextHelper.print(screenBuffer, `${this.collected}`, startX + CELL_SIZE, CELL_SIZE, this.hudLayer);
    screenBuffer.copy(OBJECT_GOLD_HUD, startX, CELL_SIZE, this.hudLayer);
  }
}
