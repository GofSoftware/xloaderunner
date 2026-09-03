import { ILevel } from '../engine/i-level';
import { LEVEL_TILES_ARR } from './data/level';
import { TileMap } from './scripts/tile-map/tile-map';
import { GameObject } from '../engine/game-object/game-object';
import { MapHelper } from './helpers/map.helper';
import { TileType } from './scripts/tile-map/tile-map-types';
import { EmitterManager } from './scripts/emitter/emitter-manager';
import { BackgroundStars } from './scripts/background-stars';
import { BACKGROUND_LAYER, CELL_SIZE, FOREGROUND_LAYER, HUD_LAYER } from '../engine/screen/screen.constants';
import { LinearMoveScript } from '../engine/scripts/linear-move-script';
import { DestroyAfterTime } from '../engine/scripts/destroy-after-time';
import { TextRenderer } from '../engine/scripts/text-renderer';
import { DissolveTextureEffect } from '../engine/scripts/effects/dissolve-texture-effect';
import { LivesScript } from './scripts/lives-script';
import { HeartsRenderer } from './scripts/hearts-renderer';
import { IEngineState } from '../engine/i-engine-state';
import { KeyboardInputScript } from '../engine/scripts/keyboard-input-script';
import { BuilderScript } from './scripts/builder-script';
import { BlastedBrickScript } from './scripts/blasted-brick-script';
import { StateScript } from './scripts/state-script';
import { ObjectPosition } from './scripts/object-position';
import { GoldScript } from './scripts/gold-script';
import { BitmapSpriteRenderer } from '../engine/scripts/renderer/bitmap-sprite-renderer';
import { STAND_ANIMATION } from '../engine/scripts/animations';
import { ENEMY_SPEED_SLOWDOWN, EnemyScript } from './scripts/enemy-script';
import { createTileGameObject } from './tile-bitmap-factory';

export class XLodeRunner implements ILevel {
  public static create(): XLodeRunner {
    return new XLodeRunner();
  }

  private eState: IEngineState | null = null;
  private get engineState(): IEngineState {
    if (this.eState == null) {
      throw new Error('EngineState not initialized');
    }
    return this.eState!;
  }

  private constructor() {}

  public async initialize(engineState: IEngineState): Promise<void> {
    this.eState = engineState;

    const mapGameObject = GameObject.create('Map', engineState, { x: 0, y: 0 }, [(gameObject: GameObject) => TileMap.create(gameObject)]);
    const tileMap = mapGameObject.getScript(TileMap)!;

    LEVEL_TILES_ARR.forEach((value, y) => {
      value.forEach((type, x) => {
        tileMap.setTile(x, y, type);
      });
    });

    const tileGameObjects = tileMap
      .getTiles()
      .map(({ column, row, type }) => createTileGameObject(engineState, column, row, type))
      .filter((gameObject): gameObject is GameObject => gameObject !== undefined);

    const startTile = tileMap.getTiles().find((tile) => tile.type === TileType.PlayerStart);
    const spawnCell = startTile ? { column: startTile.column, row: startTile.row } : { column: 20, row: 5 };
    const spawnPosition = MapHelper.mapToScreen(spawnCell.column, spawnCell.row);
    // PlayerStart has no bitmap and never renders anything, but the tile grid still remembers it as
    // non-Empty - clear it so BuilderScript can build on the spawn cell once the player has moved off it.
    tileMap.setTile(spawnCell.column, spawnCell.row, TileType.Empty);

    [
      mapGameObject,
      // Registers each emitter tile as it starts below, so this must be added - and started - before
      // ...tileGameObjects.
      GameObject.create('Emitters', engineState, { x: 0, y: 0 }, [(gameObject: GameObject) => EmitterManager.create(gameObject)]),
      GameObject.create('Stars', engineState, { x: 0, y: 0 }, [
        (gameObject: GameObject) => BackgroundStars.create(gameObject, BACKGROUND_LAYER),
      ]),
      ...tileGameObjects,
      GameObject.create('Title', engineState, { x: CELL_SIZE * 10, y: CELL_SIZE * 2 }, [
        (gameObject: GameObject) => LinearMoveScript.create(gameObject, { x: 0, y: -1 }, 5),
        (gameObject: GameObject) => DestroyAfterTime.create(gameObject, 5000),
        (gameObject: GameObject) =>
          TextRenderer.create(gameObject, 'xLode Runner', HUD_LAYER, [DissolveTextureEffect.create(engineState, 0.5, (v) => v * v)]),
      ]),
      GameObject.create('Lives', engineState, { x: 0, y: 0 }, [
        (gameObject: GameObject) => LivesScript.create(gameObject),
        (gameObject: GameObject) => HeartsRenderer.create(gameObject, HUD_LAYER),
      ]),

      GameObject.create('Player', engineState, spawnPosition, [
        (gameObject: GameObject) => KeyboardInputScript.create(gameObject),
        // Reads the player's cell before StateScript/ObjectPosition can move it this same frame - otherwise,
        // when the same arrow key both moves the player and specifies a build direction, the build target
        // would be computed from the cell the player is moving into rather than the cell it started this frame in.
        (gameObject: GameObject) => BuilderScript.create(gameObject, HUD_LAYER),
        (gameObject: GameObject) => BlastedBrickScript.create(gameObject),
        (gameObject: GameObject) => StateScript.create(gameObject, spawnCell),
        (gameObject: GameObject) => ObjectPosition.create(gameObject, spawnCell.column, spawnCell.row),
        (gameObject: GameObject) => GoldScript.create(gameObject, FOREGROUND_LAYER),
        (gameObject: GameObject) =>
          BitmapSpriteRenderer.create(
            gameObject,
            { bitmap: STAND_ANIMATION.frames, framePerSecond: STAND_ANIMATION.framesPerSecond },
            HUD_LAYER,
          ),
      ]),

      GameObject.create('Enemy', engineState, MapHelper.mapToScreen(20, 1), [
        (gameObject: GameObject) => EnemyScript.create(gameObject),
        (gameObject: GameObject) => StateScript.create(gameObject, { column: 20, row: 1 }, 1 / ENEMY_SPEED_SLOWDOWN, true),
        (gameObject: GameObject) => ObjectPosition.create(gameObject, 20, 1),
        (gameObject: GameObject) =>
          BitmapSpriteRenderer.create(
            gameObject,
            { bitmap: STAND_ANIMATION.frames, framePerSecond: STAND_ANIMATION.framesPerSecond },
            HUD_LAYER,
            [(color: number) => color & 0xff5a5aff],
          ),
      ]),
    ].forEach((gameObject) => engineState.addGameObject(gameObject));
  }

  public onMoseMove(screenX: number, screenY: number): void {
    this.logTiles(screenX, screenY);
  }

  private logTiles(screenX: number, screenY: number): void {
    const { column, row } = MapHelper.screenToMap(screenX, screenY);
    const mapGameObject = this.engineState.getGameObjectByName('Map')?.getScript(TileMap);
    if (mapGameObject == null) {
      return;
    }
    const tile = mapGameObject.getTile(column, row);
    console.log(
      `Screen coords: x ${screenX} y ${screenY} Map coords: column ${column} row ${row}; Tile: ${tile}`,
      mapGameObject.getObjectsAt(column, row),
    );
  }
}
