import { Script } from '../game-object/script';
import { GameObject } from '../game-object/game-object';
import { ObjectPosition } from './object-position';
import { Direction, StateScript } from './state-script';
import { TileMap, TileType } from './tile-map';
import { createTileGameObject } from './tile-bitmaps';
import { MapHelper } from './map.helper';
import { CELL_SIZE, SCREEN_WIDTH, UPPER_EFFECT_LAYER } from '../screen/screen.constants';
import { MAX_LIVES } from './lives-script';
import { BitmapSpriteRenderer } from './bitmap-sprite-renderer';
import { OBJECT_HAMMER, OBJECT_SMOKE_UP_1, OBJECT_SMOKE_UP_2, OBJECT_SMOKE_UP_3, OBJECT_SMOKE_UP_4 } from '../../data/sprites';
import { DestroyAfterTime } from './destroy-after-time';

const BUILD_TYPE_BY_KEY: Record<string, TileType> = {
  Digit1: TileType.Brick,
  Digit2: TileType.Stairs,
  Digit3: TileType.Crossbar,
};

const REMOVE_KEY = 'Digit0';

const OFFSET_BY_DIRECTION: Record<Direction, { column: number; row: number }> = {
  [Direction.Left]: { column: -1, row: 0 },
  [Direction.Right]: { column: 1, row: 0 },
  [Direction.Up]: { column: 0, row: -1 },
  [Direction.Down]: { column: 0, row: 1 },
};

/**
 * Lets the player place or clear a tile in the cell they're currently facing: pressing a number key
 * builds that tile type immediately, and pressing 0 removes instead - both act right away, in the
 * direction of the Player's current StateScript.direction (defaulting to Right if there's no
 * StateScript to ask). Only Brick/Stairs/Crossbar tiles can be removed.
 */
export class BuilderScript extends Script {
  public static create(gameObject: GameObject, hudLayer: number): BuilderScript {
    return new BuilderScript(gameObject, hudLayer);
  }

  private readonly hudLayer: number;

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

  private get facingDirection(): Direction {
    return this.gameObject.getScript(StateScript)?.direction ?? Direction.Right;
  }

  public override update(): void {
    this.handleAction();
    this.drawHud();
  }

  private drawHud(): void {
    const { screenBuffer } = this.gameObject.engineState;
    const startX = SCREEN_WIDTH - MAX_LIVES * CELL_SIZE;
    screenBuffer.copy(OBJECT_HAMMER, startX, CELL_SIZE, this.hudLayer);
  }

  private handleAction(): void {
    const { keyboard } = this.gameObject.engineState;
    const { column: columnOffset, row: rowOffset } = OFFSET_BY_DIRECTION[this.facingDirection];

    if (keyboard.wasPressedThisFrame(REMOVE_KEY)) {
      this.remove(columnOffset, rowOffset);
      return;
    }
    for (const [key, type] of Object.entries(BUILD_TYPE_BY_KEY)) {
      if (keyboard.wasPressedThisFrame(key)) {
        this.build(type, columnOffset, rowOffset);
        return;
      }
    }
  }

  private build(type: TileType, columnOffset: number, rowOffset: number): void {
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

  private remove(columnOffset: number, rowOffset: number): void {
    const { column, row } = this.objectPosition;
    const targetColumn = column + columnOffset;
    const targetRow = row + rowOffset;

    if (!this.tileMap.isRemovable(targetColumn, targetRow)) {
      return;
    }

    const tileGameObject = this.gameObject.engineState.getGameObjectByName(`Tile-${targetColumn}-${targetRow}`);
    if (tileGameObject) {
      this.gameObject.engineState.removeGameObject(tileGameObject);
    }
    this.tileMap.setTile(targetColumn, targetRow, TileType.Empty);
  }
}
