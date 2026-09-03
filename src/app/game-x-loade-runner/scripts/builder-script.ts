import { Script } from '../../engine/game-object/script';
import { GameObject } from '../../engine/game-object/game-object';
import { ObjectPosition } from './object-position';
import { StateScript } from './state-script';
import { TileMap } from './tile-map/tile-map';
import { createTileGameObject } from '../tile-bitmap-factory';
import { MapHelper } from '../helpers/map.helper';
import { CELL_SIZE, UPPER_EFFECT_LAYER } from '../../engine/screen/screen.constants';
import { BitmapSpriteRenderer } from '../../engine/scripts/renderer/bitmap-sprite-renderer';
import {
  OBJECT_MIRROR_RB,
  OBJECT_BRICK,
  OBJECT_CROSSBAR,
  OBJECT_REMOVE,
  OBJECT_SMOKE_UP_1,
  OBJECT_SMOKE_UP_2,
  OBJECT_SMOKE_UP_3,
  OBJECT_SMOKE_UP_4,
  OBJECT_STAIRS,
} from '../data/sprites';
import { DestroyAfterTime } from '../../engine/scripts/destroy-after-time';
import { TextHelper } from '../../engine/screen/text.helper';
import { TileType } from './tile-map/tile-map-types';
import { MirrorHelper } from './mirror/mirror-helper';
import { Direction } from './state/state-types';

export type BuildableTileType = TileType.Brick | TileType.Stairs | TileType.Crossbar | TileType.MirrorRB;

const BUILD_TYPE_BY_KEY: Record<string, BuildableTileType> = {
  Digit1: TileType.Brick,
  Digit2: TileType.Stairs,
  Digit3: TileType.Crossbar,
  Digit4: TileType.MirrorRB,
};

const REMOVE_KEY = 'Digit0';

const OFFSET_BY_DIRECTION: Record<Direction, { column: number; row: number }> = {
  [Direction.Left]: { column: -1, row: 0 },
  [Direction.Right]: { column: 1, row: 0 },
  [Direction.Up]: { column: 0, row: -1 },
  [Direction.Down]: { column: 0, row: 1 },
};

const BUILD_ORDER: BuildableTileType[] = [TileType.Brick, TileType.Stairs, TileType.Crossbar, TileType.MirrorRB];

const ICON_BY_TYPE: Record<BuildableTileType, number[][]> = {
  [TileType.Brick]: OBJECT_BRICK,
  [TileType.Stairs]: OBJECT_STAIRS,
  [TileType.Crossbar]: OBJECT_CROSSBAR,
  [TileType.MirrorRB]: OBJECT_MIRROR_RB,
};

// Icon (1 cell) + a 2-digit count (2 cells) per HUD item (one per buildable type, plus remove).
const HUD_ITEM_WIDTH = CELL_SIZE * 3;
const MAX_HUD_COUNT = 99;
// One slot past the last buildable type's item.
const REMOVE_HUD_X = BUILD_ORDER.length * HUD_ITEM_WIDTH;

export const DEFAULT_BUILD_COUNTS: Record<BuildableTileType, number> = {
  [TileType.Brick]: 99,
  [TileType.Stairs]: 99,
  [TileType.Crossbar]: 99,
  [TileType.MirrorRB]: 99,
};

export const DEFAULT_REMOVE_COUNT = 99;

/**
 * Lets the player place or clear a tile in the cell they're currently facing: pressing a number key
 * builds that tile type immediately, and pressing 0 removes instead - both act right away, in the
 * direction of the Player's current StateScript.direction (defaulting to Right if there's no
 * StateScript to ask). Only Brick/Stairs/Crossbar tiles can be removed.
 *
 * Each buildable type has a limited supply, shown at the top-left of the HUD as icon + remaining
 * count (capped for display at 99). Building one decrements its type's count (and refuses to build
 * once it reaches 0); removing a previously-placed tile of that type restocks it by one. Removing is
 * itself a limited action, shown the same way with the remove icon - it decrements on every successful
 * removal (and refuses once it reaches 0) but is never restocked.
 */
export class BuilderScript extends Script {
  public static create(
    gameObject: GameObject,
    hudLayer: number,
    counts: Record<BuildableTileType, number> = DEFAULT_BUILD_COUNTS,
    removeCount: number = DEFAULT_REMOVE_COUNT,
  ): BuilderScript {
    return new BuilderScript(gameObject, hudLayer, counts, removeCount);
  }

  private readonly hudLayer: number;
  private readonly counts: Record<BuildableTileType, number>;
  private removeCount: number;

  private constructor(gameObject: GameObject, hudLayer: number, counts: Record<BuildableTileType, number>, removeCount: number) {
    super(gameObject);
    this.hudLayer = hudLayer;
    this.counts = { ...counts };
    this.removeCount = removeCount;
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
    BUILD_ORDER.forEach((type, index) => {
      const x = index * HUD_ITEM_WIDTH;
      screenBuffer.copy(ICON_BY_TYPE[type], x, 0, this.hudLayer);
      this.drawCount(this.counts[type], x + CELL_SIZE);
    });
    screenBuffer.copy(OBJECT_REMOVE, REMOVE_HUD_X, 0, this.hudLayer);
    this.drawCount(this.removeCount, REMOVE_HUD_X + CELL_SIZE);
  }

  private drawCount(value: number, x: number): void {
    const { screenBuffer } = this.gameObject.engineState;
    const count = Math.min(value, MAX_HUD_COUNT).toString().padStart(2, '0');
    TextHelper.print(screenBuffer, count, x, 0, this.hudLayer);
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

  private build(type: BuildableTileType, columnOffset: number, rowOffset: number): void {
    const { column, row } = this.objectPosition;
    const targetColumn = column + columnOffset;
    const targetRow = row + rowOffset;

    if (targetColumn < 0 || targetColumn >= this.tileMap.columns || targetRow < 0 || targetRow >= this.tileMap.rows) {
      return;
    }
    if (this.tileMap.getTile(targetColumn, targetRow) !== TileType.Empty) {
      return;
    }
    if (this.counts[type] <= 0) {
      return;
    }

    this.counts[type]--;
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
    if (this.removeCount <= 0) {
      return;
    }

    let removedType = this.tileMap.getTile(targetColumn, targetRow) as BuildableTileType;
    const tileGameObject = this.gameObject.engineState.getGameObjectByName(`Tile-${removedType}-${targetColumn}-${targetRow}`);
    if (tileGameObject) {
      this.gameObject.engineState.removeGameObject(tileGameObject);
    }
    this.tileMap.setTile(targetColumn, targetRow, TileType.Empty);
    if (MirrorHelper.isMirror(removedType)) {
      removedType = TileType.MirrorRB;
    }
    this.counts[removedType] = Math.min(this.counts[removedType] + 1, MAX_HUD_COUNT);
    this.removeCount--;
  }
}
