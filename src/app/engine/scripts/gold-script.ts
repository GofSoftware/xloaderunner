import { Script } from '../game-object/script';
import { GameObject } from '../game-object/game-object';
import { GoldItem } from './gold-item';
import { TileMap } from './tile-map';
import { ObjectPosition } from './object-position';
import { CELL_SIZE, SCREEN_WIDTH } from '../screen/screen.constants';
import { MAX_LIVES } from './lives-script';
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

  private get tileMap(): TileMap {
    return this.gameObject.engineState.getGameObjectByName('Map')!.getScript(TileMap)!;
  }

  private get objectPosition(): ObjectPosition {
    return this.gameObject.getScript(ObjectPosition)!;
  }

  public get count(): number {
    return this.collected;
  }

  public override update(): void {
    this.collectAtPlayerPosition();
    this.drawHud();
  }

  private collectAtPlayerPosition(): void {
    const objectsHere = this.tileMap.getObjectsAt(this.objectPosition.column, this.objectPosition.row);
    const gold = objectsHere.find((gameObject) => gameObject.getScript(GoldItem));
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
