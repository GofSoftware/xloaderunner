import { Script } from '../game-object/script';
import { GameObject } from '../game-object/game-object';
import { ObjectPosition } from './object-position';
import { StateScript } from './state-script';
import { TileMap, TileType } from './tile-map';
import { createTileGameObject, TILE_BITMAPS } from './tile-bitmaps';
import { MapHelper } from './map.helper';
import { CELL_SIZE, SCREEN_WIDTH, UPPER_EFFECT_LAYER } from '../screen/screen.constants';
import { MAX_LIVES } from './lives-script';
import { BitmapSpriteRenderer } from './bitmap-sprite-renderer';
import {
  OBJECT_HAMMER,
  OBJECT_REMOVE,
  OBJECT_SMOKE_UP_1,
  OBJECT_SMOKE_UP_2,
  OBJECT_SMOKE_UP_3,
  OBJECT_SMOKE_UP_4,
} from '../../data/sprites';
import { DestroyAfterTime } from './destroy-after-time';

const BUILD_TYPE_BY_KEY: Record<string, TileType> = {
  Digit1: TileType.Brick,
  Digit2: TileType.Stairs,
  Digit3: TileType.Crossbar,
};

const REMOVE_KEY = 'Digit0';

const DIRECTION_OFFSET_BY_KEY: Record<string, { column: number; row: number }> = {
  ArrowLeft: { column: -1, row: 0 },
  ArrowRight: { column: 1, row: 0 },
  ArrowUp: { column: 0, row: -1 },
  ArrowDown: { column: 0, row: 1 },
};

const RESET_FORCE_BY_KEY: Record<string, (stateScript: StateScript) => void> = {
  ArrowLeft: (stateScript) => stateScript.forceLeft(false),
  ArrowRight: (stateScript) => stateScript.forceRight(false),
  ArrowUp: (stateScript) => stateScript.forceUp(false),
  ArrowDown: (stateScript) => stateScript.forceDown(false),
};

type ArmedAction = { kind: 'build'; type: TileType } | { kind: 'remove' };

/**
 * Lets the player place or clear a tile next to themselves: pressing a number key arms a tile type to
 * build (pressing the same number again disarms) and pressing 0 arms removal instead; either way, the
 * next arrow key press picks the direction to act in. Acting always disarms afterwards, whether or not
 * the target cell actually changed. Only Brick/Stairs/Crossbar tiles can be removed. The direction key
 * that resolves an armed action also resets that direction's force on StateScript, so the same key
 * press that picked a build/remove direction doesn't also move the player that frame.
 */
export class BuilderScript extends Script {
  public static create(gameObject: GameObject, hudLayer: number): BuilderScript {
    return new BuilderScript(gameObject, hudLayer);
  }

  private readonly hudLayer: number;
  private armed: ArmedAction | undefined;

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

  private get stateScript(): StateScript | undefined {
    return this.gameObject.getScript(StateScript);
  }

  public override update(): void {
    this.handleActionSelection();
    if (this.armed) {
      this.handleDirection();
    }
    this.drawHud();
  }

  private drawHud(): void {
    const { screenBuffer } = this.gameObject.engineState;
    const startX = SCREEN_WIDTH - MAX_LIVES * CELL_SIZE;
    screenBuffer.copy(OBJECT_HAMMER, startX, CELL_SIZE, this.hudLayer);
    if (this.armed?.kind === 'build') {
      screenBuffer.copy(TILE_BITMAPS[this.armed.type]!.staticBitmap!, startX + CELL_SIZE, CELL_SIZE, this.hudLayer);
    } else if (this.armed?.kind === 'remove') {
      screenBuffer.copy(OBJECT_REMOVE, startX + CELL_SIZE, CELL_SIZE, this.hudLayer);
    }
  }

  private handleActionSelection(): void {
    const { keyboard } = this.gameObject.engineState;
    if (keyboard.wasPressedThisFrame(REMOVE_KEY)) {
      this.armed = this.armed?.kind === 'remove' ? undefined : { kind: 'remove' };
      return;
    }
    for (const [key, type] of Object.entries(BUILD_TYPE_BY_KEY)) {
      if (!keyboard.wasPressedThisFrame(key)) {
        continue;
      }
      this.armed = this.armed?.kind === 'build' && this.armed.type === type ? undefined : { kind: 'build', type };
      return;
    }
  }

  private handleDirection(): void {
    const { keyboard } = this.gameObject.engineState;
    for (const [key, offset] of Object.entries(DIRECTION_OFFSET_BY_KEY)) {
      if (!keyboard.wasPressedThisFrame(key)) {
        continue;
      }
      const armed = this.armed!;
      this.armed = undefined;
      if (this.stateScript) {
        RESET_FORCE_BY_KEY[key](this.stateScript);
      }
      if (armed.kind === 'build') {
        this.build(armed.type, offset.column, offset.row);
      } else {
        this.remove(offset.column, offset.row);
      }
      return;
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
