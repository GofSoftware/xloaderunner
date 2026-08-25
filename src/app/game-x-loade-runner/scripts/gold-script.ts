import { Script } from '../../engine/game-object/script';
import { GameObject } from '../../engine/game-object/game-object';
import { GoldItem } from './gold-item';
import { TileMap, TileType } from './tile-map';
import { ObjectPosition } from '../../engine/scripts/object-position';
import { CELL_SIZE, SCREEN_WIDTH } from '../../engine/screen/screen.constants';
import { MAX_LIVES } from './lives-script';
import { TextHelper } from '../../engine/screen/text.helper';
import { OBJECT_GOLD, OBJECT_GOLD_HUD } from '../data/sprites';

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
    const { column, row } = this.objectPosition;
    const objectsHere = this.tileMap.getObjectsAt(column, row);
    const gold = objectsHere.find((gameObject) => gameObject.getScript(GoldItem));
    if (!gold) {
      return;
    }
    this.gameObject.engineState.removeGameObject(gold);
    // The tile grid still remembers this cell as Gold independently of the collected GameObject -
    // clear it back to Empty so BuilderScript can build here afterwards.
    this.tileMap.setTile(column, row, TileType.Empty);
    this.collected++;
  }

  private drawHud(): void {
    const { screenBuffer } = this.gameObject.engineState;
    // Cols 0-1 right after the hearts are left blank - the gold icon and count start at cols 2-3.
    const startX = SCREEN_WIDTH - MAX_LIVES * CELL_SIZE + 2 * CELL_SIZE;
    TextHelper.print(screenBuffer, `${this.collected}`, startX + CELL_SIZE, CELL_SIZE, this.hudLayer);
    screenBuffer.copy(OBJECT_GOLD_HUD, startX, CELL_SIZE, this.hudLayer);
  }
}
