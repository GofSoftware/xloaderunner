import { Script } from '../game-object/script';
import { GameObject } from '../game-object/game-object';
import { ObjectPosition } from './object-position';
import { TileMap, TileType } from './tile-map';
import { createTileGameObject, TILE_BITMAPS } from './tile-bitmaps';
import { MapHelper } from './map.helper';
import { CELL_SIZE, SCREEN_WIDTH, UPPER_EFFECT_LAYER } from '../screen/screen.constants';
import { MAX_LIVES } from './lives-script';
import { BitmapSpriteRenderer } from './bitmap-sprite-renderer';
import { OBJECT_HAMMER, OBJECT_SMOKE_UP_1, OBJECT_SMOKE_UP_2, OBJECT_SMOKE_UP_3, OBJECT_SMOKE_UP_4 } from '../../data/sprites';
import { DestroyAfterTime } from './destroy-after-time';

const TILE_TYPE_BY_KEY: Record<string, TileType> = {
  Digit1: TileType.Brick,
  Digit2: TileType.Stairs,
  Digit3: TileType.Crossbar,
};

const DIRECTION_OFFSET_BY_KEY: Record<string, { column: number; row: number }> = {
  ArrowLeft: { column: -1, row: 0 },
  ArrowRight: { column: 1, row: 0 },
  ArrowUp: { column: 0, row: -1 },
  ArrowDown: { column: 0, row: 1 },
};

/**
 * Lets the player place a tile next to themselves: pressing a number key arms the tile type (pressing the
 * same number again disarms), then the next arrow key press picks the direction to build in. Building
 * always disarms afterwards, whether or not the target cell was actually free.
 */
export class BuilderScript extends Script {
  public static create(gameObject: GameObject, hudLayer: number): BuilderScript {
    return new BuilderScript(gameObject, hudLayer);
  }

  private readonly hudLayer: number;
  private armedType: TileType | undefined;

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

  public override update(): void {
    this.handleTypeSelection();
    if (this.armedType) {
      this.handleDirection();
    }
    this.drawHud();
  }

  private drawHud(): void {
    const { screenBuffer } = this.gameObject.engineState;
    const startX = SCREEN_WIDTH - MAX_LIVES * CELL_SIZE;
    screenBuffer.copy(OBJECT_HAMMER, startX, CELL_SIZE, this.hudLayer);
    if (this.armedType) {
      screenBuffer.copy(TILE_BITMAPS[this.armedType]!.staticBitmap!, startX + CELL_SIZE, CELL_SIZE, this.hudLayer);
    }
  }

  private handleTypeSelection(): void {
    const { keyboard } = this.gameObject.engineState;
    for (const [key, type] of Object.entries(TILE_TYPE_BY_KEY)) {
      if (!keyboard.wasPressedThisFrame(key)) {
        continue;
      }
      this.armedType = this.armedType === type ? undefined : type;
      return;
    }
  }

  private handleDirection(): void {
    const { keyboard } = this.gameObject.engineState;
    for (const [key, offset] of Object.entries(DIRECTION_OFFSET_BY_KEY)) {
      if (!keyboard.wasPressedThisFrame(key)) {
        continue;
      }
      this.build(offset.column, offset.row);
      return;
    }
  }

  private build(columnOffset: number, rowOffset: number): void {
    const type = this.armedType!;
    this.armedType = undefined;

    const { column, row } = this.objectPosition;
    const targetColumn = column + columnOffset;
    const targetRow = row + rowOffset;

    if (targetColumn < 0 || targetColumn >= this.tileMap.columns || targetRow < 0 || targetRow >= this.tileMap.rows) {
      return;
    }
    if (this.tileMap.getTile(targetColumn, targetRow) !== TileType.Empty) {
      return;
    }

    this.tileMap.setTile(targetColumn, targetRow, type);
    const tileGameObject = createTileGameObject(this.gameObject.engineState, targetColumn, targetRow, type);
    if (!tileGameObject) {
      return;
    }
    this.gameObject.engineState.addGameObject(tileGameObject);

    const smokeGameObject = GameObject.create(
      `Smoke-${tileGameObject.name}`,
      this.gameObject.engineState,
      MapHelper.mapToScreen(column, row),
      [
        (gameObject) => ObjectPosition.create(gameObject, targetColumn, targetRow),
        (gameObject) =>
          BitmapSpriteRenderer.create(
            gameObject,
            { bitmap: [OBJECT_SMOKE_UP_1, OBJECT_SMOKE_UP_2, OBJECT_SMOKE_UP_3, OBJECT_SMOKE_UP_4], framePerSecond: 10 },
            UPPER_EFFECT_LAYER,
          ),
        (gameObject) => DestroyAfterTime.create(gameObject, 400),
      ],
    );
    if (!smokeGameObject) {
      return;
    }
    this.gameObject.engineState.addGameObject(smokeGameObject);
  }
}
